import { ExtendApplication } from '@/extend/application';
import { Msgrepo } from '@/model/msgrepo';
import { Context } from 'egg';
import { createHook, Hook } from './utils';

export interface MsgHookExtension {
  /**
   * @callback
   * ```ts
   * function afterInsertMsgsyncCallback(
   *   ctx: egg.Context,
   *   msgrepo: model.Msgrepo,
   *   recipientsId: string[],
   * ) {}
   * ```
   * @example
   * // push notification to iOS
   * APNS.sendNotification(...);
   */
  afterInsertMsgsync: Hook<[Context, Msgrepo, string[]]>;
  /**
   * @callback
   * ```ts
   * function afterInsertMsgsyncAsyncCallback(
   *   ctx: egg.Context,
   *   msgrepo: model.Msgrepo,
   *   recipientsId: string[],
   * ) {}
   * ```
   * @example
   * // push notification to iOS
   * APNS.sendNotification(...);
   */
  afterInsertMsgsyncAsync: Hook<[Context, Msgrepo, string[]]>;
  afterResendMsg: Hook<[Context, Msgrepo]>;
  afterResendMsgAsync: Hook<[Context, Msgrepo]>;
  afterSendMsg: Hook<[Context, Msgrepo]>;
  afterSendMsgAsync: Hook<[Context, Msgrepo]>;
  /**
   * @callback
   * ```ts
   * function onInsertMsgrepoRetryThrowCallback(
   *   ctx: egg.Context,
   *   msgrepo: model.Msgrepo,
   *   error: any,
   * ) {}
   * ```
   */
  onInsertMsgrepoRetryThrow: Hook<[Context, Msgrepo, any]>;
  onProtectedInsertMsgsyncFailed: Hook<[Context, Msgrepo]>;
  onProtectedInsertMsgsyncFailedAsync: Hook<[Context, Msgrepo]>;
  onProtectedUpdateChatAndReadMsgIdFailed: Hook<[Context, Msgrepo]>;
  onProtectedUpdateChatAndReadMsgIdFailedAsync: Hook<[Context, Msgrepo]>;
}

export const extendMsgHook: ExtendApplication<MsgHookExtension> = () => {
  return {
    afterInsertMsgsync: createHook<[Context, Msgrepo, string[]]>(),
    afterInsertMsgsyncAsync: createHook<[Context, Msgrepo, string[]]>(),
    afterResendMsg: createHook<[Context, Msgrepo]>(),
    afterResendMsgAsync: createHook<[Context, Msgrepo]>(),
    afterSendMsg: createHook<[Context, Msgrepo]>(),
    afterSendMsgAsync: createHook<[Context, Msgrepo]>(),
    onInsertMsgrepoRetryThrow: createHook<[Context, Msgrepo, any]>(),
    onProtectedInsertMsgsyncFailed: createHook<[Context, Msgrepo]>(),
    onProtectedInsertMsgsyncFailedAsync: createHook<[Context, Msgrepo]>(),
    onProtectedUpdateChatAndReadMsgIdFailed: createHook<[Context, Msgrepo]>(),
    onProtectedUpdateChatAndReadMsgIdFailedAsync: createHook<[Context, Msgrepo]>(),
  };
};

extendMsgHook.cacheKey = Symbol('ExtendMsgHook');

export default extendMsgHook;
