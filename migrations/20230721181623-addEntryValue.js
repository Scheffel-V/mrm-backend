'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.addColumn(
        'rentContracts',
        'entryValue',
        Sequelize.DOUBLE
    );
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.removeColumn(
        'rentContracts',
        'entryValue'
    );
  }
};
