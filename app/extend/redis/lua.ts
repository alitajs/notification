import { PromisifiedCommands } from 'redis';

export interface LuaScripts {
  incrifexists: (keys: [string]) => Promise<number>;
}

const Scripts: { [key in keyof LuaScripts]: string } = {
  incrifexists: '',
};

const ScriptsSha1 = {} as { [key in keyof LuaScripts]: string };

async function loadScript(client: PromisifiedCommands, command: keyof LuaScripts) {
  ScriptsSha1[command] = await client.script('LOAD', Scripts[command]);
  if (!ScriptsSha1[command] || typeof ScriptsSha1[command] !== 'string')
    throw new Error(`Load redis lua script \`${command}\` failed.`);
}

async function extendLuaScripts(client: PromisifiedCommands) {
  const methods = {} as LuaScripts;
  const luaCommands = (Object.keys(Scripts) as (keyof LuaScripts)[]).map(async command => {
    await loadScript(client, command);
    methods[command] = async (keys, ...args) => {
      try {
        return await client.evalsha(ScriptsSha1[command], keys.length, ...args);
      } catch (error) {
        if (await client.script('EXISTS', Scripts[command])) throw error;
        await loadScript(client, command);
        return methods[command](keys, ...args);
      }
    };
  });
  await Promise.all(luaCommands);
  return methods;
}

export default extendLuaScripts;
