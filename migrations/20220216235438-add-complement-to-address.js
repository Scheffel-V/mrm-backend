'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'addresses',
      'complement',
     Sequelize.STRING
    );
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.removeColumn(
      'addresses',
      'complement'
    );
  }
};
