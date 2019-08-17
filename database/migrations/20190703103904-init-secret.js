'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { STRING } = Sequelize;
    await queryInterface.createTable('Secrets', {
      accountId: {
        type: STRING(18),
        allowNull: false,
        primaryKey: true,
      },
      secret: {
        type: STRING(22),
        allowNull: false,
      },
    });
  },

  down: async queryInterface => {
    await queryInterface.dropTable('Secrets');
  },
};
