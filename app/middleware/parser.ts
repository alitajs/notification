import { Context } from 'egg';
import yaml from 'js-yaml';

export interface ParserConfig {
  /**
   * Parse request body and stringify response body according to this field.
   * @default
   * 'X-Body-Format'
   */
  formatHeader?: string;
}

function reqBody(ctx: Context, formatType: string) {
  try {
    if (typeof ctx.request.body !== 'string') {
      try {
        const buffer = ctx.req.read();
        ctx.request.body = buffer && `${buffer}`;
      } catch {}
    }
    if (!ctx.request.body) return;
    if (typeof ctx.request.body !== 'string') return;
    switch (formatType) {
      case 'json':
        ctx.request.body = JSON.parse(ctx.request.body);
        break;
      case 'none':
        break;
      default:
        ctx.request.body = yaml.safeLoad(ctx.request.body);
        break;
    }
  } catch {}
}

function resBody(ctx: Context, formatType: string) {
  try {
    if (typeof ctx.body === 'undefined') return;
    switch (formatType) {
      case 'json':
        ctx.body = JSON.stringify(ctx.body);
        break;
      case 'none':
        break;
      default:
        ctx.body = yaml.safeDump(ctx.body);
        break;
    }
  } catch {}
}

export default ({ formatHeader = 'X-Body-Format' }: ParserConfig = {}) => {
  return async function parser(ctx: Context, next: () => Promise<any>) {
    const formatType = ctx.get(formatHeader).toLowerCase();
    reqBody(ctx, formatType);
    await next();
    resBody(ctx, formatType);
  };
};
