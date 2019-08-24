import { Chat, DefineChat } from '@/model/chat';
import { AccountType } from '@/service/chat';
import { validateAttr, validatePagination } from '@/utils';
import { AccessDeny, ErrCode, NotFound } from '@/utils/errorcode';
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
    const { readMsgId } = validateAttr<Chat, Pick<Chat, 'readMsgId'>>(DefineChat, {
      readMsgId: this.ctx.params.msgId,
    });
    const instances = (await this.service.chat.getAllChatMembers(chatId)).map(chat => chat.get());
    await this.checkIsChatMember(accountId, chatId, instances);
    this.ctx.body = instances
      .filter(member => member.readMsgId < readMsgId)
      .map(member => member.accountId);
  }

  public async getUnreadCount() {
    const { accountId } = this.ctx.request;
    const { chatId } = this.ctx.params;
    this.ctx.body = await this.service.chat.getUnreadCount(chatId, accountId!);
  }

  public async insertChatMember() {
    const { accountId: currentAccountId } = this.ctx.request;
    const { accountId, chatId } = this.ctx.params;
    const [member] = await Promise.all([
      this.service.chat.insertChatMember(chatId, accountId),
      this.checkChatMemberType(
        currentAccountId,
        chatId,
        AccountType.chatAdmin | AccountType.chatManager,
      ),
    ]);
    this.ctx.body = member.get();
  }

  public async listAccountChats() {
    const { accountId } = this.ctx.request;
    const { limit, offset } = validatePagination(this.ctx, this.ctx.query);
    const lists = await this.service.chat.listAccountChats(accountId!, limit, offset);
    this.ctx.body = {
      count: lists.count,
      rows: lists.rows.map(chat => this.app.lodash.omit(chat.get(), 'accountId')),
    };
  }

  public async listChatMembers() {
    const { accountId } = this.ctx.request;
    const { chatId } = this.ctx.params;
    const { limit, offset } = validatePagination(this.ctx, this.ctx.query);
    const [lists] = await Promise.all([
      this.service.chat.listChatMembers(chatId, limit, offset),
      this.checkIsChatMember(accountId, chatId),
    ]);
    this.ctx.body = {
      count: lists.count,
      rows: lists.rows.map(chat => this.app.lodash.omit(chat.get(), 'chatId')),
    };
  }

  public async listUnreadCounts() {
    const { accountId } = this.ctx.request;
    const { limit, offset } = validatePagination(this.ctx, this.ctx.query);
    this.ctx.body = await this.service.chat.listUnreadCounts(accountId!, limit, offset);
  }

  public async markAllAsRead() {
    const { accountId } = this.ctx.request;
    const attrs = validateAttr(DefineChat, { accountId });
    await this.ctx.model.Chat.update(
      { readMsgId: (sequelize.literal('`maxMsgId`') as unknown) as number },
      { where: { accountId: attrs.accountId! } },
    );
    return ErrCode.Succeed;
  }

  public async markAsRead() {
    const { accountId } = this.ctx.request;
    const { chatId } = this.ctx.params;
    const attrs = validateAttr(DefineChat, { accountId, chatId });
    await this.ctx.model.Chat.update(
      { readMsgId: (sequelize.literal('`maxMsgId`') as unknown) as number },
      { where: { chatId: attrs.chatId, accountId: attrs.accountId! } },
    );
    return ErrCode.Succeed;
  }

  public async markAsUnread() {
    const { accountId } = this.ctx.request;
    const { chatId } = this.ctx.params;
    const attrs = validateAttr(DefineChat, { accountId, chatId });
    await this.ctx.model.Chat.update(
      { readMsgId: (sequelize.literal('(`maxMsgId` - 1)') as unknown) as number },
      {
        where: {
          chatId: attrs.chatId,
          accountId: attrs.accountId!,
          maxMsgId: { [sequelize.Op.gt]: 0 },
        },
      },
    );
    return ErrCode.Succeed;
  }

  public async removeChatMember() {
    const { accountId: currentAccountId } = this.ctx.request;
    const { accountId, chatId } = this.ctx.params;
    const [removedCount] = await Promise.all([
      this.service.chat.removeChatMember(chatId, accountId),
      this.checkChatMemberType(
        currentAccountId,
        chatId,
        AccountType.chatAdmin | AccountType.chatManager,
      ),
    ]);
    this.ctx.body = removedCount;
  }

  public async updateChatMemberType() {
    const { accountId: currentAccountId } = this.ctx.request;
    const { accountId, chatId } = this.ctx.params;
    await Promise.all([
      this.checkChatMemberType(currentAccountId, chatId, AccountType.chatAdmin),
      this.service.chat.updateChatMemberType(chatId, accountId, this.ctx.request.body),
    ]);
    this.ctx.body = ErrCode.Succeed;
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

  private async checkChatMemberType(accountId: string | null, chatId: string, isType: AccountType) {
    if (!accountId) throw new NotFound('account does not exists');
    const hasType = await this.service.chat.chatMemberHasType(chatId, accountId, isType);
    if (!hasType) throw new AccessDeny(`cause of the account type is invalid`);
  }
}
