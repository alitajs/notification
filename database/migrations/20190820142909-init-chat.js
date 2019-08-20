'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { CHAR, INTEGER } = Sequelize;
    await queryInterface.createTable('Chats', {
      accountId: {
        type: CHAR(18),
        allowNull: false,
      },
      chatId: {
        type: CHAR(22),
        allowNull: false,
      },
      maxMsgId: {
        type: INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      readedMsgId: {
        type: INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    });
    await queryInterface.addIndex('Chats', { name: 'accountIdIndex', fields: ['accountId'] });
    await queryInterface.addIndex('Chats', { name: 'chatIdIndex', fields: ['chatId'] });
  },

  down: async queryInterface => {
    await queryInterface.dropTable('Chats');
  },
};
