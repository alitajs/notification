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

describe('test controller.admin', () => {
  beforeEach(async () => {
    /** ensure extend.application works */
    await app.hook.onAppReady.wait(app);
  });

  it('test controller.admin', async () => {
    /** initialize */
    const ctx = app.mockContext();

    /** create fake data */
    await Promise.all([
      ctx.service.chat.insertChatMember(mockChatId.A, mockAccountId.C),
      ctx.service.chat.insertChatMember(mockChatId.B, mockAccountId.D),
    ]);

    await Promise.all([
      app
        .httpRequest()
        .post(`/admin/chat/${mockChatId.A}/account/${mockAccountId.C}/type`)
        .send('1')
        .then((res: any) => assert.strictEqual(yaml.safeLoad(res.text), '0')),
      app
        .httpRequest()
        .post(`/admin/chat/${mockChatId.B}/account/${mockAccountId.D}/type`)
        .send('1')
        .then((res: any) => assert.strictEqual(yaml.safeLoad(res.text), '0')),
    ]);

    /** start test methods */
    await Promise.all(
      [
        app
          .httpRequest()
          .post(`/admin/chat/${mockChatId.A}/account/${mockAccountId.E}`)
          .set('X-Response-Body-Format', 'json')
          .expect('X-Error-Code', ErrCode.Succeed),
        app
          .httpRequest()
          .post(`/admin/chat/${mockChatId.B}/account/${mockAccountId.C}`)
          .set('X-Body-Format', 'json')
          .expect('X-Error-Code', ErrCode.Succeed),
        app
          .httpRequest()
          .post(`/admin/chat/spread/read`)
          .send('')
          .expect('X-Error-Code', ErrCode.InvalidParam),
        app
          .httpRequest()
          .del(`/admin/chat/spread/read`)
          .send('')
          .expect('X-Error-Code', ErrCode.InvalidParam),
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
        .post(`/admin/chat/spread/read`)
        .send(yaml.safeDump([mockChatId.A]))
        .then((res: any) => assert.strictEqual(yaml.safeLoad(res.text), 1)),
      app
        .httpRequest()
        .get(`/admin/chat/${mockChatId.A}/has-account/${mockAccountId.C}`)
        .set('X-Body-Format', 'json')
        .then((res: any) => assert.strictEqual(res.text, 'true')),
      app
        .httpRequest()
        .get(`/admin/chat/${mockChatId.A}/all-accounts`)
        .set('X-Body-Format', 'json')
        .then((res: any) => {
          const accounts = res.body.map((ins: any) => ins.accountId);
          const shouldBe = [mockAccountId.C, mockAccountId.E];
          assert.strictEqual(accounts.length, 2);
          assert.strictEqual(app.lodash.without(accounts, ...shouldBe).length, 0);
        }),
      app
        .httpRequest()
        .get(`/admin/chat/${mockChatId.A}/list-accounts`)
        .set('X-Body-Format', 'json')
        .then((res: any) => {
          assert.strictEqual(res.body.count, 2);
          const accounts = res.body.rows.map((ins: any) => ins.accountId);
          const shouldBe = [mockAccountId.C, mockAccountId.E];
          assert.strictEqual(accounts.length, 2);
          assert.strictEqual(app.lodash.without(accounts, ...shouldBe).length, 0);
        }),
    ]);

    await Promise.all(
      [
        app
          .httpRequest()
          .get(`/admin/account/${mockAccountId.D}/all-chats`)
          .set('X-Body-Format', 'json')
          .expect([app.lodash.omit(mockChatInstances[2], 'accountId')]),
        app
          .httpRequest()
          .get(`/admin/account/${mockAccountId.D}/list-chats`)
          .set('X-Body-Format', 'json')
          .expect({ count: 1, rows: [app.lodash.omit(mockChatInstances[2], 'accountId')] }),
        app
          .httpRequest()
          .get(`/admin/chat/spread/read`)
          .set('X-Body-Format', 'json')
          .expect({ chats: [mockChatId.A], nextCursor: null }),
        app
          .httpRequest()
          .del(`/admin/chat/spread/read`)
          .set('X-Body-Format', 'json')
          .send(JSON.stringify([mockChatId.A]))
          .expect('X-Error-Code', ErrCode.Succeed),
      ].map(promisifyTestReq),
    );

    await promisifyTestReq(
      app
        .httpRequest()
        .del(`/admin/chat/${mockChatId.A}/account/${mockAccountId.E}`)
        .set('X-Body-Format', 'json')
        .expect('X-Error-Code', ErrCode.Succeed),
    );
    await promisifyTestReq(
      app
        .httpRequest()
        .del(`/admin/chat/${mockChatId.B}`)
        .set('X-Body-Format', 'json')
        .expect('X-Error-Code', ErrCode.Succeed),
    );
    await promisifyTestReq(
      app
        .httpRequest()
        .del(`/admin/account/${mockAccountId.C}`)
        .set('X-Body-Format', 'json')
        .expect('X-Error-Code', ErrCode.Succeed),
    );

    assert(
      !(await Promise.all([
        ctx.service.chat.isChatMember(mockAccountId.C, mockChatId.A),
        ctx.service.chat.isChatMember(mockAccountId.C, mockChatId.B),
        ctx.service.chat.isChatMember(mockAccountId.D, mockChatId.B),
        ctx.service.chat.isChatMember(mockAccountId.E, mockChatId.A),
      ])).includes(true),
    );
  });
});
