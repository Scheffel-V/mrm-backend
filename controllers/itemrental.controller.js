const { StatusCodes, getReasonPhrase } = require("http-status-codes");
const db = require("../models");
const handleApiError = require("./utils/apiErrorHandler");
const { hasInvalidQuery } = require("./utils/queryValidator");
const { isInvalidId, isIdNotPresent } = require("./utils/genericBodyValidator");
const { addXTotalCount } = require("./utils/headerHelper");


exports.create = (req, res) => {
  db.itemRental.create({
    leftAt: req.body.leftAt,
    returnedAt: req.body.returnedAt,
    value: req.body.value,
    rentContractId: req.body.rentContractId,
    stockItemId: req.body.stockItemId,
    comment: req.body.comment
  }).then(createdItem => {
    db.stockItem.update({
      status: "RENTED"
    }, {
      where: {
        id: req.body.stockItemId
      }
    });
    db.stockItemEvent.create({
      stockItemId: req.body.stockItemId,
      status: "RENTED"
    })
    res.status(StatusCodes.CREATED);
    res.send(createdItem);
  }).catch((err) => {
    handleApiError(res, err);
  });
};

exports.findAll = (req, res) => {
  if (hasInvalidQuery(req, res, db.itemRental)) return;

  db.itemRental.findAll({
    include: [
      db.stockItem,
      {
        model: db.rentContract,
        include: [db.customer]
      }
    ]
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

exports.findOne = (req, res) => {
  db.itemRental.findAll({
    where: {id: req.params.id},
    include: [
      db.stockItem,
      {
        model: db.rentContract,
        include: [db.customer]
      }
    ]
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
  if (await isInvalidId(req, res, db.itemRental)) return;
  db.itemRental.destroy({
    where: {id: req.params.id}
  })
  .then(() => {
    res.status(StatusCodes.OK);
    res.send()
  });
};

exports.deleteAll = (req, res) => {
  db.itemRental.destroy({
    where: {},
  }).then(() => {
    res.status(StatusCodes.OK);
    res.send()
  });
};

exports.update = async (req, res) => {

  if (isIdNotPresent(req, res)) return;
  if (await isInvalidId(req, res, db.itemRental)) return;
 
  const filter = {
    where: { id: req.params.id }
  };

  var itemRental = await db.itemRental.findOne(filter);

  const newAttributes = {
    startDate: req.body.startDate || itemRental.startDate,
    endDate: req.body.endDate || itemRental.endDate,
    value: req.body.value || itemRental.value,
    stockItemId: req.body.stockItemId || itemRental.stockItemId,
    rentContractId: req.body.rentContractId || itemRental.rentContractId,
    comment: req.body.comment || itemRental.comment
  }

  itemRental.update(newAttributes)
  .then(updatedItem => {
    res.status(StatusCodes.CREATED);
    res.send(updatedItem);
  }).catch((err) => {
    handleApiError(res, err);
  });
};