import 'mocha';
import 'tsconfig-paths/register';

import { MsgType } from '@/service/msg';
import { ErrCode, SUUID, promisifyTestReq } from '@/utils';
import { app } from 'egg-mock/bootstrap';

const mockChatId = SUUID(22);
const mockAccountId = {
  A: SUUID(18),
  B: SUUID(18),
};

describe('test controller.msg', () => {
  beforeEach(async () => {
    /** ensure extend.application works */
    await app.hook.onAppReady.wait(app);
  });

  it('test controller.msg', async () => {
    /** initialize */
    const deDuplicate = [SUUID(6), SUUID(6), SUUID(6)];
    const creationTime = new Map<string, number>(
      deDuplicate.map(str => [str, Date.now() + Math.floor(Math.random() * 10)]),
    );
    const ctx = app.mockContext();

    /** create fake data */
    await Promise.all([
      ctx.service.chat.insertChatMember(mockChatId, mockAccountId.A),
      ctx.service.chat.insertChatMember(mockChatId, mockAccountId.B),
    ]);
    await ctx.service.chat.updateChatMemberType(mockChatId, mockAccountId.B, 1);

    await promisifyTestReq(
      app
        .httpRequest()
        .post(`/chat/${mockChatId}/send/0/${creationTime.get(deDuplicate[0])}/${deDuplicate[0]}`)
        .set('X-Account-Id', mockAccountId.A)
        .set('X-Body-Format', 'json')
        .send('"hello"')
        .expect({
          chatId: mockChatId,
          content: 'hello',
          creationTime: creationTime.get(deDuplicate[0]),
          deDuplicate: deDuplicate[0],
          msgId: 1,
          senderId: mockAccountId.A,
          type: 0,
        }),
    );
    await promisifyTestReq(
      app
        .httpRequest()
        .post(`/chat/${mockChatId}/send-text/${creationTime.get(deDuplicate[1])}/${deDuplicate[1]}`)
        .set('X-Account-Id', mockAccountId.B)
        .set('X-Body-Format', 'json')
        .send('"world"')
        .expect({
          chatId: mockChatId,
          content: 'world',
          creationTime: creationTime.get(deDuplicate[1]),
          deDuplicate: deDuplicate[1],
          msgId: 2,
          senderId: mockAccountId.B,
          type: null,
        }),
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
          .post(`/chat/${mockChatId}/recall/${creationTime.get(deDuplicate[2])}/2`)
          .set('X-Account-Id', mockAccountId.B)
          .set('X-Body-Format', 'json')
          .expect({
            chatId: mockChatId,
            content: '2',
            creationTime: creationTime.get(deDuplicate[2]),
            deDuplicate: '2',
            msgId: 3,
            senderId: mockAccountId.B,
            type: MsgType.recall,
          }),
        app
          .httpRequest()
          .post(`/chat/${mockChatId}/recall/${creationTime.get(deDuplicate[2])}/2`)
          .set('X-Account-Id', mockAccountId.A)
          .set('X-Body-Format', 'json')
          .expect('X-Error-Code', ErrCode.AccessDeny),
      ].map(promisifyTestReq),
    );

    await Promise.all(
      [
        app
          .httpRequest()
          .post(
            `/chat/${mockChatId}/resend/0/${creationTime.get(deDuplicate[0])}/${deDuplicate[0]}`,
          )
          .set('X-Account-Id', mockAccountId.A)
          .set('X-Body-Format', 'json')
          .send('"hello"')
          .expect({
            chatId: mockChatId,
            content: 'hello',
            creationTime: creationTime.get(deDuplicate[0]),
            deDuplicate: deDuplicate[0],
            msgId: 1,
            senderId: mockAccountId.A,
            type: 0,
          }),
        app
          .httpRequest()
          .post(
            `/chat/${mockChatId}/resend-text/${creationTime.get(deDuplicate[1])}/${deDuplicate[1]}`,
          )
          .set('X-Account-Id', mockAccountId.B)
          .set('X-Body-Format', 'json')
          .send('"world"')
          .expect({
            chatId: mockChatId,
            content: 'world',
            creationTime: creationTime.get(deDuplicate[1]),
            deDuplicate: deDuplicate[1],
            msgId: 2,
            senderId: mockAccountId.B,
            type: null,
          }),
        app
          .httpRequest()
          .post(`/chat/${mockChatId}/rerecall/${creationTime.get(deDuplicate[2])}/2`)
          .set('X-Account-Id', mockAccountId.B)
          .set('X-Body-Format', 'json')
          .expect({
            chatId: mockChatId,
            content: '2',
            creationTime: creationTime.get(deDuplicate[2]),
            deDuplicate: '2',
            msgId: 3,
            senderId: mockAccountId.B,
            type: MsgType.recall,
          }),
      ].map(promisifyTestReq),
    );
  });
});
