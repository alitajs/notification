import { Application } from 'egg';

export default async (app: Application) => {
  const { controller, router } = app;
  router.get('/chat/all-chats', controller.chat.getAllAccountChats);
  router.get('/chat/all-unread-counts', controller.chat.getAllUnreadCounts);
  router.get('/chat/list-chats', controller.chat.listAccountChats);
  router.post('/chat/all-markasread', controller.chat.markAllAsRead);

  router.get('/chat/:chatId/all-members', controller.chat.getAllChatMembers);
  router.get('/chat/:chatId/list-members', controller.chat.listChatMembers);
  router.get('/chat/:chatId/unread-count', controller.chat.getUnreadCount);
  router.post('/chat/:chatId/markasread', controller.chat.markAsRead);
  router.post('/chat/:chatId/markasunread', controller.chat.markAsUnread);

  router.get('/chat/:chatId/msg/:msgId/unread-accounts', controller.chat.getMsgUnreadAccounts);
};
