import { ExtendApplication } from '@/extend/application';
import extendAppHook, { AppHookExtension } from './app';

export interface HookExtension extends AppHookExtension {}

export const extendHook: ExtendApplication<HookExtension> = app => {
  return {
    ...extendAppHook(app),
  };
};

extendHook.cacheKey = Symbol('ExtendHook');

export default extendHook;
