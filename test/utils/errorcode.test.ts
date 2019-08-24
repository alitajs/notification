import * as Errcode from '../../app/utils/errorcode';
import assert from 'assert';
import 'mocha';

describe('test erroce', () => {
  it('error code', () => {
    assert(typeof Errcode.ErrCode.Succeed === 'string');
  });

  it('error class extends', () => {
    const unknownError = new Errcode.UnknownError();
    assert(unknownError instanceof Error);
  });
});
