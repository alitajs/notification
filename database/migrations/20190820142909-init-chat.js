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
        type: INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      readMsgId: {
        type: INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    });
    // await queryInterface.addConstraint('Chat', ['chatId', 'accountId'], {
    //   type: 'primary key',
    //   name: 'PrimaryKey',
    // });
    await queryInterface.addIndex('Chat', { name: 'accountIdIndex', fields: ['accountId'] });
    await queryInterface.addIndex('Chat', { name: 'chatIdIndex', fields: ['chatId'] });
  },

  down: async queryInterface => {
    await queryInterface.dropTable('Chat');
  },
};
