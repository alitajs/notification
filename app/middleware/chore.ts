import { SUUID } from '@/utils';
import { Context } from 'egg';

export interface ChoreConfig {
  /**
   * Default value of `ctx.request.accountId` of every request.
   * @default
   * null
   */
  defaultAccountId?: null | ((ctx: Context) => string | null);
  /**
   * Length of request id.
   * @default
   * 32
   */
  requestIdLength?: number;
}

export default ({ defaultAccountId = null, requestIdLength = 32 }: ChoreConfig = {}) => {
  return async function chore(ctx: Context, next: () => Promise<any>) {
    ctx.request.accountId = defaultAccountId && defaultAccountId(ctx);
    ctx.request.id = SUUID(requestIdLength);
    ctx.response.set('X-Request-Id', ctx.request.id);
    await next();
  };
};
