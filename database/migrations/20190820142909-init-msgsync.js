'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { CHAR, INTEGER } = Sequelize;
    await queryInterface.createTable('Msgsync', {
      chatId: {
        type: CHAR(22),
        allowNull: false,
      },
      content: {
        type: TEXT,
        allowNull: false,
        defaultValue: '',
      },
      createTime: {
        type: INTEGER,
        allowNull: false,
      },
      deDuplicate: {
        type: STRING(6),
        allowNull: false,
      },
      msgId: {
        type: INTEGER,
        allowNull: false,
      },
      recipientId: {
        type: CHAR(18),
        allowNull: false,
      },
      senderId: {
        type: CHAR(18),
        allowNull: false,
      },
      type: {
        type: STRING(16),
      },
    });
    await queryInterface.addIndex('Msgsync', {
      name: 'receivedMsg',
      fields: ['recipientId', 'createTime'],
    });
  },

  down: async queryInterface => {
    await queryInterface.dropTable('Msgsync');
  },
};
