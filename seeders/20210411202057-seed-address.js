'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Addresses', [{
      street: 'Avenida Cristo Rei',
      cep: '92200003',
      city: 'Porto Alegre',
      number: '123',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
     await queryInterface.bulkDelete('Addresses', [{
      street: 'Avenida Cristo Rei',
      cep: '92200003',
      city: 'Porto Alegre',
      number: '123'
     }], {});
    }
};
