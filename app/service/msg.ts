import { DefineMsgrepo, Msgrepo } from '@/model/msgrepo';
import { DefineMsgsync, Msgsync } from '@/model/msgsync';
import { retryAsync, validateAttr, validateModel } from '@/utils';
// import { NotFound } from '@/utils/errorcode';
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
  static MsgsyncChunk = 500;
  static RedisKey = {
    MsgId: (chatId: string) => `msgid:${chatId}`,
  };
  static RetryTimes = {
    InsertMsgrepo: 1,
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

  public async insertMsgsync(message: Msgrepo) {
    const members = await this.ctx.model.Chat.findAll({
      attributes: ['accountId'],
      where: { chatId: message.chatId },
    });
    const chunk = this.app.lodash.chunk(members, MsgService.MsgsyncChunk);
    for (const part of chunk) {
      const records: Msgsync[] = part.map(member => ({
        ...message,
        recipientId: member.get('accountId'),
      }));
      await this.ctx.model.Msgsync.bulkCreate(records, { ignoreDuplicates: true });
    }
  }

  public async insertMsgrepo(message: Msgrepo) {
    try {
      return await this.ctx.model.Msgrepo.create(message);
    } catch (error) {
      return await retryAsync(
        MsgService.RetryTimes.InsertMsgrepo,
        this.retryInsertMsgrepo,
        [
          message.chatId,
          message.content,
          message.deDuplicate,
          message.createTime,
          message.type,
          message.senderId,
        ],
        { throwOnAllFailed: error },
      );
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
    await this.insertMsgrepo(msgInstance);
    this.protectedInsertMsgsync(msgInstance);
    return msgInstance;
  }

  public async resendMsg(
    chatId: string,
    content: string,
    deDuplicate: string,
    createTime: number,
    type: number | null = null,
    senderId: string = this.ctx.request.accountId!,
  ) {
    const where = validateAttr(DefineMsgrepo, { chatId, createTime, deDuplicate });
    const alreadyExistsOne = await this.findMsgrepoByDeDuplicateString(where);
    if (alreadyExistsOne) {
      this.protectedInsertMsgsync(alreadyExistsOne);
      return alreadyExistsOne;
    }

    const unverifiedAttrs = validateAttr(DefineMsgrepo, { content, senderId, type });
    const msgInstance: Msgrepo = {
      ...where,
      ...unverifiedAttrs,
      msgId: await this.getNextMsgId(chatId),
    };
    await this.insertMsgrepo(msgInstance);
    this.protectedInsertMsgsync(msgInstance);
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
    const alreadyExistsOne = await this.findMsgrepoByDeDuplicateString(where);
    if (alreadyExistsOne) return alreadyExistsOne;

    const unverifiedAttrs = validateAttr(DefineMsgrepo, { content, senderId, type });
    const msgInstance: Msgrepo = {
      ...where,
      ...unverifiedAttrs,
      msgId: await this.getNextMsgId(chatId),
    };
    await this.ctx.model.Msgrepo.create(msgInstance);
    return msgInstance;
  }

  private async findMsgrepoByDeDuplicateString(where: {
    chatId: string;
    createTime: number;
    deDuplicate: string;
  }) {
    const instanceOrNull = await this.ctx.model.Msgrepo.findOne({
      attributes: { exclude: Object.keys(where) },
      where,
    });
    return instanceOrNull && ({ ...instanceOrNull.get(), ...where } as Msgrepo);
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

  private async protectedInsertMsgsync(message: Msgrepo) {
    // const members = await this.ctx.model.Chat.findAll({
    //   attributes: ['accountId'],
    //   where: { chatId: message.chatId },
    // });
    // const chunk = this.app.lodash.chunk(members, MsgService.MsgsyncChunk);
    // for (const part of chunk) {
    //   try {
    //     const records: Msgsync[] = part.map(member => ({
    //       ...message,
    //       recipientId: member.get('accountId'),
    //     }));
    //     await this.ctx.model.Msgsync.bulkCreate(records, { ignoreDuplicates: true });
    //   } catch (error) {
    //     this.ctx.logger.error(error);
    //   }
    // }
    try {
      return this.insertMsgsync(message);
    } catch (error) {
      return this.ctx.logger.error(error);
    }
  }
}
