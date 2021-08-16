const { QueryTypes } = require('sequelize');
const { sequelize } = require('../models');

/**
 * Executes a select
 * @param {string} query 
 * @param {array} replacements 
 * @returns 
 */
 exports.executeSelect = async (query, replacements) => {
    try {
        return await sequelize.query(
            query,
            {
                replacements: replacements,
                type: QueryTypes.SELECT
            }
        );
    } catch (err) {
        console.log('executeSelect', err);
        throw err;
    }
}