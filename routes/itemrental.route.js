const express = require("express");
const router = express.Router();
const {create, findAll, findOne, deleteAll, deleteOne, update} = require("../controllers/itemrental.controller");

router.get("/", findAll);
router.get("/:id", findOne);
router.post("/", create);
router.delete("/:id", deleteOne);
router.delete("/", deleteAll);
router.put("/:id", update);

module.exports = router;