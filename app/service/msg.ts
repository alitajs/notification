import { DefineMsgrepo } from '@/model/msgrepo';
import { validateAttr } from '@/utils';
// import { NotFound } from '@/utils/errorcode';
import { Service } from 'egg';

/**
 * Service of message
 */
export default class MsgService extends Service {
  static MsgIdRedisExpire = 7 * 24 * 60 * 60;
  static RedisKey = {
    MsgId: (chatId: string) => `msgid:${chatId}`,
  };

  public async getNextMsgId(chatId: string) {
    chatId = validateAttr(DefineMsgrepo, { chatId }).chatId;
    let nextMsgId = await this.getNextMsgIdFromRedis(chatId);
    if (!nextMsgId) {
      const lastMsgId = await this.getLastMsgIdFromRepo(chatId);
      /**
       * do not increase `lastMsgId` by one and set to redis directly
       * @deprecated
       * const expire = MsgService.MsgIdRedisExpire;
       * nextMsgId = await this.app.redis.setmax([chatId], lastMsgId + 1, expire);
       */
      await this.app.redis.setmax([chatId], lastMsgId);
      nextMsgId = await this.getNextMsgIdFromRedis(chatId);
    }
    return nextMsgId;
  }

  private getNextMsgIdFromRedis(chatId: string) {
    return this.app.redis.increxists([chatId], MsgService.MsgIdRedisExpire);
  }

  private async getLastMsgIdFromRepo(chatId: string): Promise<number> {
    const msgrepo = await this.ctx.model.Msgrepo.findOne({
      attributes: ['msgId'],
      order: [['msgId', 'DESC']],
      where: { chatId },
    });
    return msgrepo ? msgrepo.get('msgId') : 0;
  }
}
