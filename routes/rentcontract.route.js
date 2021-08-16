const express = require("express");
const router = express.Router();
const {create, findAll, findOne, deleteAll, deleteOne, update, getActive, getRevenue, getRevenueFromPeriod} = require("../controllers/rentcontract.controller");

router.get("/", findAll);
router.get("/active", getActive);
router.get("/revenue", getRevenue);
router.get("/revenue/from/:start_date/to/:end_date", getRevenueFromPeriod);
router.get("/:id", findOne);
router.post("/", create);
router.delete("/:id", deleteOne);
router.delete("/", deleteAll);
router.put("/:id", update);

module.exports = router;