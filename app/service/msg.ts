import { DefineMsgrepo, Msgrepo } from '@/model/msgrepo';
import { DefineMsgsync, Msgsync } from '@/model/msgsync';
import { validateAttr, validateModel } from '@/utils';
// import { NotFound } from '@/utils/errorcode';
import { ArgsType } from '@/utils/types';
import { Service } from 'egg';
import { Op } from 'sequelize';

export const enum MsgType {
  recall,
  recalled,
}

/**
 * Service of message
 */
export default class MsgService extends Service {
  static MsgIdRedisExpire = 7 * 24 * 60 * 60;
  static MsgSyncChunk = 500;
  static RedisKey = {
    MsgId: (chatId: string) => `msgid:${chatId}`,
  };
  static RetryTimes = {
    SendMsg: 3,
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

  public async insertMsgSync(message: Msgrepo) {
    const members = await this.ctx.model.Chat.findAll({
      attributes: ['accountId'],
      where: { chatId: message.chatId },
    });
    const chunk = this.app.lodash.chunk(members, MsgService.MsgSyncChunk);
    for (const part of chunk) {
      const records: Msgsync[] = part.map(member => ({
        ...message,
        recipientId: member.get('accountId'),
      }));
      await this.ctx.model.Msgsync.bulkCreate(records, { ignoreDuplicates: true });
    }
  }

  public async sendMsg(
    chatId: string,
    content: string,
    deDuplicate: string,
    createTime: number,
    type: number | null = null,
    senderId: string = this.ctx.request.accountId!,
  ) {
    /** validate first and then generate message id */
    const msgInstance: Msgrepo = validateModel(DefineMsgrepo, {
      chatId,
      content,
      createTime,
      deDuplicate,
      senderId,
      type,
    });
    msgInstance.msgId = await this.getNextMsgId(chatId);
    this.insertMsgSync(msgInstance).catch(error => {
      /** insert failed */
      this.ctx.logger.error(error);
    });
    await this.ctx.model.Msgrepo.create(msgInstance).catch(error =>
      this.retry(
        MsgService.RetryTimes.SendMsg,
        this.retryInsertMsgrepo,
        error,
        chatId,
        content,
        deDuplicate,
        createTime,
        type,
        senderId,
      ),
    );
    return msgInstance;
  }

  public async retryInsertMsgrepo(
    chatId: string,
    content: string,
    deDuplicate: string,
    createTime: number,
    type: number | null = null,
    senderId: string = this.ctx.request.accountId!,
  ) {
    const where = validateAttr(DefineMsgrepo, { chatId, createTime, deDuplicate });
    const alreadyExistsOne = await this.ctx.model.Msgrepo.findOne({
      attributes: { exclude: Object.keys(where) },
      where,
    });
    if (alreadyExistsOne) return { ...alreadyExistsOne.get(), ...where } as Msgrepo;

    const unverifiedAttrs = validateAttr(DefineMsgrepo, { content, senderId, type });
    const msgInstance: Msgrepo = {
      ...where,
      ...unverifiedAttrs,
      msgId: await this.getNextMsgId(chatId),
    };
    await this.ctx.model.Msgrepo.create(msgInstance);
    return msgInstance;
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

  private async retry<T extends (...args: any[]) => any, U = any>(
    times: number,
    func: T,
    retryFailed: U,
    ...args: ArgsType<T>
  ): Promise<ReturnType<T>> {
    while (times--) {
      try {
        return await func(...args);
      } catch (retryError) {
        this.ctx.logger.error(retryError);
      }
    }
    throw retryFailed;
  }
}
