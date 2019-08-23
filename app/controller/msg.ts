import { validatePagination } from '@/utils';
import { AccessDeny, NotFound } from '@/utils/errorcode';
import { Controller } from 'egg';

export default class MsgController extends Controller {
  public async listChatHistoryMsgs() {
    const { accountId } = this.ctx.request;
    const { chatId, msgId: afterMsgId } = this.ctx.params;
    const { limit } = validatePagination(this.ctx, this.ctx.query);
    const [lists] = await Promise.all([
      this.service.msg.listChatHistoryMsgs(chatId, afterMsgId, limit),
      this.checkIsChatMember(accountId, chatId),
    ]);
    this.ctx.body = lists.map(msgrepo => msgrepo.get());
  }

  public async listChatHistoryMsgsByTime() {
    const { accountId } = this.ctx.request;
    const { chatId, creationTime: afterTime } = this.ctx.params;
    const { limit } = validatePagination(this.ctx, this.ctx.query);
    const [lists] = await Promise.all([
      this.service.msg.listChatHistoryMsgsByTime(chatId, afterTime, limit),
      this.checkIsChatMember(accountId, chatId),
    ]);
    this.ctx.body = lists.map(msgrepo => msgrepo.get());
  }

  public async listRecentMsgs() {
    const { accountId } = this.ctx.request;
    const { creationTime: afterTime } = this.ctx.params;
    const { limit } = validatePagination(this.ctx, this.ctx.query);
    const lists = await this.service.msg.listRecentMsgs(accountId!, afterTime, limit);
    this.ctx.body = lists.map(msgsync => this.app.lodash.omit(msgsync.get(), 'recipientId'));
  }

  public async listRecentMsgsQuantitatively() {
    const { accountId } = this.ctx.request;
    const { limit } = validatePagination(this.ctx, this.ctx.query);
    const lists = await this.service.msg.listRecentMsgsQuantitatively(accountId!, limit);
    this.ctx.body = lists.map(msgsync => this.app.lodash.omit(msgsync.get(), 'recipientId'));
  }

  public async resendMsg() {
    const { chatId, creationTime, deDuplicate, type } = this.ctx.params;
    this.ctx.body = await this.service.msg.resendMsg(
      chatId,
      this.ctx.request.body,
      deDuplicate,
      creationTime,
      type,
    );
  }

  public async sendMsg() {
    const { chatId, creationTime, deDuplicate, type } = this.ctx.params;
    this.ctx.body = await this.service.msg.sendMsg(
      chatId,
      this.ctx.request.body,
      deDuplicate,
      creationTime,
      type,
    );
  }

  private async checkIsChatMember(accountId: string | null, chatId: string) {
    if (!accountId) throw new NotFound('account does not exists');
    const isChatMember = await this.service.chat.isChatMember(accountId!, chatId);
    if (!isChatMember)
      throw new AccessDeny(`\`${accountId}\` is not a member of chat \`${chatId}\``);
  }
}
