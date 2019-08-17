import { Chat, DefineChat } from '@/model/chat';
import { validateAttr } from '@/utils';
// import { NotFound } from '@/utils/errorcode';
import { Service } from 'egg';
import sequelize from 'sequelize';

/**
 * Service of auth
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
      where: { ...where, maxMsgId: { [sequelize.Op.gt]: sequelize.col('readedMsgId') } },
      attributes: [
        'chatId',
        [sequelize.literal('(`maxMsgId` - `readedMsgId`)'), calculateResultKey],
      ],
    });
    return instances.map(instance => ({
      chatId: instance.get('chatId') as string,
      unread: (instance.get(calculateResultKey as keyof Chat) as number) || 0,
    }));
  }

  public async getUnreadCount(chatId: string, accountId: string) {
    const where = validateAttr(DefineChat, { accountId, chatId });
    const instance = await this.ctx.model.Chat.findOne({ where });
    if (!instance) return 0;
    const maxMsgId: number = instance.get('maxMsgId') || 0;
    const readedMsgId: number = instance.get('readedMsgId') || 0;
    return Math.max(maxMsgId - readedMsgId, 0);
  }

  public async insertMember(chatId: string, accountId: string) {
    const where = validateAttr(DefineChat, { accountId, chatId });
    // use `findOrCreate` to ensure `Union(chatId, accountId)` is unique.
    const [instance] = await this.ctx.model.Chat.findOrCreate({ where });
    return instance;
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
      where: { ...where, maxMsgId: { [sequelize.Op.gt]: sequelize.col('readedMsgId') } },
      attributes: [
        'chatId',
        [sequelize.literal('(`maxMsgId` - `readedMsgId`)'), calculateResultKey],
      ],
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
      { readedMsgId: attrs.maxMsgId },
      { where: { chatId: attrs.chatId } },
    );
  }

  public updateReadedMsg(chatId: string, accountId: string, readedMsgId: number) {
    const attrs = validateAttr(DefineChat, { accountId, chatId, readedMsgId });
    return this.ctx.model.Chat.update(
      { readedMsgId: attrs.readedMsgId },
      { where: { chatId: attrs.chatId, accountId: attrs.accountId } },
    );
  }
}
