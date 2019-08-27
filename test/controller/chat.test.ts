import 'mocha';
import 'tsconfig-paths/register';

import { Chat } from '@/model/chat';
import { SUUID } from '@/utils';
// import { AccessDeny } from '@/utils/errorcode';
// import assert from 'assert';
import { app } from 'egg-mock/bootstrap';

/**
 * - Account C is the admin of Chat A and the member of Chat B,
 * - Account D is the admin of Chat B,
 * - Account E is the member of Chat A,
 */
const mockChatId = {
  A: SUUID(22),
  B: SUUID(22),
};
/**
 * - Account C is the admin of Chat A and the member of Chat B,
 * - Account D is the admin of Chat B,
 * - Account E is the member of Chat A,
 */
const mockAccountId = {
  C: SUUID(18),
  D: SUUID(18),
  E: SUUID(18),
};
const mockChatInstances: Chat[] = [
  {
    accountId: mockAccountId.C,
    chatId: mockChatId.A,
    maxMsgId: 0,
    readMsgId: 0,
    type: 1,
  },
  {
    accountId: mockAccountId.C,
    chatId: mockChatId.B,
    maxMsgId: 0,
    readMsgId: 0,
    type: null,
  },
  {
    accountId: mockAccountId.D,
    chatId: mockChatId.B,
    maxMsgId: 0,
    readMsgId: 0,
    type: 1,
  },
  {
    accountId: mockAccountId.E,
    chatId: mockChatId.A,
    maxMsgId: 0,
    readMsgId: 0,
    type: null,
  },
];

describe('test controller.chat', () => {
  beforeEach(async () => {
    /** ensure extend.application works */
    await app.hook.onAppReady.wait(app);
  });

  it('test controller.chat', async () => {
    /** initialize */
    const ctx = app.mockContext();

    /** create fake data */
    await Promise.all([
      ctx.service.chat.insertChatMember(mockChatId.A, mockAccountId.C),
      ctx.service.chat.insertChatMember(mockChatId.B, mockAccountId.D),
    ]);
    await Promise.all([
      ctx.service.chat.updateChatMemberType(mockChatId.A, mockAccountId.C, 1),
      ctx.service.chat.updateChatMemberType(mockChatId.B, mockAccountId.D, 1),
      ctx.service.chat.updateChatMsgId(mockChatId.A, 4),
      ctx.service.chat.updateChatMsgId(mockChatId.B, 8),
      ctx.service.chat.updateReadMsg(mockChatId.A, mockAccountId.C, 4),
      ctx.service.chat.updateReadMsg(mockChatId.B, mockAccountId.C, 4),
      ctx.service.chat.updateReadMsg(mockChatId.A, mockAccountId.E, 3),
    ]);

    /** start test methods */
    await Promise.all([
      app
        .httpRequest()
        .post(`/chat/${mockChatId.A}/account/${mockAccountId.E}`)
        .set('X-Account-Id', mockAccountId.C)
        .set('X-Body-Format', 'json')
        // TODO .set('Content-Type', 'application/json')
        .send({})
        .expect(mockChatInstances[3]),
      app
        .httpRequest()
        .post(`/chat/${mockChatId.B}/account/${mockAccountId.C}`)
        .set('X-Account-Id', mockAccountId.D)
        .set('X-Body-Format', 'json')
        .send({})
        .expect(mockChatInstances[1]),
    ]);
  });
});
