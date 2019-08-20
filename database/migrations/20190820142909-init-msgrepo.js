'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { CHAR, INTEGER } = Sequelize;
    await queryInterface.createTable('MsgRepo', {
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
      senderId: {
        type: CHAR(18),
        allowNull: false,
      },
      type: {
        type: STRING(16),
      },
    });
    await queryInterface.addConstraint('MsgRepo', ['chatId', 'msgId'], {
      type: 'primary key',
      name: 'PrimaryKey',
    });
    await queryInterface.addIndex('MsgRepo', { name: 'msgCreateTime', fields: ['chatId', 'createTime'] });
  },

  down: async queryInterface => {
    await queryInterface.dropTable('MsgRepo');
  },
};
