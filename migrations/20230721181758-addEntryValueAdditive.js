'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.addColumn(
        'additives',
        'entryValue',
        Sequelize.DOUBLE
    );
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.removeColumn(
        'additives',
        'entryValue'
    );
  }
};
