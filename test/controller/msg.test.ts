import 'mocha';
import 'tsconfig-paths/register';

import { Msgrepo } from '@/model/msgrepo';
import { MsgType } from '@/service/msg';
import { ErrCode, SUUID, promisifyTestReq } from '@/utils';
import assert from 'assert';
import { app } from 'egg-mock/bootstrap';

const timestamp = Date.now();
const mockChatId = SUUID(22);
const mockAccountId = {
  A: SUUID(18),
  B: SUUID(18),
};
const msgs: Msgrepo[] = [
  {
    chatId: mockChatId,
    content: 'hello',
    creationTime: timestamp + 4,
    deDuplicate: SUUID(6),
    msgId: 1,
    senderId: mockAccountId.A,
    type: 0,
  },
  {
    chatId: mockChatId,
    content: 'world',
    creationTime: timestamp + 2,
    deDuplicate: SUUID(6),
    msgId: 2,
    senderId: mockAccountId.B,
    type: null,
  },
  {
    chatId: mockChatId,
    content: '2',
    creationTime: timestamp + 1,
    deDuplicate: '2',
    msgId: 3,
    senderId: mockAccountId.B,
    type: MsgType.recall,
  },
  {
    chatId: mockChatId,
    content: 'alita',
    creationTime: timestamp + 3,
    deDuplicate: SUUID(6),
    msgId: 4,
    senderId: mockAccountId.A,
    type: 0,
  },
  {
    chatId: mockChatId,
    content: 'notification',
    creationTime: timestamp,
    deDuplicate: SUUID(6),
    msgId: 5,
    senderId: mockAccountId.B,
    type: null,
  },
  {
    chatId: mockChatId,
    content: '4',
    creationTime: timestamp + 5,
    deDuplicate: '4',
    msgId: 6,
    senderId: mockAccountId.A,
    type: MsgType.recall,
  },
];
const msgsASC = [...msgs].sort((a, b) => a.creationTime - b.creationTime);
const msgsDESC = [...msgsASC].reverse();

describe('test controller.msg', () => {
  beforeEach(async () => {
    /** ensure extend.application works */
    await app.hook.onAppReady.wait(app);
  });

  it('test controller.msg', async () => {
    /** initialize */
    const ctx = app.mockContext();
    ctx.syncedMsgId = 0;
    app.hook.onProtectedInsertMsgsyncFailed((_, msgrepo) => assert.strictEqual(msgrepo, undefined));
    app.hook.onProtectedUpdateChatAndReadMsgIdFailed((_, msgrepo) =>
      assert.strictEqual(msgrepo, undefined),
    );
    app.hook.afterInsertMsgsync((_, msgrepo) => {
      ctx.syncedMsgId = msgrepo.msgId;
    });

    /** create fake data */
    await Promise.all([
      ctx.service.chat.insertChatMember(mockChatId, mockAccountId.A),
      ctx.service.chat.insertChatMember(mockChatId, mockAccountId.B),
    ]);
    await ctx.service.chat.updateChatMemberType(mockChatId, mockAccountId.B, 1);

    await promisifyTestReq(
      app
        .httpRequest()
        .post(`/chat/${mockChatId}/send/0/${msgs[0].creationTime}/${msgs[0].deDuplicate}`)
        .set('X-Account-Id', msgs[0].senderId)
        .set('X-Body-Format', 'json')
        .send(JSON.stringify(msgs[0].content))
        .expect(msgs[0]),
    );
    await promisifyTestReq(
      app
        .httpRequest()
        .post(`/chat/${mockChatId}/send-text/${msgs[1].creationTime}/${msgs[1].deDuplicate}`)
        .set('X-Account-Id', msgs[1].senderId)
        .set('X-Body-Format', 'json')
        .send(JSON.stringify(msgs[1].content))
        .expect(msgs[1]),
    );

    await Promise.all(
      [
        app
          .httpRequest()
          .post(`/chat/${mockChatId}/send/0/${Date.now()}/holder`)
          .set('X-Account-Id', '')
          .set('X-Body-Format', 'none')
          .send('this account does not exists')
          .expect('X-Error-Code', ErrCode.NotFound),
        app
          .httpRequest()
          .post(`/chat/${mockChatId}/send/0/${Date.now()}/holder`)
          .set('X-Account-Id', SUUID(18))
          .set('X-Body-Format', 'none')
          .send('this account is not a member of chat session')
          .expect('X-Error-Code', ErrCode.AccessDeny),
        app
          .httpRequest()
          .post(`/chat/${mockChatId}/recall/${msgs[2].creationTime}/${msgs[2].content}`)
          .set('X-Account-Id', msgs[2].senderId)
          .set('X-Body-Format', 'json')
          .expect(msgs[2]),
        app
          .httpRequest()
          .post(`/chat/${mockChatId}/recall/${msgs[2].creationTime}/${msgs[2].content}`)
          .set('X-Account-Id', mockAccountId.A)
          .set('X-Body-Format', 'json')
          .expect('X-Error-Code', ErrCode.AccessDeny),
      ].map(promisifyTestReq),
    );

    await Promise.all(
      [
        app
          .httpRequest()
          .post(`/chat/${mockChatId}/resend/0/${msgs[0].creationTime}/${msgs[0].deDuplicate}`)
          .set('X-Account-Id', msgs[0].senderId)
          .set('X-Body-Format', 'json')
          .send(JSON.stringify(msgs[0].content))
          .expect(msgs[0]),
        app
          .httpRequest()
          .post(`/chat/${mockChatId}/resend-text/${msgs[1].creationTime}/${msgs[1].deDuplicate}`)
          .set('X-Account-Id', msgs[1].senderId)
          .set('X-Body-Format', 'json')
          .send(JSON.stringify(msgs[1].content))
          .expect(msgs[1]),
        app
          .httpRequest()
          .post(`/chat/${mockChatId}/rerecall/${msgs[2].creationTime}/${msgs[2].content}`)
          .set('X-Account-Id', mockAccountId.B)
          .set('X-Body-Format', 'json')
          .expect(msgs[2]),
      ].map(promisifyTestReq),
    );

    await promisifyTestReq(
      app
        .httpRequest()
        .post(`/chat/${mockChatId}/resend/0/${msgs[3].creationTime}/${msgs[3].deDuplicate}`)
        .set('X-Account-Id', msgs[3].senderId)
        .set('X-Body-Format', 'json')
        .send(JSON.stringify(msgs[3].content))
        .expect(msgs[3]),
    );
    await promisifyTestReq(
      app
        .httpRequest()
        .post(`/chat/${mockChatId}/resend-text/${msgs[4].creationTime}/${msgs[4].deDuplicate}`)
        .set('X-Account-Id', msgs[4].senderId)
        .set('X-Body-Format', 'json')
        .send(JSON.stringify(msgs[4].content))
        .expect(msgs[4]),
    );
    await promisifyTestReq(
      app
        .httpRequest()
        .post(`/chat/${mockChatId}/rerecall/${msgs[5].creationTime}/${msgs[5].content}`)
        .set('X-Account-Id', msgs[5].senderId)
        .set('X-Body-Format', 'json')
        .expect(msgs[5]),
    );

    await new Promise((res, rej) => {
      const timeoutId = setTimeout(() => {
        clearInterval(intervalId);
        rej();
      }, 1000);
      const intervalId = setInterval(() => {
        if (ctx.syncedMsgId !== msgs.length) return res();
        clearTimeout(timeoutId);
        clearInterval(intervalId);
      }, 10);
    });

    await Promise.all(
      [
        app
          .httpRequest()
          .get(`/chat/recent-msgs?limit=3`)
          .set('X-Account-Id', mockAccountId.B)
          .set('X-Body-Format', 'json')
          .expect(msgsDESC.slice(0, 3)),
        app
          .httpRequest()
          .get(`/chat/recent-msgs/after-time/${msgsASC[3].creationTime}?limit=2`)
          .set('X-Account-Id', mockAccountId.A)
          .set('X-Body-Format', 'json')
          .expect(msgsASC.slice(4, 6)),
        app
          .httpRequest()
          .get(`/chat/${mockChatId}/msgs?limit=1`)
          .set('X-Account-Id', mockAccountId.A)
          .set('X-Body-Format', 'json')
          .expect(msgs.slice(5, 6).map(msg => app.lodash.omit(msg, 'chatId'))),
        app
          .httpRequest()
          .get(`/chat/${mockChatId}/msgs/after-id/${msgs[0].msgId}?limit=1`)
          .set('X-Account-Id', mockAccountId.A)
          .set('X-Body-Format', 'json')
          .expect(msgs.slice(1, 2).map(msg => app.lodash.omit(msg, 'chatId'))),
        app
          .httpRequest()
          .get(`/chat/${mockChatId}/msgs/after-time/${msgsASC[1].creationTime}?limit=1`)
          .set('X-Account-Id', mockAccountId.A)
          .set('X-Body-Format', 'json')
          .expect(msgsASC.slice(2, 3).map(msg => app.lodash.omit(msg, 'chatId'))),
        app
          .httpRequest()
          .get(`/chat/${mockChatId}/msgs/before-id/${msgs[3].msgId}?limit=1`)
          .set('X-Account-Id', mockAccountId.A)
          .set('X-Body-Format', 'json')
          .expect(msgs.slice(2, 3).map(msg => app.lodash.omit(msg, 'chatId'))),
      ].map(promisifyTestReq),
    );

    await promisifyTestReq(
      app
        .httpRequest()
        .del(`/admin/chat/${mockChatId}/msg/${msgs[5].msgId}`)
        .set('X-Body-Format', 'json')
        .expect([1, 2]),
    );

    await promisifyTestReq(
      app
        .httpRequest()
        .get(`/chat/${mockChatId}/msgs?limit=1`)
        .set('X-Account-Id', mockAccountId.A)
        .set('X-Body-Format', 'json')
        .expect(msgs.slice(4, 5).map(msg => app.lodash.omit(msg, 'chatId'))),
    );
  });
});
