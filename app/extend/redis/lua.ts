import { PromisifiedCommands } from 'redis';

export interface LuaScripts {
  increxists: (keys: [string], expire?: number) => Promise<number>;
}

const Scripts: { [key in keyof LuaScripts]: string } = {
  increxists: `
if( redis.call('EXISTS', KEYS[1]) == 1 )
then
  if( ARGV[1] )
  then
    local value = redis.call('INCR', KEYS[1])
    redis.call('EXPIRE', KEYS[1], ARGV[1])
    return value
  else
    return redis.call('INCR', KEYS[1])
  end
else
  return 0
end
`.trim(),
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
        if (await client.script('EXISTS', Scripts[name])) throw error;
        await loadScript(client, name);
        return methods[name](keys, ...args);
      }
    };
  });
  await Promise.all(loadTasks);
  return methods;
}

export default extendLuaScripts;
