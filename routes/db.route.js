const db = require("../models");
const express = require("express");
const router = express.Router();
const { StatusCodes } = require("http-status-codes");

function reset_db(req, res) {
  db.sequelize.sync({force: true})
  .then(() => {
    res.status(StatusCodes.OK);
    res.send();
  })
  
}

router.get("/reset", reset_db);
module.exports = router;