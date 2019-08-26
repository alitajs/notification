import { ExtendApplication } from '@/extend/application';
import extendAppHook, { AppHookExtension } from './app';
import extendMsgHook, { MsgHookExtension } from './msg';

export interface HookExtension extends AppHookExtension, MsgHookExtension {}

export const extendHook: ExtendApplication<HookExtension> = app => {
  return {
    ...extendAppHook(app),
    ...extendMsgHook(app),
  };
};

extendHook.cacheKey = Symbol('ExtendHook');

export default extendHook;
