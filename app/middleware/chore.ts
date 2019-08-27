import { SUUID } from '@/utils';
import { Env } from '@/utils/types';
import { Context } from 'egg';

export default () => {
  return async function chore(ctx: Context, next: () => Promise<any>) {
    if (ctx.app.isEnv(Env.Test)) {
      ctx.request.accountId = ctx.request.get('X-Account-Id');
    } else {
      ctx.request.accountId = null;
    }
    ctx.request.id = SUUID(32);
    ctx.response.set('X-Request-Id', ctx.request.id);
    await next();
  };
};
