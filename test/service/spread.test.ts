import assert from 'assert';
import { app } from 'egg-mock/bootstrap';
import 'mocha';
import { SUUID } from '../../app/utils';

describe('test service.spread', () => {
  it('message spread mode', async () => {
    const ctx = app.mockContext();
    await app.redis.del('spread:read:chats'); // `SpreadService.RedisKey.ReadSpreadChats`
    const shouldBeEmpty = await ctx.service.spread.listReadSpreadChats();
    assert.strictEqual(shouldBeEmpty.nextCursor, null);
    assert.strictEqual(shouldBeEmpty.chats.length, 0);
    const mockChatIdList = Array.from({ length: 10 }).map(() => SUUID(22));
    const addedCount = await ctx.service.spread.insertReadSpreadChats(...mockChatIdList);
    assert.strictEqual(addedCount, mockChatIdList.length);
    const notReadSpreadChat = SUUID(22);
    const filteredReadSpreadChat = await ctx.service.spread.filterIsReadSpread(
      notReadSpreadChat,
      mockChatIdList[0],
    );
    assert.strictEqual(filteredReadSpreadChat.length, 1);
    assert.strictEqual(filteredReadSpreadChat[0], mockChatIdList[0]);
    assert(await ctx.service.spread.isReadSpread(mockChatIdList[0]));
    assert(!(await ctx.service.spread.isReadSpread(notReadSpreadChat)));
    let [queryAllChatsFromRedis, cursor] = [[], '0'] as [string[], string | null];
    while (cursor !== null) {
      const partOfAll = await ctx.service.spread.listReadSpreadChats(cursor);
      queryAllChatsFromRedis = queryAllChatsFromRedis.concat(partOfAll.chats);
      cursor = partOfAll.nextCursor;
    }
    assert.strictEqual(app.lodash.difference(mockChatIdList, queryAllChatsFromRedis).length, 0);
    const removedCount = await ctx.service.spread.removeReadSpreadChats(...mockChatIdList);
    assert.strictEqual(removedCount, mockChatIdList.length);
    const resetMembersCount = await app.redis.scard('spread:read:chats');
    assert.strictEqual(resetMembersCount, 0);
  });
});
