import { DefineMsgrepo } from '@/model/msgrepo';
import { validateAttr } from '@/utils';
// import { NotFound } from '@/utils/errorcode';
import { Service } from 'egg';

/**
 * Service of message
 */
export default class MsgService extends Service {
  static RedisKey = {
    MsgId: (chatId: string) => `msgid:${chatId}`,
  };

  public async getNextMsgId(chatId: string) {
    chatId = validateAttr(DefineMsgrepo, { chatId }).chatId;
    const nextMsgId = await this.app.redis.incr(chatId);
    if (!nextMsgId || nextMsgId <= 1) {
      this.getLastMsgIdFromRepo(chatId); // TODO
    }
  }

  private async getLastMsgIdFromRepo(chatId: string): Promise<number> {
    const msgrepo = await this.ctx.model.Msgrepo.findOne({
      attributes: ['msgId'],
      order: [['msgId', 'DESC']],
      where: { chatId },
    });
    return msgrepo ? msgrepo.get('msgId') : 0;
  }
}
