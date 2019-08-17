import { changeRadix } from '@imhele/radix';
import { MD5, SHA1, SHA256, SHA512, HmacMD5, HmacSHA1, HmacSHA256, HmacSHA512 } from 'crypto-js';
import { Context } from 'egg';
import { Schema } from 'joi';
import { Dictionary } from 'lodash';
import { getObjectSearchKeys } from 'object-search-key';
import { WhereOptions } from 'sequelize';
import yamlJoi, { JoiSchema } from 'yaml-joi';
import { DefineModelAttr } from './types';

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

export function extractDefaultValue<T>(attrDefinition: DefineModelAttr<T>): Partial<T> {
  const ret: Partial<T> = {};
  // tslint:disable-next-line: forin
  for (const key in attrDefinition) {
    ret[key] = attrDefinition[key].defaultValue;
  }
  return ret;
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

const integerValidator = yamlJoi(`
type: number
limitation:
  - integer: []
`);

export const validateInt = (...args: any[]): (number | undefined)[] =>
  args.map(input => {
    if (!input && typeof input !== 'number') return undefined;
    return validate(input, integerValidator);
  });

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
          - max: 100
          - integer: []
          - default: 10
      offset:
        type: number
        isSchema: true
        allowEmpty: nothing
        limitation:
          - min: 0
          - integer: []
          - default: 0
`);

export function validatePagination(
  ctx: Context,
  obj: Dictionary<any>,
): { limit: number; offset: number } {
  return validate(ctx.app.lodash.pick(obj, 'limit', 'offset'), paginationValidator);
}

export function generateSearchOr<T>(
  schema: string | JoiSchema,
  searchInput: string,
  includeKeys?: (keyof T)[],
  excludeKeys?: (keyof T)[],
) {
  let search = getObjectSearchKeys(schema, searchInput.split(/(?:\s*)/));
  if (includeKeys) {
    const includeSearch = {} as typeof search;
    (includeKeys as string[]).forEach(key => (includeSearch[key] = search[key]));
    search = includeSearch;
  }
  if (excludeKeys) {
    (excludeKeys as string[]).forEach(key => delete search[key]);
  }
  const or = Object.entries(search).reduce(
    (prev, curr) => {
      const [key, value] = curr as [keyof T, (string | number)[]];
      return prev.concat(value.map(searchKey => ({ [key]: `%${searchKey}%` })));
    },
    [] as Dictionary<string | number>[],
  );
  return or as WhereOptions<T>[];
}
