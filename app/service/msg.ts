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
    const nextMsgId = await this.app.redis.incr(chatId);
  }

  private getLastMsgIdFromRepo(chatId: string) {
    return this.ctx.model.Msgrepo.findOne();
  }
}
