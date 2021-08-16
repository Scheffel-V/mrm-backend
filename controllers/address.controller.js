const { StatusCodes, getReasonPhrase } = require("http-status-codes");
const db = require("../models");
const handleApiError = require("./utils/apiErrorHandler");
const { Op } = require("sequelize");
const { isIdNotPresent, isInvalidId } = require("./utils/genericBodyValidator");
const { addXTotalCount } = require("./utils/headerHelper");
const model = db.address;

// post new address
exports.create = (req, res) => {
  model.create({
    street: req.body.street,
    cep: req.body.cep,
    city: req.body.city,
    number: req.body.number
  }).then(submitedAddress => {
    res.status(StatusCodes.CREATED);
    res.send(submitedAddress);
  }).catch((err) => {
    handleApiError(res, err);
  });
};

// get all addresses
exports.findAll = (req, res) => {
  model.findAll()
    .then(addresses => {
      addXTotalCount(res, addresses.length);
      res.send(addresses);
    })
    .catch((err) => {
      handleApiError(res, err);
    });
};

// get single address by id
exports.findOne = (req, res) => {
  model.findAll({
    where: {
      id: req.params.id
    }
  }).then(address => {
    if (address.length > 0) {
      res.send(address[0]);
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


// delete address
exports.deleteOne = (req, res) => {
  model.destroy({
    where: {
      id: req.params.id
    }
  }).then(() => res.send());
};

// delete all addresses
exports.deleteAll = (req, res) => {
  model.destroy({
    where: {
      // all records
    },
    truncate: true
  }).then(() => res.send());
};

// edit a address
exports.update = async (req, res) => {

  if (isIdNotPresent(req, res)) return;
  if (await isInvalidId(req, res, model)) return;

  model.update(
    {
      street: req.body.street,
      cep: req.body.cep,
      city: req.body.city,
      number: req.body.number
    },
    {
      where: { id: req.params.id }
    }
  ).then((newObject) => res.send(newObject));
};
