'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class StockItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.supplier);
      this.hasMany(models.stockItemEvent);
      this.hasMany(models.itemRental)
    }
  };
  StockItem.init({
    name: DataTypes.STRING,
    type: DataTypes.STRING,
    power: DataTypes.STRING,
    brand: DataTypes.STRING,
    model: DataTypes.STRING,
    status: DataTypes.STRING,
    needsMaintenance: DataTypes.BOOLEAN,
    numberOfUses: DataTypes.INTEGER,
    lastMaintenance: DataTypes.DATE,
    acquisitionDate: DataTypes.DATE,
    imageURL: DataTypes.STRING,
    pressure: DataTypes.STRING,
    throughput: DataTypes.STRING,
    voltage: DataTypes.STRING,
    serialNumber: DataTypes.STRING,
    rentValue: {
      type: DataTypes.DECIMAL(10, 2),
      get() {
        const value = this.getDataValue('rentValue');
        return value === null ? null : parseFloat(value);
      }
    },
    replacementCost: {
      type: DataTypes.DECIMAL(10, 2),
      get() {
        const value = this.getDataValue('replacementCost');
        return value === null ? null : parseFloat(value);
      }
    },
    active: DataTypes.BOOLEAN,
    code: {
      type: DataTypes.STRING,
      unique: true
    },
    comment: DataTypes.STRING,
    //commentHistory:DataTypes.ARRAY(DataTypes.STRING)
  }, {
    sequelize,
    modelName: 'stockItem',
  });
  return StockItem;
};