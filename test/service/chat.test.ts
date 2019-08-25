import { Chat } from '@/model/chat';
import { SUUID } from '@/utils';
import assert from 'assert';
import { app } from 'egg-mock/bootstrap';
import 'mocha';

const mockChatId = {
  A: SUUID(22),
  B: SUUID(22),
};
const mockAccountId = {
  C: SUUID(18),
  D: SUUID(18),
  E: SUUID(18),
};
/**
 * - Account C is the admin of Chat A and the member of Chat B,
 * - Account D is the admin of Chat B,
 * - Account E is the member of Chat A,
 */
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

describe('test service.chat', () => {
  it('test service.chat', async () => {
    /** initialize */
    const ctx = app.mockContext();
    const { without } = app.lodash;
    const service = ctx.service.chat;

    /** create fake data */
    await Promise.all(
      mockChatInstances.map(instance =>
        service.insertChatMember(instance.chatId, instance.accountId),
      ),
    );
    await Promise.all(
      mockChatInstances.map(instance =>
        service.updateChatMemberType(instance.chatId, instance.accountId, instance.type),
      ),
    );

    /** start test methods */
    assert(await service.chatMemberHasType(mockChatId.A, mockAccountId.C, 1));
    assert(!(await service.chatMemberHasType(mockChatId.B, mockAccountId.C, 2)));
    assert(await service.chatMemberHasType(mockChatId.B, mockAccountId.D, 3));
    assert(await service.isChatMember(mockAccountId.D, mockChatId.B));

    const chatsOfAccountD = await service
      .getAllAccountChats(mockAccountId.D)
      .then(instances => instances.map(instance => instance.get('chatId') as string));
    assert.strictEqual(chatsOfAccountD.length, 1);
    assert.strictEqual(chatsOfAccountD[0], mockChatId.B);

    const accountsOfChatA = await service
      .getAllChatMembers(mockChatId.A)
      .then(instances => instances.map(instance => instance.get('accountId') as string));
    assert.strictEqual(accountsOfChatA.length, 2);
    assert.strictEqual(without(accountsOfChatA, mockAccountId.C, mockAccountId.E).length, 0);

    const chatsOfAccountC = await service.listAccountChats(mockAccountId.C, 1);
    assert.strictEqual(chatsOfAccountC.count, 2);
    assert.strictEqual(chatsOfAccountC.rows.length, 1);

    const accountsOfChatB = await service.listChatMembers(mockChatId.B, 1);
    assert.strictEqual(accountsOfChatB.count, 2);
    assert.strictEqual(accountsOfChatB.rows.length, 1);

    await Promise.all([
      service.updateChatMsgId(mockChatId.A, 4),
      service.updateChatMsgId(mockChatId.B, 8),
      service.updateReadMsg(mockChatId.A, mockAccountId.C, 4),
      service.updateReadMsg(mockChatId.B, mockAccountId.C, 4),
      service.updateReadMsg(mockChatId.A, mockAccountId.E, 3),
    ]);

    const unreadCountsOfAccountC = await service
      .getAllUnreadCounts(mockAccountId.C)
      .then(counts => counts.filter(count => !!count.unread));
    assert.strictEqual(unreadCountsOfAccountC.length, 1);
    assert.strictEqual(unreadCountsOfAccountC[0].chatId, mockChatId.B);
    assert.strictEqual(await service.getUnreadCount(mockChatId.A, mockAccountId.E), 1);
    const unreadCountsOfAccountD = await service.listUnreadCounts(mockAccountId.D, 1);
    assert.strictEqual(unreadCountsOfAccountD.count, 1);
    assert.strictEqual(unreadCountsOfAccountD.rows[0].unread, 8);

    const msgUnreadAccounts = await service.getMsgUnreadAccounts(mockChatId.B, 4);
    assert.strictEqual(msgUnreadAccounts.length, 1);
    assert.strictEqual(msgUnreadAccounts[0], mockAccountId.D);

    const removedMemberCounts = await service.removeChatMember(mockChatId.A, mockAccountId.E);
    assert.strictEqual(removedMemberCounts, 1);
    assert(!(await service.isChatMember(mockAccountId.E, mockChatId.A)));
    assert.strictEqual(await service.removeAccount(mockAccountId.C), 2);
    assert(await service.isChatMember(mockAccountId.D, mockChatId.B));
    assert.strictEqual(await service.removeChat(mockChatId.B), 1);
    assert(!(await service.isChatMember(mockAccountId.D, mockChatId.B)));
  });
});
