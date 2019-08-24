import { validatePagination } from '@/utils';
import { ErrCode } from '@/utils/errorcode';
import { Controller } from 'egg';

export default class AdminController extends Controller {
  public async getAllAccountChats() {
    const { accountId } = this.ctx.params;
    const chats = await this.service.chat.getAllAccountChats(accountId);
    this.ctx.body = chats.map(chat => this.app.lodash.omit(chat.get(), 'accountId'));
  }

  public async getAllChatMembers() {
    const { chatId } = this.ctx.params;
    const members = await this.service.chat.getAllChatMembers(chatId);
    this.ctx.body = members.map(chat => this.app.lodash.omit(chat.get(), 'chatId'));
  }

  public async insertChatMember() {
    const { accountId, chatId } = this.ctx.params;
    const member = await this.service.chat.insertChatMember(chatId, accountId);
    this.ctx.body = member.get();
  }

  public async isChatMember() {
    const { accountId, chatId } = this.ctx.params;
    this.ctx.body = await this.service.chat.isChatMember(accountId, chatId);
  }

  public async listAccountChats() {
    const { accountId } = this.ctx.params;
    const { limit, offset } = validatePagination(this.ctx, this.ctx.query);
    const lists = await this.service.chat.listAccountChats(accountId!, limit, offset);
    this.ctx.body = {
      count: lists.count,
      rows: lists.rows.map(chat => this.app.lodash.omit(chat.get(), 'accountId')),
    };
  }

  public async listChatMembers() {
    const { chatId } = this.ctx.params;
    const { limit, offset } = validatePagination(this.ctx, this.ctx.query);
    const lists = await this.service.chat.listChatMembers(chatId, limit, offset);
    this.ctx.body = {
      count: lists.count,
      rows: lists.rows.map(chat => this.app.lodash.omit(chat.get(), 'chatId')),
    };
  }

  public async removeAccount() {
    const { accountId } = this.ctx.params;
    this.ctx.body = await this.service.chat.removeAccount(accountId);
  }

  public async removeChat() {
    const { chatId } = this.ctx.params;
    this.ctx.body = await this.service.chat.removeChat(chatId);
  }

  public async removeChatMember() {
    const { accountId, chatId } = this.ctx.params;
    this.ctx.body = await this.service.chat.removeChatMember(chatId, accountId);
  }

  public async removeMsg() {
    const { chatId, msgId } = this.ctx.params;
    this.ctx.body = await this.service.msg.removeMsg(chatId, msgId);
  }

  public async updateChatMemberType() {
    const { accountId, chatId } = this.ctx.params;
    await this.service.chat.updateChatMemberType(chatId, accountId, this.ctx.request.body);
    this.ctx.body = ErrCode.Succeed;
  }
}
