import { Chat, DefineChat } from '@/model/chat';
import { validateAttr, validatePagination } from '@/utils';
import { AccessDeny, NotFound } from '@/utils/errorcode';
import { Controller } from 'egg';
import sequelize from 'sequelize';

export default class ChatController extends Controller {
  public async getAllAccountChats() {
    const { accountId } = this.ctx.request;
    const chats = await this.service.chat.getAllAccountChats(accountId!);
    this.ctx.body = chats.map(chat => this.app.lodash.omit(chat.get(), 'accountId'));
  }

  public async getAllChatMembers() {
    const { accountId } = this.ctx.request;
    const { chatId } = this.ctx.params;
    const instances = await this.service.chat.getAllChatMembers(chatId);
    const members = instances.map(chat => this.app.lodash.omit(chat.get(), 'chatId'));
    await this.checkIsChatMember(accountId, chatId, members);
    this.ctx.body = members;
  }

  public async getAllUnreadCounts() {
    const { accountId } = this.ctx.request;
    this.ctx.body = await this.service.chat.getAllUnreadCounts(accountId!);
  }

  public async getMsgUnreadAccounts() {
    const { accountId } = this.ctx.request;
    const { chatId } = this.ctx.params;
    // await this.checkIsChatMember(accountId, chatId);
    // this.ctx.body = await this.service.chat.getMsgUnreadAccounts(chatId, msgId);
    const { readedMsgId } = validateAttr<Chat, Pick<Chat, 'readedMsgId'>>(DefineChat, {
      readedMsgId: this.ctx.params.msgId,
    });
    const instances = (await this.service.chat.getAllChatMembers(chatId)).map(chat => chat.get());
    await this.checkIsChatMember(accountId, chatId, instances);
    this.ctx.body = instances
      .filter(member => member.readedMsgId < readedMsgId)
      .map(member => member.accountId);
  }

  public async getUnreadCount() {
    const { accountId } = this.ctx.request;
    const { chatId } = this.ctx.params;
    this.ctx.body = await this.service.chat.getUnreadCount(chatId, accountId!);
  }

  public async listAccountChats() {
    const { accountId } = this.ctx.request;
    const { limit = 10, offset } = validatePagination(this.ctx, this.ctx.query);
    const lists = await this.service.chat.listAccountChats(accountId!, limit, offset);
    this.ctx.body = {
      count: lists.count,
      rows: lists.rows.map(chat => this.app.lodash.omit(chat.get(), 'accountId')),
    };
  }

  public async listChatMembers() {
    const { accountId } = this.ctx.request;
    const { chatId } = this.ctx.params;
    const { limit = 10, offset } = validatePagination(this.ctx, this.ctx.query);
    const [lists] = await Promise.all([
      this.service.chat.listChatMembers(chatId, limit, offset),
      this.checkIsChatMember(accountId, chatId),
    ]);
    this.ctx.body = {
      count: lists.count,
      rows: lists.rows.map(chat => this.app.lodash.omit(chat.get(), 'chatId')),
    };
  }

  public async markAllAsRead() {
    const { accountId } = this.ctx.request;
    const attrs = validateAttr(DefineChat, { accountId });
    await this.ctx.model.Chat.update(
      { readedMsgId: (sequelize.literal('`maxMsgId`') as unknown) as number },
      { where: { accountId: attrs.accountId! } },
    );
    return 'OK';
  }

  public async markAsRead() {
    const { accountId } = this.ctx.request;
    const { chatId } = this.ctx.params;
    const attrs = validateAttr(DefineChat, { accountId, chatId });
    await this.ctx.model.Chat.update(
      { readedMsgId: (sequelize.literal('`maxMsgId`') as unknown) as number },
      { where: { chatId: attrs.chatId, accountId: attrs.accountId! } },
    );
    return 'OK';
  }

  public async markAsUnread() {
    const { accountId } = this.ctx.request;
    const { chatId } = this.ctx.params;
    const attrs = validateAttr(DefineChat, { accountId, chatId });
    await this.ctx.model.Chat.update(
      { readedMsgId: (sequelize.literal('(`maxMsgId` - 1)') as unknown) as number },
      {
        where: {
          chatId: attrs.chatId,
          accountId: attrs.accountId!,
          maxMsgId: { [sequelize.Op.gt]: 0 },
        },
      },
    );
    return 'OK';
  }

  public async removeChatMember() {
    // TODO: chat admin
  }

  private async checkIsChatMember(
    accountId: string | null,
    chatId: string,
    members?: Pick<Chat, 'accountId'>[],
  ) {
    if (!accountId) throw new NotFound('account does not exists');
    const isChatMember = members
      ? members.some(member => member.accountId === accountId)
      : await this.service.chat.isChatMember(accountId!, chatId);
    if (!isChatMember)
      throw new AccessDeny(`\`${accountId}\` is not a member of chat \`${chatId}\``);
  }
}
