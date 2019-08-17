import { ErrCode, ServerError, UnknownError } from '@/utils/errorcode';
import { Context } from 'egg';
import { ValidationError } from 'joi';

function isValidationError(ctx: Context, error: Error): error is ValidationError {
  return !!ctx.app.lodash.get(error, 'isJoi');
}

function setErrorHeader(ctx: Context, error: any) {
  // * not instance of Error
  if (!(error instanceof Error)) {
    ctx.response.body = 'system busy';
    ctx.response.set('X-Error-Code', ErrCode.SystemBusy);
    return;
  }

  // * default set to unknown error
  ctx.response.set('X-Error-Code', ErrCode.Unknown);
  ctx.response.body = UnknownError.defaultMsg;

  // * validation error
  if (isValidationError(ctx, error)) {
    ctx.response.body = error.message;
    ctx.response.set('X-Error-Code', ErrCode.InvalidParam);
    return;
  }

  if (!(error instanceof UnknownError)) {
    return;
  }

  // * well-known error with error code
  ctx.response.set('X-Error-Code', error.errcode);
  if (error instanceof ServerError) {
    // prevent leakage of internal error stack
    ctx.response.body = ServerError.defaultMsg;
  } else {
    ctx.response.body = error.message;
  }
}

export default () => {
  return async function errorcode(ctx: Context, next: () => Promise<any>) {
    try {
      await next();
      ctx.response.set('X-Error-Code', ErrCode.Succeed);
    } catch (error) {
      setErrorHeader(ctx, error);
    }
  };
};
