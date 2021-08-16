'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RentContract extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.customer);
      this.hasMany(models.itemRental);
      this.hasMany(models.additive);
    }
  };

  RentContract.init({
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
    approvalDate: DataTypes.DATE,
    paymentDueDate: DataTypes.DATE,
    paidAt: DataTypes.DATE,
    contractUrl: DataTypes.STRING,
    durationMode: DataTypes.STRING,
    paymentType: DataTypes.STRING,
    paymentComment: DataTypes.STRING,
    workingHours: DataTypes.STRING,
    deliveryMode: DataTypes.STRING,
    installments: DataTypes.INTEGER,
    additivesEndDate: DataTypes.DATE,
    period: DataTypes.INTEGER,
    deliveryCost: {
      type: DataTypes.DECIMAL(10, 2),
      get() {
        const value = this.getDataValue('deliveryCost');
        return value === null ? null : parseFloat(value);
      }
    },
    contractNumber: DataTypes.INTEGER,
    invoiceNumber: DataTypes.INTEGER,
    invoiceStatus: DataTypes.STRING,
    invoiceUrl: DataTypes.STRING,
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
    modelName: 'rentContract',
  });
  return RentContract;
};