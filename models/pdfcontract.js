'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class PdfContract extends Model {    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
        this.belongsTo(models.rentContract);
    }
    };
    PdfContract.init({
        contractUrl: DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'pdfContract',
    });
    return PdfContract;
};