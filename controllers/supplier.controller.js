const { StatusCodes, getReasonPhrase } = require("http-status-codes");
const db = require("../models");
const handleApiError = require("./utils/apiErrorHandler");
const { hasInvalidQuery } = require("./utils/queryValidator");
const { isInvalidId, isIdNotPresent } = require("./utils/genericBodyValidator");
const { addXTotalCount } = require("./utils/headerHelper");

const addressModel = db.address;


exports.create = (req, res) => {
  db.supplier.create({
    name: req.body.name,
    commercialName: req.body.commercialName,
    cnpj: req.body.cnpj,
    mobilePhone: req.body.mobilePhone,
    email: req.body.email,
    active: req.body.active,
    comment: req.body.comment,
    address: {
      street: req.body.address.street,
      cep: req.body.address.cep,
      city: req.body.address.city,
      number: req.body.address.number,
      neighborhood: req.body.address.neighborhood,
      complement: req.body.address.complement
    }
  }, { include: [db.address] }).then(createdItem => {
    res.status(StatusCodes.CREATED);
    res.send(createdItem);
  }).catch((err) => {
    handleApiError(res, err);
  });
};

exports.findAll = (req, res) => {

  if (hasInvalidQuery(req, res, db.supplier)) return;

  db.supplier.findAll({include: [db.address]})
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
  db.supplier.findAll({
    where: {id: req.params.id},
    include: [db.address]
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
  if (await isInvalidId(req, res, db.supplier)) return;
  db.supplier.destroy({
    where: {id: req.params.id}
  })
  .then(() => res.send());
};

exports.deleteAll = (req, res) => {
  db.supplier.destroy({
    where: {},
    truncate: true,
    cascade: true
  }).then(() => res.send());
};

exports.update = async (req, res) => {

  if (isIdNotPresent(req, res)) return;
  if (await isInvalidId(req, res, db.supplier)) return;
 
  const filter = {
    include: [
      {
        model: db.address
      }
    ],
    where: { id: req.params.id }
  };

  var supplier = await db.supplier.findOne(filter);

  const newAttributes = {
    name: req.body.name,
    commercialName: req.body.commercialName,
    cnpj: req.body.cnpj,
    mobilePhone: req.body.mobilePhone,
    email: req.body.email,
    active: req.body.active,
    comment: req.body.comment,
  }

  const addressNewAttributes = {
    street: req.body.address.street,
    cep: req.body.address.cep,
    city: req.body.address.city,
    number: req.body.address.number,
    neighborhood: req.body.address.neighborhood,
    complement: req.body.address.complement
  }

  const addresFilter = {
    where: { id: supplier.address.id }
  };

  var address = await addressModel.findOne(addresFilter);  

  address.update(addressNewAttributes);

  supplier.update(newAttributes)
  .then(updatedItem => {
    res.status(StatusCodes.CREATED);
    res.send(updatedItem);
  }).catch((err) => {
    handleApiError(res, err);
  });
};

exports.findOneAddress = (req, res) => {
  db.supplier.findOne({
    include: [
      {
        model: db.address
      }
    ],
    where: {
      id: req.params.id
    }
  }).then(supplier => {
    if (!!supplier) {
      res.send(supplier.address);
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