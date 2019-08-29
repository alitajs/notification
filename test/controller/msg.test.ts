import 'mocha';
import 'tsconfig-paths/register';

// import { ErrCode, SUUID, promisifyTestReq } from '@/utils';
// import assert from 'assert';
import { app } from 'egg-mock/bootstrap';
// import yaml from 'js-yaml';

// const mockChatId = SUUID(22);
// const mockAccountId = {
//   A: SUUID(18),
//   B: SUUID(18),
// };

describe('test controller.msg', () => {
  beforeEach(async () => {
    /** ensure extend.application works */
    await app.hook.onAppReady.wait(app);
  });

  it('test controller.msg', async () => {
    /** initialize */
    // const ctx = app.mockContext();
    /** create fake data */
  });
});
