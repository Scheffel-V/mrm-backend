'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'rentContracts',
      'laborAndDisplacementPrice',
     Sequelize.DOUBLE
    );
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.removeColumn(
      'rentContracts',
      'laborAndDisplacementPrice'
    );
  }
};