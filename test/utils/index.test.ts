import 'mocha';
import 'tsconfig-paths/register';

import { DefineChat } from '@/model/chat';
import * as utils from '@/utils';
import assert from 'assert';
import { app } from 'egg-mock/bootstrap';
import yamlJoi from 'yaml-joi';

describe('test utils', () => {
  it('exports', () => {
    assert(!!utils.changeRadix);
    assert(!!utils.HttpMethods);
  });

  it('randomStr && UUID', () => {
    assert.notStrictEqual(utils.randomStr(), utils.randomStr());
    assert.notStrictEqual(utils.UUID(), utils.UUID());
    assert.strictEqual(utils.UUID(16).length, 16);
    assert(utils.UUID(16, '-').includes('-'));
    assert.notStrictEqual(utils.SUUID(), utils.SUUID());
    assert.strictEqual(utils.SUUID(16).length, 16);
  });

  it('hash', () => {
    assert(utils.makeHash('MD5', 'abc').startsWith('900150983cd24fb0'));
    assert(utils.makeHash('MD5-HMAC', 'abc', 'def').startsWith('fddbd02c4cad1ec0'));
    assert(utils.makeHash('SHA1', 'abc').startsWith('a9993e364706816a'));
    assert(utils.makeHash('SHA1-HMAC', 'abc', 'def').startsWith('7584ee14493072cd'));
    assert(utils.makeHash('SHA256', 'abc').startsWith('ba7816bf8f01cfea'));
    assert(utils.makeHash('SHA256-HMAC', 'abc', 'def').startsWith('397f467341e4d78c'));
    assert(utils.makeHash('SHA512', 'abc').startsWith('ddaf35a193617aba'));
    assert(utils.makeHash('SHA512-HMAC', 'abc', 'def').startsWith('17111e70f32d48a3'));
  });

  it('validate', () => {
    const schema = yamlJoi(`
type: object
isSchema: true
limitation:
  - keys:
      name:
        type: string
        isSchema: true
        limitation:
          - max: 4
`);
    assert.throws(() => utils.validate({ name: '12345' }, schema));
    assert.strictEqual(utils.validate({ name: 'abc' }, schema).name, 'abc');
    assert.throws(() => utils.validateAttr(DefineChat, { msgId: 'a string' }));
    const validatedAtttrs = utils.validateAttr(DefineChat, { maxMsgId: 0 });
    assert.strictEqual(Object.keys(validatedAtttrs).length, 1);
    assert.strictEqual(validatedAtttrs.maxMsgId, 0);
    assert.strictEqual(utils.validateModel(DefineChat, {}).chatId, DefineChat.Sample.chatId);
    assert.deepStrictEqual(
      utils.validatePagination(app.mockContext(), { limit: '10', offset: 0 }),
      { limit: 10, offset: 0 },
    );
  });

  it('del undefined', () => {
    const obj = { a: undefined, b: 0, c: null };
    const copy = { ...obj };
    utils.delVoid(obj);
    assert(!('a' in obj));
    assert(obj.b === copy.b && obj.c === copy.c);
  });

  it('retry', async () => {
    const func = (willThrow: boolean) => {
      if (willThrow) throw 0;
      return 1;
    };
    let throwTimes = 0;
    assert.strictEqual(await utils.retryAsync(1, func, [false]), 1);
    assert.strictEqual(
      await utils.retryAsync(2, func, [true], {
        onRetryThrow: error => ++throwTimes && assert.strictEqual(error, 0),
      }),
      undefined,
    );
    await utils
      .retryAsync(1, func, [true], { throwOnAllFailed: 2 })
      .catch(error => ++throwTimes && assert.strictEqual(error, 2));
    assert.strictEqual(throwTimes, 3);
  });
});
