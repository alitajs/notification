'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { CHAR, INTEGER } = Sequelize;
    await queryInterface.createTable('Chat', {
      accountId: {
        type: CHAR(18),
        allowNull: false,
      },
      chatId: {
        type: CHAR(22),
        allowNull: false,
      },
      maxMsgId: {
        type: INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
      readMsgId: {
        type: INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
      type: {
        type: INTEGER.UNSIGNED,
        defaultValue: null,
      },
    });
    await queryInterface.addConstraint('Chat', ['chatId', 'accountId'], {
      type: 'primary key',
      name: 'PrimaryKey',
    });
    await queryInterface.addIndex('Chat', { name: 'accountIdIndex', fields: ['accountId'] });
  },

  down: async queryInterface => {
    await queryInterface.dropTable('Chat');
  },
};
