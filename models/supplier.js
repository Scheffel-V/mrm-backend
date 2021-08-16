'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Supplier extends Model {
    static associate(models) {
      this.hasOne(models.address, {
        onDelete: "cascade",
        foreignKey: {
          allowNull: true
        }
      });
    }
  };

  Supplier.init({
    name: DataTypes.STRING,
    commercialName: DataTypes.STRING,
    cnpj: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true
    },
    mobilePhone: DataTypes.STRING,
    email: DataTypes.STRING,
    active: DataTypes.BOOLEAN,
    comment: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'supplier',
  });
  return Supplier;
};