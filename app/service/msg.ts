import { DefineMsgrepo, Msgrepo } from '@/model/msgrepo';
import { DefineMsgsync, Msgsync } from '@/model/msgsync';
import { retryAsync, validateAttr, validateModel } from '@/utils';
// import { NotFound } from '@/utils/errorcode';
import { Service } from 'egg';
import { Op } from 'sequelize';

export const enum MsgType {
  PLACE_HOLDER,
  recall,
  recalled,
}

/**
 * - list recent messages of an account
 * - list messages history of a chat session
 * - resend message
 * - send message
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
   * Get a strictly self-increasing message id.
   * @description
   * Try to get next id from *redis* by `INCR` command first, if it fails,
   * the last message id will be found from the message persistent repository
   * and written to *redis*, and then get from *redis* by `INCR` command again.
   */
  public async getNextMsgId(chatId: string) {
    chatId = validateAttr(DefineMsgrepo, { chatId }).chatId;
    let nextMsgId = await this.getNextMsgIdFromRedis(chatId);
    if (!nextMsgId) {
      /**
       * do not increase `lastMsgId` by one and set to redis directly
       * @deprecated
       * await this.app.redis.set(chatId, lastMsgId + 1);
       */
      const lastMsgId = await this.getLastMsgIdFromRepo(chatId);
      nextMsgId = await this.app.redis.incrsetnx([chatId], lastMsgId, MsgService.MsgIdRedisExpire);
    }
    return nextMsgId;
  }

  /**
   * List the history message records of a chat session after **specific message id**.
   * @description
   * Use `afterMsgId` instead of `offset`.
   */
  public listChatHistoryMsgs(chatId: string, afterMsgId: number, limit?: number) {
    const attrs = validateAttr(DefineMsgrepo, { chatId, msgId: afterMsgId });
    return this.ctx.model.Msgrepo.findAll({
      limit,
      order: [['msgId', 'ASC']],
      where: {
        chatId: attrs.chatId,
        msgId: { [Op.gt]: attrs.msgId },
      },
    });
  }

  /**
   * List the history message records of a chat session after **specific create time**.
   * @description
   * Use `afterTime` instead of `offset`.
   */
  public listChatHistoryMsgsByTime(chatId: string, afterTime: number, limit?: number) {
    const attrs = validateAttr(DefineMsgrepo, { chatId, creationTime: afterTime });
    return this.ctx.model.Msgrepo.findAll({
      limit,
      order: [['creationTime', 'ASC']],
      where: {
        chatId: attrs.chatId,
        creationTime: { [Op.gt]: attrs.creationTime },
      },
    });
  }

  /**
   * List the recent message records of an account.
   * @description
   * Use `afterTime` instead of `offset`.
   * Can be used to get all messages after a certain `creationTime` in full.
   */
  public listRecentMsgs(recipientId: string, afterTime?: number, limit?: number) {
    const attrs = validateAttr(DefineMsgsync, { creationTime: afterTime || 0, recipientId });
    return this.ctx.model.Msgsync.findAll({
      limit,
      order: [['creationTime', 'ASC']],
      where: {
        recipientId: attrs.recipientId,
        creationTime: { [Op.gt]: attrs.creationTime },
      },
    });
  }

  /**
   * List the recent message records of an account quantitatively.
   * @description
   * This function will find messages in order of `creationTime` from large to small.
   */
  public listRecentMsgsQuantitatively(recipientId: string, limit?: number) {
    recipientId = validateAttr(DefineMsgsync, { recipientId }).recipientId;
    return this.ctx.model.Msgsync.findAll({
      limit,
      order: [['creationTime', 'DESC']],
      where: { recipientId },
    });
  }

  /**
   * Only for scenes such as deleting sensitive content. However, in non-special cases,
   * it is suggested to implement it in a way similar to recall message.
   */
  public removeMsg(chatId: string, msgId: number) {
    const where = validateAttr(DefineMsgrepo, { chatId, msgId });
    return Promise.all([
      this.ctx.model.Msgrepo.destroy({ where }),
      this.ctx.model.Msgsync.destroy({ where }),
    ]);
  }

  /**
   * Resend one message.
   * @description
   * Check whether the message has been successfully written to the message persistent repository
   * according to `creationTime` and `deDuplicate` first, and then rewrite it if not. Whether it has
   * been successfully written before or not, it will rewrite to the message synchronization repository
   * asynchronously (ignoring duplicate data).
   */
  public async resendMsg(
    chatId: string,
    content: string,
    deDuplicate: string,
    creationTime: number,
    type: number | null = null,
    senderId: string = this.ctx.request.accountId!,
  ) {
    const msgrepo: Msgrepo = validateModel(DefineMsgrepo, {
      chatId,
      content,
      creationTime,
      deDuplicate,
      senderId,
      type,
    });
    const alreadyExistsOne = await this.findMsgrepoByDeDuplicateString(msgrepo);
    if (alreadyExistsOne) {
      this.protectedInsertMsgsync(alreadyExistsOne);
      return alreadyExistsOne;
    }
    msgrepo.msgId = await this.getNextMsgId(chatId);
    await this.insertMsgrepo(msgrepo);
    this.protectedInsertMsgsync(msgrepo);
    this.protectedUpdateChatAndReadMsgId(msgrepo);
    return msgrepo;
  }

  /**
   * Send one message.
   * @description
   * Try to write to the message persistent repository first, then asynchronously write to
   * the message synchronization repository, and return the message instance.
   */
  public async sendMsg(
    chatId: string,
    content: string,
    deDuplicate: string,
    creationTime: number,
    type: number | null = null,
    senderId: string = this.ctx.request.accountId!,
  ) {
    /** validate first and then generate message id */
    const msgrepo: Msgrepo = validateModel(DefineMsgrepo, {
      chatId,
      content,
      creationTime,
      deDuplicate,
      senderId,
      type,
    });
    msgrepo.msgId = await this.getNextMsgId(chatId);
    await this.insertMsgrepo(msgrepo);
    this.protectedInsertMsgsync(msgrepo);
    this.protectedUpdateChatAndReadMsgId(msgrepo);
    return msgrepo;
  }

  public updateMsgrepoType(chatId: string, msgId: number, type: number | null) {
    const where = validateAttr(DefineMsgrepo, { chatId, msgId });
    return this.ctx.model.Msgrepo.update(validateAttr(DefineMsgrepo, { type }), { where });
  }

  /** private methods */

  private async findMsgrepoByDeDuplicateString(
    where: Pick<Msgrepo, 'chatId' | 'creationTime' | 'deDuplicate'>,
  ) {
    where = this.app.lodash.pick(where, 'chatId', 'creationTime', 'deDuplicate');
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

  private async insertMsgsync(msgrepo: Msgrepo) {
    const members = await this.ctx.model.Chat.findAll({
      attributes: ['accountId'],
      where: { chatId: msgrepo.chatId },
    });
    const chunk = this.app.lodash.chunk(members, MsgService.MsgsyncChunk);
    for (const part of chunk) {
      const records: Msgsync[] = part.map(member => ({
        ...msgrepo,
        recipientId: member.get('accountId'),
      }));
      await this.ctx.model.Msgsync.bulkCreate(records, { ignoreDuplicates: true });
    }
  }

  /**
   * Write to the message persistent repository, retry
   * `MsgService.RetryTimes.InsertMsgrepo` times if it failed, and throw error if all failed.
   */
  private async insertMsgrepo(msgrepo: Msgrepo) {
    /**
     * Notice the difference between `return` and `return await`.
     */
    try {
      return await this.ctx.model.Msgrepo.create(msgrepo);
    } catch (error) {
      return await retryAsync(
        MsgService.RetryTimes.InsertMsgrepo,
        this.retryInsertMsgrepo,
        [msgrepo],
        { throwOnAllFailed: error },
      );
    }
  }

  /**
   * Write asynchronously to the message synchronization repository and isolate errors.
   * @returns `isReadSpread`
   */
  private async protectedInsertMsgsync(msgrepo: Msgrepo): Promise<boolean> {
    if (await this.service.spread.isReadSpread(msgrepo.chatId)) {
      return true;
    }
    // for (const part of chunk) {
    //   try { ... } catch (error) { ... }
    // }
    try {
      await this.insertMsgsync(msgrepo);
    } catch (error) {
      this.ctx.logger.error(error);
    }
    return false;
  }

  private protectedUpdateChatAndReadMsgId(msgrepo: Msgrepo) {
    try {
      this.service.chat.updateChatMsgId(msgrepo.chatId, msgrepo.msgId);
      this.service.chat.updateReadMsg(msgrepo.chatId, msgrepo.senderId, msgrepo.msgId);
    } catch (error) {
      this.ctx.logger.error(error);
    }
  }

  private async retryInsertMsgrepo(messageOmitMsgId: Omit<Msgrepo, 'msgId'>) {
    const alreadyExistsOne = await this.findMsgrepoByDeDuplicateString(messageOmitMsgId);
    if (alreadyExistsOne) return alreadyExistsOne;
    const message: Msgrepo = {
      ...messageOmitMsgId,
      msgId: await this.getNextMsgId(messageOmitMsgId.chatId),
    };
    await this.ctx.model.Msgrepo.create(message);
    return message;
  }
}
