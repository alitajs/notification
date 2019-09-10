import 'mocha';
import 'tsconfig-paths/register';

import { SUUID } from '@/utils';
import assert from 'assert';
import { app } from 'egg-mock/bootstrap';

const mockChatId = SUUID(22);

describe('test service.msg', () => {
  beforeEach(async () => {
    /** ensure extend.application works */
    await app.hook.onAppReady.wait(app);
  });

  it('test service.msg', async () => {
    /** initialize */
    const ctx = app.mockContext({
      request: { accountId: SUUID(18) },
    });
    const service = ctx.service.msg;

    /** start test methods */
    await ctx.service.spread.insertReadSpreadChats(mockChatId);
    assert.doesNotReject(service.sendMsg(mockChatId, '', SUUID(6), Date.now(), null));
    assert.rejects(service.sendMsg(mockChatId, '', SUUID(6), Date.now(), Math.pow(2, 32)));
  });
});
