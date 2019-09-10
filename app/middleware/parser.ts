import { Context } from 'egg';
import yaml from 'js-yaml';

export interface ParserConfig {
  /**
   * Parse request body and stringify response body according to this field.
   * @default
   * 'X-Body-Format'
   */
  formatHeader?: string;
  /**
   * Parse request body according to this field.
   * Use the value of header `formatHeader('X-Body-Format')` as fallback.
   * @default
   * 'X-Request-Body-Format'
   */
  requestFormatHeader?: string;
  /**
   * Stringify response body according to this field.
   * Use the value of header `formatHeader('X-Body-Format')` as fallback.
   * @default
   * 'X-Response-Body-Format'
   */
  responseFormatHeader?: string;
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

export default ({
  formatHeader = 'X-Body-Format',
  requestFormatHeader = 'X-Request-Body-Format',
  responseFormatHeader = 'X-Response-Body-Format',
}: ParserConfig = {}) => {
  return async function parser(ctx: Context, next: () => Promise<any>) {
    const formatType = ctx.get(formatHeader);
    const requestFormatType = ctx.get(requestFormatHeader) || formatType;
    const responseFormatType = ctx.get(responseFormatHeader) || formatType;
    reqBody(ctx, requestFormatType.toLowerCase());
    await next();
    resBody(ctx, responseFormatType.toLowerCase());
  };
};
