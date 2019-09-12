import { PromisifiedCommands } from 'redis';
import { Dictionary } from 'lodash';

export interface LuaScripts extends Dictionary<(keys: string[], ...args: any[]) => Promise<any>> {
  /**
   * increase by `1` and return result if the key exists, otherwise return `0`
   */
  incrx: (keys: string[], expire?: number) => Promise<number>;
  /**
   * increase by `1` and return result if the key exists, otherwise the incoming value
   * will be set and then increase by `1`, finally return the result.
   */
  incrsetnx: (keys: string[], value: number, expire?: number) => Promise<number>;
}

const Scripts: { [key in keyof LuaScripts]: string } = {
  incrx: `\
if (redis.call('EXISTS', KEYS[1]) == 1)
then
  if (ARGV[1])
  then
    redis.call('EXPIRE', KEYS[1], ARGV[1])
  end
  return redis.call('INCR', KEYS[1])
else
  return 0
end`,
  incrsetnx: `\
redis.call('SETNX', KEYS[1], ARGV[1])
if (ARGV[2])
then
  redis.call('EXPIRE', KEYS[1], ARGV[2])
end
return redis.call('INCR', KEYS[1])`,
};

const ScriptsSha1 = {} as { [key in keyof LuaScripts]: string };

async function loadScript(client: PromisifiedCommands, name: keyof LuaScripts) {
  ScriptsSha1[name] = await client.script('LOAD', Scripts[name]);
  if (!ScriptsSha1[name] || typeof ScriptsSha1[name] !== 'string')
    throw new Error(`Load redis lua script \`${name}\` failed.`);
}

async function extendLuaScripts(client: PromisifiedCommands) {
  const methods = {} as LuaScripts;
  const luaScriptsName = Object.keys(Scripts) as (keyof LuaScripts)[];
  const loadTasks = luaScriptsName.map(async name => {
    await loadScript(client, name);
    methods[name] = async (keys, ...args) => {
      try {
        return await client.evalsha(
          ScriptsSha1[name],
          keys.length,
          ...keys,
          ...args.map(arg => (arg === undefined ? '' : arg.toString())),
        );
      } catch (error) {
        const [alreadyLoaded] = await client.script('EXISTS', ScriptsSha1[name]);
        if (alreadyLoaded) throw error;
        await loadScript(client, name);
        return methods[name](keys, ...args);
      }
    };
  });
  await Promise.all(loadTasks);
  return methods;
}

export default extendLuaScripts;
