'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { CHAR, INTEGER, STRING, TEXT } = Sequelize;
    await queryInterface.createTable('Msgsync', {
      chatId: {
        type: CHAR(22),
        allowNull: false,
      },
      content: {
        type: TEXT,
        allowNull: false,
      },
      creationTime: {
        type: INTEGER,
        allowNull: false,
      },
      deDuplicate: {
        type: STRING(12),
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
        type: INTEGER,
      },
    });
    await queryInterface.addConstraint('Msgsync', ['recipientId', 'chatId', 'msgId'], {
      type: 'primary key',
      name: 'PrimaryKey',
    });
    await queryInterface.addIndex('Msgsync', {
      name: 'receivedMsg',
      fields: ['recipientId', 'creationTime'],
    });
  },

  down: async queryInterface => {
    await queryInterface.dropTable('Msgsync');
  },
};
