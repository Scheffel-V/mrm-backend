const express = require("express");
const router = express.Router();
const {login, logout} = require("../controllers/authentication.controller");


router.post("/login", login);
router.get("/login", login);
router.post("/logout", logout);
router.get("/logout", logout);

module.exports = router;