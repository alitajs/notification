import { Env } from '@/utils/types';
import { ExtendApplication } from '@/extend/application';
import { Application } from 'egg';

export interface EnvExtension {
  (type: Env): boolean;
}

const isEnv = new Map<Env, (app: Application) => boolean>([
  [Env.Production, app => !app.isEnv(Env.Dev) && !app.isEnv(Env.Test)],
  [
    Env.Dev,
    () =>
      `${process.env.NODE_ENV}`.includes('dev') || `${process.env.EGG_SERVER_ENV}`.includes('dev'),
  ],
  [
    Env.Test,
    () =>
      `${process.env.NODE_ENV}`.includes('test') ||
      `${process.env.EGG_SERVER_ENV}`.includes('test'),
  ],
]);

export const extendEnv: ExtendApplication<EnvExtension> = app => {
  return function isEnvType(type: Env) {
    const func = isEnv.get(type);
    return !!func && func(app);
  };
};

extendEnv.cacheKey = Symbol('ExtendEnv');

export default extendEnv;
