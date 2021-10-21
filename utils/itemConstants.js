const statusMap = {
    MAINTENANCE: "MAINTENANCE",
    INVENTORY: "INVENTORY",
    RENTED: "RENTED",
    READY_FOR_RENTAL: "READY_FOR_RENTAL",
    CUSTOMER: "CUSTOMER"
}

module.exports = {
    ...statusMap
}

module.exports.VALID_STATUSES = [statusMap.INVENTORY, statusMap.RENTED, statusMap.MAINTENANCE, statusMap.READY_FOR_RENTAL, statusMap.CUSTOMER];