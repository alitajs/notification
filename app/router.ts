import { Application } from 'egg';

export default async (app: Application) => {
  const { controller, router } = app;
  /** admin - chat members */
  router.del('/admin/chat/:chatId', controller.admin.removeChat);
  router.del('/admin/chat/:chatId/account/:accountId', controller.admin.removeChatMember);
  router.post('/admin/chat/:chatId/account/:accountId', controller.admin.insertChatMember);
  router.post('/admin/chat/:chatId/account/:accountId/type', controller.admin.updateChatMemberType);
  router.get('/admin/chat/:chatId/all-accounts', controller.admin.getAllChatMembers);
  router.get('/admin/chat/:chatId/has-account/:accountId', controller.admin.isChatMember);
  router.get('/admin/chat/:chatId/list-accounts', controller.admin.listChatMembers);

  /** admin - messages */
  router.del('/admin/chat/:chatId/msg/:msgId', controller.admin.removeMsg);
  router.del('/admin/chat/spread/read', controller.admin.removeReadSpreadChats);
  router.get('/admin/chat/spread/read', controller.admin.listReadSpreadChats);
  router.post('/admin/chat/spread/read', controller.admin.insertReadSpreadChats);

  /** admin - accounts */
  router.del('/admin/account/:accountId', controller.admin.removeAccount);
  router.get('/admin/account/:accountId/all-chats', controller.admin.getAllAccountChats);
  router.get('/admin/account/:accountId/list-chats', controller.admin.listAccountChats);

  /** chats - meta data */
  router.get('/chat/all-chats', controller.chat.getAllAccountChats);
  router.post('/chat/all-markasread', controller.chat.markAllAsRead);
  router.get('/chat/all-unread-counts', controller.chat.getAllUnreadCounts);
  router.get('/chat/list-chats', controller.chat.listAccountChats);
  router.get('/chat/list-unread-counts', controller.chat.listUnreadCounts);

  /** certain chat - meta data */
  router.get('/chat/:chatId/all-accounts', controller.chat.getAllChatMembers);
  router.get('/chat/:chatId/list-accounts', controller.chat.listChatMembers);
  router.get('/chat/:chatId/unread-count', controller.chat.getUnreadCount);
  router.post('/chat/:chatId/markasread', controller.chat.markAsRead);
  router.post('/chat/:chatId/markasunread', controller.chat.markAsUnread);

  /** chat - messages */
  router.get('/chat/recent-msgs', controller.msg.listRecentMsgsQuantitatively);
  router.get(
    '/chat/recent-msgs/after-time/:creationTime',
    controller.msg.listRecentMsgs,
  ); /** @deprecated */
  router.get('/chat/:chatId/msg/:msgId/unread-accounts', controller.chat.getMsgUnreadAccounts);
  router.get('/chat/:chatId/msgs', controller.msg.listChatHistoryMsgsQuantitatively);
  router.get('/chat/:chatId/msgs/after-id/:msgId', controller.msg.listChatHistoryMsgs);
  router.get(
    '/chat/:chatId/msgs/after-time/:creationTime',
    controller.msg.listChatHistoryMsgsByTime,
  );
  router.get(
    '/chat/:chatId/msgs/before-id/:msgId',
    controller.msg.listChatHistoryMsgsQuantitatively,
  );
  router.post('/chat/:chatId/recall/:creationTime/:msgId', controller.msg.recallMsg);
  router.post('/chat/:chatId/rerecall/:creationTime/:msgId', controller.msg.retryRecallMsg);
  router.post('/chat/:chatId/resend/:type/:creationTime/:deDuplicate', controller.msg.resendMsg);
  router.post('/chat/:chatId/send/:type/:creationTime/:deDuplicate', controller.msg.sendMsg);
  router.post('/chat/:chatId/resend-text/:creationTime/:deDuplicate', controller.msg.resendText);
  router.post('/chat/:chatId/send-text/:creationTime/:deDuplicate', controller.msg.sendText);

  /** chat - chat admin */
  router.del('/chat/:chatId/account/:accountId', controller.chat.removeChatMember);
  router.post('/chat/:chatId/account/:accountId', controller.chat.insertChatMember);
  router.post('/chat/:chatId/account/:accountId/type', controller.chat.updateChatMemberType);
};
