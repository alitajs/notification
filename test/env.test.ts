import assert from 'assert';
import 'mocha';

describe('test env', () => {
  it('is unit test', () => {
    assert(process.env.NODE_ENV === 'unittest');
  });
});
