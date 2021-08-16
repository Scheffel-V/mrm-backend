const { StatusCodes, getReasonPhrase } = require("http-status-codes");
const db = require("../models");
const handleApiError = require("./utils/apiErrorHandler");
const { isIdNotPresent, isInvalidId } = require("./utils/genericBodyValidator");
const { addXTotalCount } = require("./utils/headerHelper");

// post new stockItemEvent
exports.create = (req, res) => {
  db.stockItemEvent.create({
    status: req.body.status,
    comment: req.body.comment,
    stockItemId: req.body.stockItemId
  }).then(createdStockItemEvent => {
    res.status(StatusCodes.CREATED);
    res.send(createdStockItemEvent);
  }).catch((err) => {
    handleApiError(res, err);
  });
};

// get all stockItemEventes
exports.findAll = (req, res) => {
  db.stockItemEvent.findAll({
    include: [db.stockItem]
  })
    .then(stockItemEvents => {
      addXTotalCount(res, stockItemEvents.length);
      res.send(stockItemEvents);
    })
    .catch((err) => {
      handleApiError(res, err);
    });
};

// get single stockItemEvent by id
exports.findOne = (req, res) => {
  db.stockItemEvent.findAll({
    where: {
      id: req.params.id
    },
    include: [{
      model: db.stockItem,
      include: [db.supplier]
    }]
  }).then(stockItemEvent => {
    if (stockItemEvent.length > 0) {
      res.send(stockItemEvent[0]);
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


// delete stockItemEvent
exports.deleteOne = (req, res) => {
  db.stockItemEvent.destroy({
    where: {
      id: req.params.id
    }
  }).then(() => res.send());
};

// delete all stockItemEventes
exports.deleteAll = (req, res) => {
  db.stockItemEvent.destroy({
    where: {
      // all records
    }
  }).then(() => res.send());
};

// edit a stockItemEvent
exports.update = async (req, res) => {

  if (isIdNotPresent(req, res)) return;
  if (await isInvalidId(req, res, db.stockItemEvent)) return;

  const filter = {
    where: { id: req.params.id }
  };

  var stockItemEvent = await db.stockItemEvent.findOne(filter);

  const newAttributes = {
    status: req.body.status,
    comment: req.body.comment
  }

  stockItemEvent.update(newAttributes)
  .then(updatedItem => {
    res.status(StatusCodes.CREATED);
    res.send(updatedItem);
  }).catch((err) => {
    handleApiError(res, err);
  });
};
