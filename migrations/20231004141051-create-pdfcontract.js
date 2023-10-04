'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(t => {
            return Promise.all([
                queryInterface.createTable('pdfContracts', {
                    id: {
                        type: Sequelize.INTEGER,
                        autoIncrement: true,
                        allowNull: false,
                        primaryKey: true
                    },
                    contractUrl: {
                        type: Sequelize.STRING(500),
                        allowNull: false
                    },
                    createdAt: {
                        type: Sequelize.DATE,
                        allowNull: false
                    },
                    updatedAt: {
                        type: Sequelize.DATE,
                        allowNull: false
                    },
                    rentContractId: {
                        type: Sequelize.INTEGER,
                        references: {
                            model: {
                                tableName: 'rentContracts'
                            },
                            key: 'id'
                        },
                        allowNull: false
                    },
                }, {transaction: t})
            ]);
        });
    },

    async down(queryInterface, Sequelize) {
      return queryInterface.sequelize.transaction(t => {
        return Promise.all([
          queryInterface.dropTable('pdfContracts', null, { transaction: t }),
        ]);
      });
    }
};
