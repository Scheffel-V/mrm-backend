const express = require("express");
const router = express.Router();
const {login, logout} = require("../controllers/authentication.controller");


router.post("/login", login);
router.post("/logout", logout);

module.exports = router;