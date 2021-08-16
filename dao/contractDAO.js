const { executeSelect } = require('./baseDAO');

/**
 * Returns all active contracts,
 * it aggregates the customer's information
 */
exports.getAllActiveContracts = async () => {
    const query = `
        select
            c.*,
            rc.*
        from
            "rentContracts"  rc inner join
            "customers" c on (c.id = rc."customerId")
        where
            rc."endDate" > CURRENT_TIMESTAMP AND
            rc."startDate" < CURRENT_TIMESTAMP AND
            rc."status" = 'APPROVED'
    `
    return await executeSelect(query, []);
}


exports.getBilledValueInAPeriod = async (startDate, endDate) => {
    const query = `
    select
        coalesce(sum(t.total_value), 0) as contracts_and_additives_total_value
    from
    (
        select
            sum(rc.value) as total_value
        from
            "rentContracts" rc
        WHERE
            rc."paidAt" between current_date and current_timestamp

        UNION ALL
        
        SELECT
            SUM(a.value) AS total_value
        FROM
            additives a
        WHERE
            a."paidAt" between current_date and current_timestamp
    ) T
    `
    return await executeSelect(query, [startDate, endDate, startDate, endDate]);
}