import { changeRadix } from '@imhele/radix';
import { MD5, SHA1, SHA256, SHA512, HmacMD5, HmacSHA1, HmacSHA256, HmacSHA512 } from 'crypto-js';
import { Context } from 'egg';
import { Schema } from 'joi';
import { pick, Dictionary } from 'lodash';
import { DatabaseError, Model } from 'sequelize';
import yamlJoi from 'yaml-joi';
import { ArgsType, DefineModel } from './types';

export { changeRadix };
export { default as ErrCode } from './errorcode';

export const HttpMethods = [
  'all',
  'post',
  'get',
  'delete',
  'put',
  'head',
  'options',
  'patch',
  'trace',
  'connect',
] as const;

export function randomStr(): string {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

export function UUID(length = 32, join = ''): string {
  const sec: number = join.length + 4;
  const num: number = Math.ceil(length / sec);
  return Array.from({ length: num })
    .map(randomStr)
    .join(join)
    .slice(0, length);
}

export function SUUID(length = 32): string {
  let uuid: string = '';
  while (uuid.length < length)
    uuid += changeRadix(((1 + Math.random()) * 0x10000) | 0, { fromRadix: 10 });
  return uuid.slice(0, length);
}

export type HashType =
  | 'MD5'
  | 'SHA1'
  | 'SHA256'
  | 'SHA512'
  | 'MD5-HMAC'
  | 'SHA1-HMAC'
  | 'SHA256-HMAC'
  | 'SHA512-HMAC';

export function makeHash(hash: HashType, message: string, key: string = ''): string {
  switch (hash.toUpperCase() as HashType) {
    case 'MD5-HMAC':
      return `${HmacMD5(message, key)}`;
    case 'SHA1':
      return `${SHA1(`${message}${key}`)}`;
    case 'SHA1-HMAC':
      return `${HmacSHA1(message, key)}`;
    case 'SHA256':
      return `${SHA256(`${message}${key}`)}`;
    case 'SHA256-HMAC':
      return `${HmacSHA256(message, key)}`;
    case 'SHA512':
      return `${SHA512(`${message}${key}`)}`;
    case 'SHA512-HMAC':
      return `${HmacSHA512(message, key)}`;
    default:
      return `${MD5(`${message}${key}`)}`;
  }
}

/**
 * Validate model plain object instance with model validator.
 */
export function validate<T>(instance: T, validator: Schema): T {
  const { error, value } = validator.validate(instance);
  if (error) throw error;
  return value;
}

export function validateModel<T>(define: DefineModel<T>, attrs: Partial<T>): T {
  return validate({ ...define.Sample, ...attrs }, define.Validator);
}

export function validateAttr<T, U>(define: DefineModel<T>, attrs: U): U {
  return pick(validateModel(define, attrs), ...Object.keys(attrs)) as U;
}

/**
 * Delete `undefined` valued key in object.
 */
export function delVoid<T>(obj: T): T {
  for (const key in obj) {
    if (obj[key] === undefined) delete obj[key];
  }
  return obj;
}

const paginationValidator = yamlJoi(`
type: object
limitation:
  - keys:
      limit:
        type: number
        isSchema: true
        allowEmpty: nothing
        limitation:
          - min: 1
          - integer: []
      offset:
        type: number
        isSchema: true
        allowEmpty: nothing
        limitation:
          - min: 0
          - integer: []
`);

export function validatePagination(
  ctx: Context,
  obj: Dictionary<any>,
): { limit?: number; offset?: number } {
  return validate(ctx.app.lodash.pick(obj, 'limit', 'offset'), paginationValidator);
}

export async function retryAsync<
  T extends (...args: any[]) => any,
  F = undefined,
  U = any,
  R extends (error: any) => void = (error: any) => void
>(
  times: number,
  func: T,
  args: ArgsType<T>,
  options: { fallback?: F; onRetryThrow?: R; throwOnAllFailed?: U } = {},
): Promise<ReturnType<T> | F> {
  while (times--) {
    try {
      return await func(...args);
    } catch (error) {
      if (!options.onRetryThrow) continue;
      options.onRetryThrow(error);
    }
  }
  if (options.throwOnAllFailed) throw options.throwOnAllFailed;
  return options.fallback!;
}

export function updateEvenIfEmpty(
  this: Model<any, any>,
  ...args: ArgsType<(typeof this)['update']>
): ReturnType<(typeof this)['update']> {
  return this.update(...args).catch(error => {
    if (error instanceof DatabaseError) {
      if (error.message.toLowerCase().includes('query was empty')) {
        return [0, []];
      }
    }
    throw error;
  }) as any;
}

export function extendsModel<T>(model: T): T {
  (model as any).updateEvenIfEmpty = updateEvenIfEmpty;
  return model;
}

export function promisifyTestReq(req: any) {
  return new Promise((res, rej) => req.end((err: any, ret: any) => (err ? rej(err) : res(ret))));
}
