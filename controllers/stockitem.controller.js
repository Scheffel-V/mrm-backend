const { StatusCodes, getReasonPhrase } = require("http-status-codes");
const db = require("../models");
const handleApiError = require("./utils/apiErrorHandler");
const { hasInvalidQuery } = require("./utils/queryValidator");
const { isInvalidId, isIdNotPresent, getModelValueIfUndefined } = require("./utils/genericBodyValidator");
const { addXTotalCount } = require("./utils/headerHelper");
const { setOnGoingByStockItemId, setFinishedByStockItemId, setItemRentalReturnedAtByStockItemId } = require("./rentcontract.controller");

exports.create = (req, res) => {
  db.stockItem.create({
    name: req.body.name,
    type: req.body.type,
    power: req.body.power,
    brand: req.body.brand,
    model: req.body.model,
    status: req.body.status,
    numberOfUses: req.body.numberOfUses,
    lastMaintenance: req.body.lastMaintenance,
    acquisitionDate: req.body.acquisitionDate,
    needsMaintenance: req.body.needsMaintenance,
    imageURL: req.body.imageURL,
    rentValue: req.body.rentValue,
    replacementCost: req.body.replacementCost,
    code: req.body.code,
    comment: req.body.comment,
    supplierId: req.body.supplierId,
    active: req.body.active,
    pressure: req.body.pressure,
    throughput: req.body.throughput,
    voltage: req.body.voltage,
    serialNumber: req.body.serialNumber,
    stockItemEvents: [{
      status: req.body.status,
      comment: req.body.statusComment
    }]
  },{
    include: [db.stockItemEvent]
  }).then(createdItem => {
    res.status(StatusCodes.CREATED);
    res.send(createdItem);
  }).catch((err) => {
    handleApiError(res, err);
  });
};

exports.findAll = async (req, res) => {
  if (hasInvalidQuery(req, res, db.stockItem)) return;

  db.stockItem.findAll()
  .then(items => {
    res.headers = addXTotalCount(res, items.length);
    console.log(JSON.stringify(res.headers));
    res.send(items);
  })
  .catch((err) => {
    handleApiError(res, err);
  });
};

exports.findOne = async (req, res) => {
  db.stockItem.findAll({
    where: {id: req.params.id},
    include: [db.supplier, db.stockItemEvent]
  }).then(item => {
    if (item.length > 0) {
      res.send(item[0]);
    } else {
      res.status(StatusCodes.NOT_FOUND);
      res.send(
        {
          "message": getReasonPhrase(StatusCodes.NOT_FOUND),
          "id": req.params.id
        }
      );
    }
  })
    .catch(err => {
      handleApiError(res, err);
    });
};

exports.deleteOne = async (req, res) => {
  if (await isInvalidId(req, res, db.stockItem)) return;
  db.stockItem.destroy({
    where: {id: req.params.id}
  })
  .then(() => res.send());
};

// delete all
exports.deleteAll = async (req, res) => {
  db.stockItem.destroy({
    where: {},
    truncate: true,
    cascade: true
  }).then(() => res.send());
};

// edit a item
exports.update = async (req, res) => {
  if (isIdNotPresent(req, res)) return;
  if (await isInvalidId(req, res, db.stockItem)) return;

  const filter = {
    where: { id: req.params.id }
  };

  var stockItem = await db.stockItem.findOne(filter);

  const newAttributes = {
    name: getModelValueIfUndefined(req.body.name, stockItem.name),
    type: getModelValueIfUndefined(req.body.type, stockItem.type),
    power: getModelValueIfUndefined(req.body.power, stockItem.power),
    brand: getModelValueIfUndefined(req.body.brand, stockItem.brand),
    model: getModelValueIfUndefined(req.body.model, stockItem.model),
    status: getModelValueIfUndefined(req.body.status, stockItem.status),
    numberOfUses: getModelValueIfUndefined(req.body.numberOfUses, stockItem.numberOfUses),
    lastMaintenance: getModelValueIfUndefined(req.body.lastMaintenance, stockItem.lastMaintenance),
    needsMaintenance: getModelValueIfUndefined(req.body.needsMaintenance, stockItem.needsMaintenance),
    acquisitionDate: getModelValueIfUndefined(req.body.acquisitionDate, stockItem.acquisitionDate),
    imageURL: getModelValueIfUndefined(req.body.imageURL, stockItem.imageURL),
    rentValue: getModelValueIfUndefined(req.body.rentValue, stockItem.rentValue),
    replacementCost: getModelValueIfUndefined(req.body.replacementCost, stockItem.replacementCost),
    code: getModelValueIfUndefined(req.body.code, stockItem.code),
    comment: getModelValueIfUndefined(req.body.comment, stockItem.comment),
    supplierId: getModelValueIfUndefined(req.body.supplierId, stockItem.supplierId),
    active: getModelValueIfUndefined(req.body.active, stockItem.active),
    pressure: getModelValueIfUndefined(req.body.pressure, stockItem.pressure),
    throughput: getModelValueIfUndefined(req.body.throughput, stockItem.throughput),
    voltage: getModelValueIfUndefined(req.body.voltage, stockItem.voltage),
    serialNumber: getModelValueIfUndefined(req.body.serialNumber, stockItem.serialNumber),
  }

  const oldStatus = stockItem.status;

  stockItem.update(newAttributes)
  .then(async updatedItem => {
    if(oldStatus != updatedItem.status) {
      db.stockItemEvent.create({
        status: updatedItem.status,
        comment: req.body.statusComment,
        stockItemId: updatedItem.id
      });
    }

    if ((oldStatus !== "INVENTORY" && oldStatus !== "MAINTENANCE" && oldStatus !== "RESERVED") && updatedItem.status === "INVENTORY") {
      console.log("\n [0 UPDATE ITEM RENTAL]")
      await setItemRentalReturnedAtByStockItemId({ stockItemId: updatedItem.id });
    }

    if (oldStatus == "RENTED" && updatedItem.status == "CUSTOMER") {
      await setOnGoingByStockItemId({ stockItemId: updatedItem.id });
    }

    res.status(StatusCodes.CREATED);
    res.send(updatedItem);
  }).catch((err) => {
    handleApiError(res, err);
  });
};

// get all stockItemEvents
exports.getEvents = (req, res) => {
  db.stockItemEvent.findAll({
    where: {
      stockItemId: req.params.id
    }
  })
    .then(stockItemEvents => {
      addXTotalCount(res, stockItemEvents.length);
      res.send(stockItemEvents);
    })
    .catch((err) => {
      handleApiError(res, err);
    });
};

// get by code
exports.getByCode = (req, res) => {
  db.stockItem.findAll({
    where: {
      code: req.params.code
    },
    include: [db.supplier, db.stockItemEvent]
  })
    .then(item => {
      if (item.length > 0) {
        res.send(item[0]);
      } else {
        res.status(StatusCodes.NOT_FOUND);
        res.send(
          {
            "message": getReasonPhrase(StatusCodes.NOT_FOUND),
            "code": req.params.code
          }
        );
      }
    })
    .catch((err) => {
      handleApiError(res, err);
    });
};

// edit a item
exports.updateByCode = async (req, res) => {

  const filter = {
    where: { code: req.params.code }
  };

  var stockItem = await db.stockItem.findOne(filter);

  const newAttributes = {
    name: getModelValueIfUndefined(req.body.name, stockItem.name),
    type: getModelValueIfUndefined(req.body.type, stockItem.type),
    power: getModelValueIfUndefined(req.body.power, stockItem.power),
    brand: getModelValueIfUndefined(req.body.brand, stockItem.brand),
    model: getModelValueIfUndefined(req.body.model, stockItem.model),
    status: getModelValueIfUndefined(req.body.status, stockItem.status),
    numberOfUses: getModelValueIfUndefined(req.body.numberOfUses, stockItem.numberOfUses),
    lastMaintenance: getModelValueIfUndefined(req.body.lastMaintenance, stockItem.lastMaintenance),
    needsMaintenance: getModelValueIfUndefined(req.body.needsMaintenance, stockItem.needsMaintenance),
    acquisitionDate: getModelValueIfUndefined(req.body.acquisitionDate, stockItem.acquisitionDate),
    imageURL: getModelValueIfUndefined(req.body.imageURL, stockItem.imageURL),
    rentValue: getModelValueIfUndefined(req.body.rentValue, stockItem.rentValue),
    replacementCost: getModelValueIfUndefined(req.body.replacementCost, stockItem.replacementCost),
    code: getModelValueIfUndefined(req.body.code, stockItem.code),
    comment: getModelValueIfUndefined(req.body.comment, stockItem.comment),
    supplierId: getModelValueIfUndefined(req.body.supplierId, stockItem.supplierId),
    active: getModelValueIfUndefined(req.body.active, stockItem.active),
    pressure: getModelValueIfUndefined(req.body.pressure, stockItem.pressure),
    throughput: getModelValueIfUndefined(req.body.throughput, stockItem.throughput),
    voltage: getModelValueIfUndefined(req.body.voltage, stockItem.voltage),
    serialNumber: getModelValueIfUndefined(req.body.serialNumber, stockItem.serialNumber),
  }

  const oldStatus = stockItem.status;

  stockItem.update(newAttributes)
  .then(async updatedItem => {
    if(oldStatus != updatedItem.status) {
      db.stockItemEvent.create({
        status: updatedItem.status,
        comment: req.body.statusComment,
        stockItemId: updatedItem.id
      });
    }

    if ((oldStatus !== "INVENTORY" && oldStatus !== "MAINTENANCE" && oldStatus !== "RESERVED") && updatedItem.status === "INVENTORY") {
      console.log("\n [0 UPDATE ITEM RENTAL]")
      await setItemRentalReturnedAtByStockItemId({ stockItemId: updatedItem.id });
    }

    if (oldStatus == "RENTED" && updatedItem.status == "CUSTOMER") {
      await setOnGoingByStockItemId({ stockItemId: updatedItem.id });
    }

    res.status(StatusCodes.CREATED);
    res.send(updatedItem);
  }).catch((err) => {
    handleApiError(res, err);
  });
};

// get rented machines
exports.getRented = (req, res) => {
  db.stockItem.findAll({
    where: {
      "status": 'RENTED'
    }
  })
    .then(stockItem => {
      addXTotalCount(res, stockItem.length);
      res.send(stockItem);
    })
    .catch((err) => {
      handleApiError(res, err);
    });
};

exports.getNeedsMaintenanceList = (req, res) => {
  db.stockItem.findAll({
    where: {
      needsMaintenance: true
    },
    include: [db.supplier, db.stockItemEvent]
  })
    .then(items => {
      res.headers = addXTotalCount(res, items.length);
      console.log(JSON.stringify(res.headers));
      res.send(items);
    })
    .catch((err) => {
      handleApiError(res, err);
    });
};

exports.getInMaintenanceList = (req, res) => {
  db.stockItem.findAll({
    where: {
      status: "MAINTENANCE"
    },
    include: [db.supplier, db.stockItemEvent]
  })
    .then(items => {
      res.headers = addXTotalCount(res, items.length);
      res.send(items);
    })
    .catch((err) => {
      handleApiError(res, err);
    });
};