const { executeSelect } = require("./baseDAO");

/**
 * Returns all the stock items that are associated with a given customer in a ongoing contract
 * @param {string} clientId 
 * @returns 
 */
exports.allItemsWithGivenClient = async (clientId) => {
    const query = `
        select
            si.*
        from
            "rentContracts"  rc inner join
            "customers" c on (c.id = rc."customerId") inner join
            "itemRentals" ir on (ir."rentContractId" = rc.id) inner join
            "stockItems" si on (si.id = ir."stockItemId")
        where
            c.cnpj = ? AND
            rc."endDate" > CURRENT_TIMESTAMP AND
            rc."startDate" < CURRENT_TIMESTAMP AND
            ir."leftAt" is not NULL AND
            ir."returnedAt" is NULL;
    `
    return await executeSelect(query, [clientId]);
}

/**
 * Get all the stock items that have needsMaintenance set to true
 * @returns 
 */
exports.getAllItemsThatNeedMaintenance = async () => {

    const query = `
        SELECT
            si.* 
        FROM
            "stockItems" si
        WHERE
            si."needsMaintenance" = true
    `;

    return await executeSelect(query, []);
}


/**
 * Get all the stock items that are currently under maintenance
 * @returns 
 */
 exports.getAllItemsThatAreCurrentlyUnderMaintanance = async () => {

    const query = `
        SELECT
            si.*
        FROM 
            "stockItems" si
        WHERE
            si.status = 'MAINTENANCE'
    `;

    return await executeSelect(query, []);
}