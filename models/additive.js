'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Additive extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.rentContract);
    }
  };

  Additive.init({
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
    approvalDate: DataTypes.DATE,
    paymentDueDate: DataTypes.DATE,
    paidAt: DataTypes.DATE,
    contractUrl: DataTypes.STRING,
    invoiceNumber: DataTypes.INTEGER,
    invoiceStatus: DataTypes.STRING,
    invoiceUrl: DataTypes.STRING,
    paymentType: DataTypes.STRING,
    paymentComment: DataTypes.STRING,
    contractNumber: DataTypes.INTEGER,
    installments: DataTypes.INTEGER,
    period: DataTypes.INTEGER,
    value: {
      type: DataTypes.DECIMAL(10, 2),
      get() {
        const value = this.getDataValue('value');
        return value === null ? null : parseFloat(value);
      }
    },
    status: DataTypes.STRING,
    comment: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'additive',
  });
  return Additive;
};