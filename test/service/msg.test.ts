import 'mocha';
import 'tsconfig-paths/register';

import MsgService from '@/service/msg';
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
    const ctx = app.mockContext();
    const service = ctx.service.msg;
    const getNextMsgId = service.getNextMsgId.bind(service);
    const originRetryTimes = MsgService.RetryTimes.InsertMsgrepo;

    /** tamper */
    service.getNextMsgId = () => null!;
    MsgService.RetryTimes.InsertMsgrepo = 2;

    /** start test methods */
    assert(
      await service
        .sendMsg(mockChatId, '', SUUID(6), Date.now(), null, SUUID(18))
        .then(() => false)
        .catch(err => !!err),
    );
    app.hook.onInsertMsgrepoRetryThrow(() => {
      service.getNextMsgId = getNextMsgId;
    });
    assert(
      await service
        .sendMsg(mockChatId, '', SUUID(6), Date.now(), null, SUUID(18))
        .then(() => true)
        .catch(err => !err),
    );

    MsgService.RetryTimes.InsertMsgrepo = originRetryTimes;
  });
});
