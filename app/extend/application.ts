import { Application } from 'egg';
import lodash from 'lodash';
import extendEnv, { EnvExtension } from './env';
import extendHook, { HookExtension } from './hook';
import extendRedis, { RedisExtension } from './redis';

export { lodash };

export interface ExtendApplication<T = any> {
  (app: Application): T;
  cacheKey: symbol;
}

interface ApplicationExtension {
  hook: HookExtension;
  isEnv: EnvExtension;
  lodash: typeof lodash;
  noop: () => void;
  redis: RedisExtension;
}

const initQueue: (keyof ApplicationExtension)[] = ['isEnv', 'redis'];

const app: ThisType<Application & { $SYMBOL: any }> & ApplicationExtension = {
  lodash,
  noop: () => void 0,
  get hook() {
    const key = (extendHook.cacheKey as unknown) as '$SYMBOL';
    if (!this[key]) {
      const extension = extendHook(this);
      this[key] = extension;
      extension.onAppReady(() => initQueue.forEach(k => this[k]));
    }
    return this[key];
  },
  get isEnv() {
    const key = (extendEnv.cacheKey as unknown) as '$SYMBOL';
    if (!this[key]) {
      this[key] = extendEnv(this);
    }
    return this[key];
  },
  get redis() {
    const key = (extendRedis.cacheKey as unknown) as '$SYMBOL';
    if (this[key] === null) return null;
    if (!this[key]) {
      this[key] = null;
      this.hook.onAppReady(async () => {
        this[key] = await extendRedis(this);
      });
    }
    return this[key];
  },
};

export default app;
