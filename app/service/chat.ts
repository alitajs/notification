import { Chat, DefineChat } from '@/model/chat';
import { validateAttr, validateModel } from '@/utils';
import { Service } from 'egg';
import sequelize from 'sequelize';

export const enum AccountType {
  PLACE_HOLDER,
  chatAdmin = 1 << 0,
  chatManager = 1 << 1,
}

/**
 * Manage meta informations of chats:
 * - members of specific chat
 * - chats of specific account
 * - unread counts
 * - mark read progress
 */
export default class ChatService extends Service {
  public async chatMemberHasType(chatId: string, accountId: string, type: AccountType) {
    const accountType = await this.getChatMemberType(chatId, accountId);
    return !!accountType && !!(accountType & type);
  }

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

  public async getChatMemberType(chatId: string, accountId: string) {
    const where = validateAttr(DefineChat, { accountId, chatId });
    const instance = await this.ctx.model.Chat.findOne({ attributes: ['type'], where });
    if (instance) return instance.get('type') as Chat['type'];
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

  public async insertChatMember(chatId: string, accountId: string) {
    const instance = validateModel(DefineChat, { chatId, accountId });
    await this.ctx.model.Chat.upsert(instance, { fields: ['chatId', 'accountId'] });
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

  public listAccountChats(accountId: string, limit?: number, offset?: number) {
    const where = validateAttr(DefineChat, { accountId });
    return this.ctx.model.Chat.findAndCountAll({ limit, offset, where });
  }

  public listChatMembers(chatId: string, limit?: number, offset?: number) {
    const where = validateAttr(DefineChat, { chatId });
    return this.ctx.model.Chat.findAndCountAll({ limit, offset, where });
  }

  public async listUnreadCounts(accountId: string, limit?: number, offset?: number) {
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

  public updateChatMemberType(chatId: string, accountId: string, type: number | null) {
    const attrs = validateAttr(DefineChat, { accountId, chatId, type });
    return this.ctx.model.Chat.updateEvenIfEmpty(
      { type: attrs.type },
      { where: { chatId: attrs.chatId, accountId: attrs.accountId } },
    );
  }

  public updateChatMsgId(chatId: string, maxMsgId: number) {
    const attrs = validateAttr(DefineChat, { chatId, maxMsgId });
    return this.ctx.model.Chat.updateEvenIfEmpty(
      { maxMsgId: attrs.maxMsgId },
      {
        where: {
          chatId: attrs.chatId,
          maxMsgId: { [sequelize.Op.lt]: attrs.maxMsgId },
        },
      },
    );
  }

  public updateReadMsg(chatId: string, accountId: string, readMsgId: number) {
    const attrs = validateAttr(DefineChat, { accountId, chatId, readMsgId });
    return this.ctx.model.Chat.updateEvenIfEmpty(
      { readMsgId: attrs.readMsgId },
      { where: { chatId: attrs.chatId, accountId: attrs.accountId } },
    );
  }
}
