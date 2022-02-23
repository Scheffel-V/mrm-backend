'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'additives',
      'invoicedAt',
     Sequelize.DATE
    );
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.removeColumn(
      'additives',
      'invoicedAt'
    );
  }
};
