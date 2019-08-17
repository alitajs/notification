import { lodash, ExtendApplication } from '@/extend/application';
import { createClient, ClientOpts, PromisifiedCommands, RedisClient } from 'redis';
import * as util from 'util';
import CommandsMap from './command.json';

// type CallbackReply<T extends any[]> = T[3] extends Callback<infer U> | undefined
//   ? U
//   : T[2] extends Callback<infer V> | undefined
//   ? V
//   : T[1] extends Callback<infer W> | undefined
//   ? W
//   : T[0] extends Callback<infer X> | undefined
//   ? X
//   : T;

// type PromisifiedRedisClient = {
//   [K in keyof Commands<boolean>]: Commands<boolean>[K] extends (...args: any[]) => any
//     ? (
//         ...args: ArgsType<Commands<boolean>[K]>
//       ) => Promise<CallbackReply<ArgsType<Commands<boolean>[K]>> | null>
//     : Commands<boolean>[K]
// };

export type RedisExtension = PromisifiedCommands & { $: RedisClient };

function promisify($: RedisClient): RedisExtension {
  const client = { $ } as Partial<RedisExtension>;
  CommandsMap.forEach(str => {
    const key = str as keyof PromisifiedCommands;
    if (lodash.isFunction($[key]))
      // @ts-ignore
      client[key] = util.promisify($[key]).bind($);
  });
  return client as RedisExtension;
}

export const extendRedis: ExtendApplication<RedisExtension> = app => {
  const redisOptions: ClientOpts = app.config.redis;
  const client = createClient(redisOptions);
  return promisify(client);
};

extendRedis.cacheKey = Symbol('ExtendReids');

export default extendRedis;
