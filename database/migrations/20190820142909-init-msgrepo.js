'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { CHAR, INTEGER, STRING, TEXT } = Sequelize;
    await queryInterface.createTable('Msgrepo', {
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
        type: INTEGER,
      },
    });
    await queryInterface.addConstraint('Msgrepo', ['chatId', 'msgId'], {
      type: 'primary key',
      name: 'PrimaryKey',
    });
    await queryInterface.addIndex('Msgrepo', { name: 'msgCreateTime', fields: ['chatId', 'createTime'] });
  },

  down: async queryInterface => {
    await queryInterface.dropTable('Msgrepo');
  },
};
