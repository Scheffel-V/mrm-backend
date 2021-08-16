'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasOne(models.address, {
        onDelete: "cascade",
        foreignKey: {
          allowNull: true
        }
      });
      this.hasMany(models.rentContract, {
        onDelete: "cascade"
      })
    }
  };

  Customer.init({
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
    modelName: 'customer',
  });
  return Customer;
};