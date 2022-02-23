'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'rentContracts',
      'invoicedAt',
     Sequelize.DATE
    );
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.removeColumn(
      'rentContracts',
      'invoicedAt'
    );
  }
};
