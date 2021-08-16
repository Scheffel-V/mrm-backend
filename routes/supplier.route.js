const express = require("express");
const router = express.Router();
const {create, findAll, findOne, deleteAll, deleteOne, update, findOneAddress} = require("../controllers/supplier.controller");

router.get("/", findAll);
router.get("/:id", findOne);
router.get("/:id/address", findOneAddress);
router.post("/", create);
router.delete("/:id", deleteOne);
router.delete("/", deleteAll);
router.put("/:id", update);

module.exports = router;