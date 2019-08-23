import { Chat, DefineChat } from '@/model/chat';
import { validateAttr } from '@/utils';
// import { NotFound } from '@/utils/errorcode';
import { Service } from 'egg';
import sequelize from 'sequelize';

/**
 * Manage meta informations of chats:
 * - members of specific chat
 * - chats of specific account
 * - unread counts
 * - mark read progress
 */
export default class ChatService extends Service {
  public getAllAccountChats(accountId: string) {
    const where = validateAttr(DefineChat, { accountId });
    return this.ctx.model.Chat.findAll({ where });
  }

  public getAllChatMembers(chatId: string) {
    const where = validateAttr(DefineChat, { chatId });
    return this.ctx.model.Chat.findAll({ where });
  }

  public async getAllUnreadCounts(accountId: string) {
    const calculateResultKey = 'unread';
    const where = validateAttr(DefineChat, { accountId });
    const instances = await this.ctx.model.Chat.findAll({
      where: { ...where, maxMsgId: { [sequelize.Op.gt]: sequelize.col('readMsgId') } },
      attributes: ['chatId', [sequelize.literal('(`maxMsgId` - `readMsgId`)'), calculateResultKey]],
    });
    return instances.map(instance => ({
      chatId: instance.get('chatId') as string,
      unread: (instance.get(calculateResultKey as keyof Chat) as number) || 0,
    }));
  }

  /**
   * @deprecated
   */
  public async getMsgUnreadAccounts(chatId: string, msgId: number) {
    const attrs = validateAttr(DefineChat, { chatId, readMsgId: msgId });
    const accounts = await this.ctx.model.Chat.findAll({
      attributes: ['accountId'],
      where: {
        chatId: attrs.chatId,
        readMsgId: { [sequelize.Op.lt]: attrs.readMsgId },
      },
    });
    return accounts.map(account => account.get().accountId);
  }

  public async getUnreadCount(chatId: string, accountId: string) {
    const where = validateAttr(DefineChat, { accountId, chatId });
    const instance = await this.ctx.model.Chat.findOne({ where });
    if (!instance) return 0;
    const maxMsgId: number = instance.get('maxMsgId') || 0;
    const readMsgId: number = instance.get('readMsgId') || 0;
    return Math.max(maxMsgId - readMsgId, 0);
  }

  public async insertMember(chatId: string, accountId: string) {
    const where = validateAttr(DefineChat, { accountId, chatId });
    // use `findOrCreate` to ensure `Union(chatId, accountId)` is unique.
    const [instance] = await this.ctx.model.Chat.findOrCreate({ where });
    return instance;
  }

  public async isChatMember(accountId: string, chatId: string) {
    const where = validateAttr(DefineChat, { accountId, chatId });
    const instance = await this.ctx.model.Chat.findOne({
      attributes: [[sequelize.literal('1'), 'placeholder']],
      where,
    });
    return !!instance;
  }

  public listAccountChats(accountId: string, limit: number, offset?: number) {
    const where = validateAttr(DefineChat, { accountId });
    return this.ctx.model.Chat.findAndCountAll({ limit, offset, where });
  }

  public listChatMembers(chatId: string, limit: number, offset?: number) {
    const where = validateAttr(DefineChat, { chatId });
    return this.ctx.model.Chat.findAndCountAll({ limit, offset, where });
  }

  public async listUnreadCounts(accountId: string, limit: number, offset?: number) {
    const calculateResultKey = 'unread';
    const where = validateAttr(DefineChat, { accountId });
    const findResult = await this.ctx.model.Chat.findAndCountAll({
      limit,
      offset,
      where: { ...where, maxMsgId: { [sequelize.Op.gt]: sequelize.col('readMsgId') } },
      attributes: ['chatId', [sequelize.literal('(`maxMsgId` - `readMsgId`)'), calculateResultKey]],
    });
    return {
      count: findResult.count,
      rows: findResult.rows.map(instance => ({
        chatId: instance.get('chatId') as string,
        unread: (instance.get(calculateResultKey as keyof Chat) as number) || 0,
      })),
    };
  }

  public removeAccount(accountId: string) {
    const where = validateAttr(DefineChat, { accountId });
    return this.ctx.model.Chat.destroy({ where });
  }

  public removeChat(chatId: string) {
    const where = validateAttr(DefineChat, { chatId });
    return this.ctx.model.Chat.destroy({ where });
  }

  public removeChatMember(chatId: string, accountId: string) {
    const where = validateAttr(DefineChat, { accountId, chatId });
    return this.ctx.model.Chat.destroy({ where });
  }

  public updateChatMsgId(chatId: string, maxMsgId: number) {
    const attrs = validateAttr(DefineChat, { chatId, maxMsgId });
    return this.ctx.model.Chat.update(
      { readMsgId: attrs.maxMsgId },
      { where: { chatId: attrs.chatId } },
    );
  }

  public updateReadMsg(chatId: string, accountId: string, readMsgId: number) {
    const attrs = validateAttr(DefineChat, { accountId, chatId, readMsgId });
    return this.ctx.model.Chat.update(
      { readMsgId: attrs.readMsgId },
      { where: { chatId: attrs.chatId, accountId: attrs.accountId } },
    );
  }
}
