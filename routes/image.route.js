const express = require("express");
const router = express.Router();
const {create, findOne} = require("../controllers/image.controller");


router.post("/:id", create);
router.get("/:id", findOne);

module.exports = router;