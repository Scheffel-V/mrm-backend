'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ItemRental extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.rentContract);
      this.belongsTo(models.stockItem);
    }
  };

  ItemRental.init({
    leftAt: DataTypes.DATE,
    returnedAt: DataTypes.DATE,
    value: {
      type: DataTypes.DECIMAL(10, 2),
      get() {
        const value = this.getDataValue('value');
        return value === null ? null : parseFloat(value);
      }
    },
    comment: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'itemRental',
  });
  return ItemRental;
};