import { SUUID } from '@/utils';
import { Context } from 'egg';

export default () => {
  return async function chore(ctx: Context, next: () => Promise<any>) {
    ctx.request.accountId = null;
    ctx.request.id = SUUID(32);
    ctx.response.set('X-Request-Id', ctx.request.id);
    await next();
  };
};
