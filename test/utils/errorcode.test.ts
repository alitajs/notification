import assert from 'assert';
import 'mocha';
import * as Errcode from '../../app/utils/errorcode';

describe('test erroce', () => {
  it('error code', () => {
    assert(typeof Errcode.ErrCode.Succeed === 'string');
  });

  it('error class extends', () => {
    const unknownError = new Errcode.UnknownError('unknown');
    const serverError = new Errcode.ServerError('server');
    assert(unknownError.errcode === Errcode.ErrCode.Unknown);
    assert(unknownError.message === 'unknown');
    assert(unknownError instanceof Error);
    assert(serverError.errcode === Errcode.ErrCode.ServerError);
    assert(serverError.message === 'server');
    assert(serverError instanceof Errcode.UnknownError);
  });
});
