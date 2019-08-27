import 'mocha';
import 'tsconfig-paths/register';

import * as Errcode from '@/utils/errorcode';
import assert from 'assert';

describe('test erroce', () => {
  it('error code', () => {
    assert(typeof Errcode.ErrCode.Succeed === 'string');
  });

  it('error class extends', () => {
    const unknownError = new Errcode.UnknownError('unknown');
    const serverError = new Errcode.ServerError('server');
    assert.strictEqual(unknownError.errcode, Errcode.ErrCode.Unknown);
    assert.strictEqual(unknownError.message, 'unknown');
    assert(unknownError instanceof Error);
    assert.strictEqual(serverError.errcode, Errcode.ErrCode.ServerError);
    assert.strictEqual(serverError.message, 'server');
    assert(serverError instanceof Errcode.UnknownError);
  });

  it('error messages', () => {
    assert.strictEqual(new Errcode.UnknownError().message, Errcode.UnknownError.defaultMsg);
    assert.strictEqual(new Errcode.AuthError('').message, '');
    assert.strictEqual(new Errcode.AccessDeny().message, Errcode.AccessDeny.defaultMsg);
    assert.strictEqual(new Errcode.NotFound().message, Errcode.NotFound.defaultMsg);
    assert.strictEqual(new Errcode.ValidationError().message, Errcode.ValidationError.defaultMsg);
    assert.strictEqual(new Errcode.ValidationError('').annotate(), '');
    assert.strictEqual(new Errcode.ValidationError('').isJoi, true);
    assert.strictEqual(new Errcode.ServerError().message, Errcode.ServerError.defaultMsg);
    assert.strictEqual(new Errcode.DatabaseError().message, Errcode.DatabaseError.defaultMsg);
  });
});
