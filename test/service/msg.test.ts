import 'mocha';
import 'tsconfig-paths/register';

import { Chat } from '@/model/chat';
import { SUUID } from '@/utils';
import assert from 'assert';
import { app } from 'egg-mock/bootstrap';

const mockChatId = SUUID(22);
const mockAccountId = {
  A: SUUID(18),
  B: SUUID(18),
};
const mockChatInstances: Chat[] = [
  {
    accountId: mockAccountId.A,
    chatId: mockChatId,
    maxMsgId: 0,
    readMsgId: 0,
    type: 1,
  },
  {
    accountId: mockAccountId.B,
    chatId: mockChatId,
    maxMsgId: 0,
    readMsgId: 0,
    type: null,
  },
];

describe('test service.msg', () => {
  beforeEach(async () => {
    /** ensure extend.application works */
    await app.hook.onAppReady.wait(app);
  });

  it('test service.msg', async () => {
    /** initialize */
    const ctx = app.mockContext();
    const service = ctx.service.msg;

    /** create fake data */
    await Promise.all(
      mockChatInstances.map(instance =>
        ctx.service.chat.insertChatMember(instance.chatId, instance.accountId),
      ),
    );
    await Promise.all(
      mockChatInstances.map(instance =>
        ctx.service.chat.updateChatMemberType(instance.chatId, instance.accountId, instance.type),
      ),
    );

    /** start test methods */
    assert.strictEqual((await service.listChatHistoryMsgs(mockChatId, 0)).length, 0);
  });
});
