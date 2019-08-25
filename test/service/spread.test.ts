import 'mocha';
import 'tsconfig-paths/register';

import { SUUID } from '@/utils';
import assert from 'assert';
import { app } from 'egg-mock/bootstrap';

describe('test service.spread', () => {
  beforeEach(async () => {
    /** ensure extend.application works */
    await app.hook.onAppReady.wait(app);
  });

  it('message spread mode', async () => {
    /** check the test environment */
    const ctx = app.mockContext();
    const service = ctx.service.spread;
    await app.redis.del('spread:read:chats'); // `SpreadService.RedisKey.ReadSpreadChats`
    const shouldBeEmpty = await service.listReadSpreadChats();
    assert.strictEqual(shouldBeEmpty.nextCursor, null);
    assert.strictEqual(shouldBeEmpty.chats.length, 0);

    /** create fake data and start test methods */
    const mockChatIdList = Array.from({ length: 10 }).map(() => SUUID(22));
    const addedCount = await service.insertReadSpreadChats(...mockChatIdList);
    assert.strictEqual(addedCount, mockChatIdList.length);
    const notReadSpreadChat = SUUID(22);
    const filteredReadSpreadChat = await service.filterIsReadSpread(
      notReadSpreadChat,
      mockChatIdList[0],
    );
    assert.strictEqual(filteredReadSpreadChat.length, 1);
    assert.strictEqual(filteredReadSpreadChat[0], mockChatIdList[0]);
    assert(await service.isReadSpread(mockChatIdList[0]));
    assert(!(await service.isReadSpread(notReadSpreadChat)));
    let [queryAllChatsFromRedis, cursor] = [[], '0'] as [string[], string | null];
    while (cursor !== null) {
      const partOfAll = await service.listReadSpreadChats(cursor);
      queryAllChatsFromRedis = queryAllChatsFromRedis.concat(partOfAll.chats);
      cursor = partOfAll.nextCursor;
    }
    assert.strictEqual(app.lodash.without(mockChatIdList, ...queryAllChatsFromRedis).length, 0);
    const removedCount = await service.removeReadSpreadChats(...mockChatIdList);
    assert.strictEqual(removedCount, mockChatIdList.length);
    const resetMembersCount = await app.redis.scard('spread:read:chats');
    assert.strictEqual(resetMembersCount, 0);
  });
});
