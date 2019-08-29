import { AccountType } from '@/service/chat';
import { MsgType } from '@/service/msg';
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
    this.ctx.body = lists.map(msgrepo => this.app.lodash.omit(msgrepo.get(), 'chatId'));
  }

  public async listChatHistoryMsgsByTime() {
    const { accountId } = this.ctx.request;
    const { chatId, creationTime: afterTime } = this.ctx.params;
    const { limit } = validatePagination(this.ctx, this.ctx.query);
    const [lists] = await Promise.all([
      this.service.msg.listChatHistoryMsgsByTime(chatId, afterTime, limit),
      this.checkIsChatMember(accountId, chatId),
    ]);
    this.ctx.body = lists.map(msgrepo => this.app.lodash.omit(msgrepo.get(), 'chatId'));
  }

  public async listChatHistoryMsgsQuantitatively() {
    const { accountId } = this.ctx.request;
    const { chatId, msgId: beforeMsgId } = this.ctx.params;
    const { limit } = validatePagination(this.ctx, this.ctx.query);
    const [lists] = await Promise.all([
      this.service.msg.listChatHistoryMsgsQuantitatively(chatId, limit, beforeMsgId),
      this.checkIsChatMember(accountId, chatId),
    ]);
    this.ctx.body = lists.map(msgrepo => this.app.lodash.omit(msgrepo.get(), 'chatId'));
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

  public async recallMsg() {
    const { accountId } = this.ctx.request;
    const { chatId, creationTime, msgId: recallMsgId } = this.ctx.params;
    await this.checkIsAbleToRecall(chatId, recallMsgId, accountId);
    const msgrepo = await this.service.msg.sendMsg(
      chatId,
      recallMsgId,
      recallMsgId,
      creationTime,
      MsgType.recall,
    );
    // await this.service.msg.updateMsgrepoType(msgrepo.chatId, msgrepo.msgId, MsgType.recalled);
    this.ctx.body = msgrepo;
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

  public async resendText() {
    const { chatId, creationTime, deDuplicate } = this.ctx.params;
    this.ctx.body = await this.service.msg.resendMsg(
      chatId,
      this.ctx.request.body,
      deDuplicate,
      creationTime,
      null,
    );
  }

  public async retryRecallMsg() {
    const { accountId } = this.ctx.request;
    const { chatId, creationTime, msgId: recallMsgId } = this.ctx.params;
    await this.checkIsAbleToRecall(chatId, recallMsgId, accountId);
    const msgrepo = await this.service.msg.resendMsg(
      chatId,
      recallMsgId,
      recallMsgId,
      creationTime,
      MsgType.recall,
    );
    // await this.service.msg.updateMsgrepoType(msgrepo.chatId, msgrepo.msgId, MsgType.recalled);
    this.ctx.body = msgrepo;
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

  public async sendText() {
    const { chatId, creationTime, deDuplicate } = this.ctx.params;
    this.ctx.body = await this.service.msg.sendMsg(
      chatId,
      this.ctx.request.body,
      deDuplicate,
      creationTime,
      null,
    );
  }

  private async checkIsChatMember(accountId: string | null, chatId: string) {
    if (!accountId) throw new NotFound('account does not exists');
    const isChatMember = await this.service.chat.isChatMember(accountId!, chatId);
    if (!isChatMember)
      throw new AccessDeny(`\`${accountId}\` is not a member of chat \`${chatId}\``);
  }

  private async checkIsAbleToRecall(chatId: string, msgId: number, accountId: string | null) {
    if (!accountId) throw new NotFound('account does not exists');
    const [msgrepo, isManager] = await Promise.all([
      this.service.msg.getMsgrepo(chatId, msgId),
      this.service.chat.chatMemberHasType(
        chatId,
        accountId,
        AccountType.chatAdmin | AccountType.chatManager,
      ),
    ]);
    if (msgrepo) {
      if (isManager) return true;
      if (msgrepo.senderId === accountId) return true;
    }
    throw new AccessDeny('only the sender or chat manager can recall the message');
  }
}
