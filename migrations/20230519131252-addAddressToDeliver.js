'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'rentContracts',
      'addressToDeliver',
     Sequelize.STRING
    );
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.removeColumn(
      'rentContracts',
      'addressToDeliver'
    );
  }
};
