import { DefineMsgrepo } from '@/model/msgrepo';
import { DefineMsgsync } from '@/model/msgsync';
import { validateAttr } from '@/utils';
// import { NotFound } from '@/utils/errorcode';
import { Service } from 'egg';
import { Op } from 'sequelize';

/**
 * Service of message
 */
export default class MsgService extends Service {
  static MsgIdRedisExpire = 7 * 24 * 60 * 60;
  static RedisKey = {
    MsgId: (chatId: string) => `msgid:${chatId}`,
  };

  /**
   * use `afterMsgId` instead of `offset`
   */
  public getChatHistoryMsgs(chatId: string, afterMsgId: number, limit?: number) {
    const attrs = validateAttr(DefineMsgrepo, { chatId, msgId: afterMsgId });
    return this.ctx.model.Msgrepo.findAll({
      limit,
      where: {
        chatId: attrs.chatId,
        msgId: { [Op.gt]: attrs.msgId },
      },
    });
  }

  /**
   * use `afterTime` instead of `offset`
   */
  public getChatHistoryMsgsByTime(chatId: string, afterTime: number, limit?: number) {
    const attrs = validateAttr(DefineMsgrepo, { chatId, createTime: afterTime });
    return this.ctx.model.Msgrepo.findAll({
      limit,
      where: {
        chatId: attrs.chatId,
        createTime: { [Op.gt]: attrs.createTime },
      },
    });
  }

  public async getNextMsgId(chatId: string) {
    chatId = validateAttr(DefineMsgrepo, { chatId }).chatId;
    let nextMsgId = await this.getNextMsgIdFromRedis(chatId);
    if (!nextMsgId) {
      const lastMsgId = await this.getLastMsgIdFromRepo(chatId);
      /**
       * do not increase `lastMsgId` by one and set to redis directly
       * @deprecated
       * await this.app.redis.set(chatId, lastMsgId + 1);
       */
      nextMsgId = await this.app.redis.incrsetnx([chatId], lastMsgId, MsgService.MsgIdRedisExpire);
    }
    return nextMsgId;
  }

  /**
   * use `afterTime` instead of `offset`
   */
  public getRecentMsgs(recipientId: string, afterTime?: number, limit?: number) {
    const attrs = validateAttr(DefineMsgsync, { createTime: afterTime || 0, recipientId });
    return this.ctx.model.Msgsync.findAll({
      limit,
      where: {
        recipientId: attrs.recipientId,
        createTime: { [Op.gt]: attrs.createTime },
      },
    });
  }

  private getNextMsgIdFromRedis(chatId: string) {
    return this.app.redis.incrx([chatId], MsgService.MsgIdRedisExpire);
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
