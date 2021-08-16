const express = require("express");
const router = express.Router();
const {create, findAll, findOne, deleteAll, deleteOne, update, 
      findOneAddress, getCustomersWithActiveContracts, getRentedStockItems,
      getPastDueValue, getPastDueDays} = require("../controllers/customer.controller");

router.get("/", findAll);
router.get("/pastdue/amounts", getPastDueValue);
router.get("/pastdue/days", getPastDueDays);
router.get("/with_active_contracts", getCustomersWithActiveContracts);
router.get("/:id/rentedItems", getRentedStockItems);
router.get("/:id", findOne);
router.get("/:id/address", findOneAddress);
router.post("/", create);
router.delete("/:id", deleteOne);
router.delete("/", deleteAll);
router.put("/:id", update);

module.exports = router;