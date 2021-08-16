const statusMap = {
    MAINTENANCE: "MAINTENANCE",
    INVENTORY: "INVENTORY",
    RENTED: "RENTED",
}

module.exports = {
    ...statusMap
}

module.exports.VALID_STATUSES = [statusMap.INVENTORY, statusMap.RENTED, statusMap.MAINTENANCE];