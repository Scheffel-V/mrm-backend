const express = require("express");
const router = express.Router();
const {getRentedStockItems, getCustomersWithActiveContracts, getPastDueValue, getPastDueDays} = require("../controllers/customer.controller");
const {getActive, getRevenueFromPeriod} = require("../controllers/rentcontract.controller");
const {getNeedsMaintenanceList, getInMaintenanceList} = require("../controllers/stockitem.controller");

router.get("/basicas/1/:id", getRentedStockItems);
router.get("/basicas/2", getActive);
router.get("/basicas/3/from/:start_date/to/:end_date", getRevenueFromPeriod);
router.get("/basicas/4", getNeedsMaintenanceList);
router.get("/basicas/5", getInMaintenanceList);
router.get("/basicas/6", getPastDueValue);
router.get("/basicas/7", getPastDueDays);
router.get("/basicas/8", getCustomersWithActiveContracts);

module.exports = router;