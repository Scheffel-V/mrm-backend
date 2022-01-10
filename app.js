const express = require("express");
const app = express();
const db = require("./models");
const PORT = 80;
const cors = require("cors");
const morgan = require('morgan');
const logger = require("./utils/logger");
require("dotenv-safe").config();
const jwt = require('jsonwebtoken');

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));

// import routes
const projetoDeBDRoute = require("./routes/projetodebd.route");
const addressRoute = require("./routes/address.route");
const customerRoute = require("./routes/customer.route");
const itemRoute = require("./routes/stockitem.route");
const supplierRoute = require("./routes/supplier.route");
const rentContractRoute = require("./routes/rentcontract.route");
const stockItemEventRoute = require("./routes/stockitemevent.route");
const itemRentalRoute = require("./routes/itemrental.route");
const additiveRoute = require("./routes/additive.route");
const imageRoute = require("./routes/image.route");
const authenticationRoute = require("./routes/authentication.route");
const dbRoute = require("./routes/db.route");
const { authenticateToken } = require("./controllers/authentication.controller");

addRoutesToTheApp();

// sync db and then starts listening to  port
db.sequelize.sync().then(() => {
  app.listen(PORT, () => {
    logger.info(`listening on: http://localhost:${PORT}`);
  });
});


function addRoutesToTheApp() {
  logger.info("Adding routes...");

  app.use("/api/projetodebd", authenticateToken, projetoDeBDRoute);
  app.use("/api/addresses", authenticateToken, addressRoute);
  app.use("/api/customers", authenticateToken, customerRoute);
  app.use("/api/stockItems", authenticateToken, itemRoute);
  app.use("/api/suppliers", authenticateToken, supplierRoute);
  app.use("/api/rentcontracts", authenticateToken, rentContractRoute);
  app.use("/api/stockitemevents", authenticateToken, stockItemEventRoute);
  app.use("/api/itemrentals", authenticateToken, itemRentalRoute);
  app.use("/api/additives", authenticateToken, additiveRoute);
  app.use("/api/image", authenticateToken, imageRoute);
  app.use("/api/authentication", authenticationRoute);
  app.use("/db", authenticateToken, dbRoute);
  logger.info("Routes successfully added");
}