import 'mocha';
import 'tsconfig-paths/register';

import { Chat } from '@/model/chat';
import { ErrCode, SUUID, promisifyTestReq } from '@/utils';
import assert from 'assert';
import { app } from 'egg-mock/bootstrap';
import yaml from 'js-yaml';

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
    maxMsgId: 4,
    readMsgId: 4,
    type: 1,
  },
  {
    accountId: mockAccountId.C,
    chatId: mockChatId.B,
    maxMsgId: 8,
    readMsgId: 4,
    type: null,
  },
  {
    accountId: mockAccountId.D,
    chatId: mockChatId.B,
    maxMsgId: 8,
    readMsgId: 0,
    type: 1,
  },
  {
    accountId: mockAccountId.E,
    chatId: mockChatId.A,
    maxMsgId: 4,
    readMsgId: 3,
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
    ]);

    /** start test methods */
    await Promise.all(
      [
        app
          .httpRequest()
          .post(`/chat/${mockChatId.A}/account/${mockAccountId.E}`)
          .set('X-Account-Id', mockAccountId.C)
          .set('X-Body-Format', 'json')
          .expect({ ...mockChatInstances[3], maxMsgId: 0, readMsgId: 0 }),
        app
          .httpRequest()
          .post(`/chat/${mockChatId.B}/account/${mockAccountId.C}`)
          .set('X-Account-Id', mockAccountId.D)
          .set('X-Body-Format', 'json')
          .expect({ ...mockChatInstances[1], maxMsgId: 0, readMsgId: 0 }),
      ].map(promisifyTestReq),
    );

    await Promise.all([
      ctx.service.chat.updateChatMsgId(mockChatId.A, 4),
      ctx.service.chat.updateChatMsgId(mockChatId.B, 8),
      ctx.service.chat.updateReadMsg(mockChatId.A, mockAccountId.C, 4),
      ctx.service.chat.updateReadMsg(mockChatId.B, mockAccountId.C, 4),
      ctx.service.chat.updateReadMsg(mockChatId.A, mockAccountId.E, 3),
    ]);

    await Promise.all([
      app
        .httpRequest()
        .get(`/chat/${mockChatId.A}/all-accounts`)
        .set('X-Account-Id', mockAccountId.C)
        .set('X-Body-Format', 'json')
        .then((res: any) => {
          const accounts = res.body.map((ins: any) => ins.accountId);
          const shouldBe = [mockAccountId.C, mockAccountId.E];
          assert.strictEqual(accounts.length, 2);
          assert.strictEqual(app.lodash.without(accounts, ...shouldBe).length, 0);
        }),
      app
        .httpRequest()
        .get(`/chat/${mockChatId.A}/list-accounts`)
        .set('X-Account-Id', mockAccountId.C)
        .set('X-Body-Format', 'json')
        .then((res: any) => {
          assert.strictEqual(res.body.count, 2);
          const accounts = res.body.rows.map((ins: any) => ins.accountId);
          const shouldBe = [mockAccountId.C, mockAccountId.E];
          assert.strictEqual(accounts.length, 2);
          assert.strictEqual(app.lodash.without(accounts, ...shouldBe).length, 0);
        }),
      app
        .httpRequest()
        .get(`/chat/${mockChatId.A}/unread-count`)
        .set('X-Account-Id', mockAccountId.E)
        .set('X-Body-Format', 'json')
        .then((res: any) => assert.strictEqual(res.text, '1')),
    ]);

    await Promise.all(
      [
        app
          .httpRequest()
          .get(`/chat/all-chats`)
          .set('X-Account-Id', mockAccountId.D)
          .set('X-Body-Format', 'json')
          .expect([app.lodash.omit(mockChatInstances[2], 'accountId')]),
        app
          .httpRequest()
          .get(`/chat/list-chats`)
          .set('X-Account-Id', mockAccountId.D)
          .set('X-Body-Format', 'json')
          .expect({ count: 1, rows: [app.lodash.omit(mockChatInstances[2], 'accountId')] }),
        app
          .httpRequest()
          .get(`/chat/${mockChatId.A}/all-accounts`)
          .set('X-Account-Id', mockAccountId.D)
          .set('X-Body-Format', 'json')
          .expect('X-Error-Code', ErrCode.AccessDeny),
        app
          .httpRequest()
          .get(`/chat/all-unread-counts`)
          .set('X-Account-Id', mockAccountId.C)
          .set('X-Body-Format', 'json')
          .expect([{ chatId: mockChatId.B, unread: 4 }]),
        app
          .httpRequest()
          .get(`/chat/list-unread-counts?limit=1`)
          .set('X-Account-Id', mockAccountId.D)
          .set('X-Body-Format', 'json')
          .expect({ count: 1, rows: [{ chatId: mockChatId.B, unread: 8 }] }),
        app
          .httpRequest()
          .del(`/chat/${mockChatId.A}/account/${mockAccountId.E}`)
          .set('X-Account-Id', mockAccountId.E)
          .set('X-Body-Format', 'json')
          .expect('X-Error-Code', ErrCode.AccessDeny),
      ].map(promisifyTestReq),
    );

    await Promise.all([
      app
        .httpRequest()
        .post(`/chat/${mockChatId.B}/account/${mockAccountId.C}/type`)
        .set('X-Account-Id', mockAccountId.D)
        .send('1')
        .then((res: any) => assert.strictEqual(yaml.safeLoad(res.text), '0')),
      app
        .httpRequest()
        .del(`/chat/${mockChatId.A}/account/${mockAccountId.E}`)
        .set('X-Account-Id', mockAccountId.C)
        .set('X-Body-Format', 'json')
        .then((res: any) => assert.strictEqual(res.text, '1')),
    ]);

    assert.strictEqual(
      (await Promise.all([
        ctx.service.chat.isChatMember(mockAccountId.E, mockChatId.A),
        ctx.service.chat.removeAccount(mockAccountId.C),
        ctx.service.chat.removeChat(mockChatId.B),
      ]))[0],
      false,
    );
  });
});
