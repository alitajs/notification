import { DefineChat } from '@/model/chat';
import { validateAttr } from '@/utils';
import { Service } from 'egg';

/**
 * Service of spread
 */
export default class SpreadService extends Service {
  static RedisKey = {
    ReadSpreadChats: 'spread:read:chats',
  };

  public async filterIsReadSpread(...chats: string[]) {
    chats = chats.map(chatId => validateAttr(DefineChat, { chatId }).chatId);
    const multi = this.app.redis.$.batch();
    chats.forEach(chatId => multi.sismember(SpreadService.RedisKey.ReadSpreadChats, chatId));
    // promisify(multi.exec).bind(this.app.redis.$)()
    const filterMap = await new Promise<number[]>((resolve, reject) => {
      multi.exec((err, result) => (err ? reject(err) : resolve(result)));
    });
    return chats.filter((_, index) => !!filterMap[index]);
  }

  public async insertReadSpreadChats(...chats: string[]) {
    chats = chats.map(chatId => validateAttr(DefineChat, { chatId }).chatId);
    const addedCount = await this.app.redis.sadd(SpreadService.RedisKey.ReadSpreadChats, chats);
    return addedCount || 0;
  }

  public async isReadSpread(chatId: string) {
    chatId = validateAttr(DefineChat, { chatId }).chatId;
    const isMemberOfReadSpreadChats = await this.app.redis.sismember(
      SpreadService.RedisKey.ReadSpreadChats,
      chatId,
    );
    return !!isMemberOfReadSpreadChats;
  }

  public async listReadSpreadChats(cursor: string | null = '0', count: number = 100) {
    if (cursor === null) {
      return {
        chats: [],
        nextCursor: null,
      };
    }
    const scanResult = await this.app.redis
      .sscan(SpreadService.RedisKey.ReadSpreadChats, cursor, 'COUNT', count.toString())
      .then<[string, string[]]>(maybeNullValue => maybeNullValue || ['0', []]);
    return {
      chats: scanResult[1],
      nextCursor: (scanResult[0] as unknown) === 0 || scanResult[0] === '0' ? null : scanResult[0],
    };
  }

  public async removeReadSpreadChats(...chats: string[]) {
    chats = chats.map(chatId => validateAttr(DefineChat, { chatId }).chatId);
    const removedCount = await this.app.redis.srem(SpreadService.RedisKey.ReadSpreadChats, chats);
    return removedCount || 0;
  }
}
