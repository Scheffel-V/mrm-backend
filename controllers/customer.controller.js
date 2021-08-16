const { StatusCodes, getReasonPhrase } = require("http-status-codes");
const db = require("../models");
const handleApiError = require("./utils/apiErrorHandler");
const { Op } = require("sequelize");
const logger = require("../utils/logger");
const { hasInvalidQuery } = require("./utils/queryValidator");
const { isInvalidId, isIdNotPresent } = require("./utils/genericBodyValidator");
const { addXTotalCount } = require("./utils/headerHelper");
const helpers = require("./utils/helpers")
const {getClientsAndDebts, getClientsAndTotalDaysInDebt} = require("../dao/customerDAO")
const model = db.customer;

// create new customer
exports.create = (req, res) => {
  model.create({
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
      neighborhood: req.body.address.neighborhood
    }
  }, { include: [db.address] }).then(createdCustomer => {
    res.status(StatusCodes.CREATED);
    res.send(createdCustomer);
  }).catch((err) => {
    handleApiError(res, err);
  });
};

// get all customers
exports.findAll = (req, res) => {

  if (hasInvalidQuery(req, res, model)) return;

  model.findAll({
    where: req.query,
    nested: true,

    include: [
      {
        model: db.address
      }
    ]
  })
    .then(customers => {
      addXTotalCount(res, customers.length)
      res.send(customers);
    })
    .catch((err) => {
      handleApiError(res, err);
    });
};

// get single customer by id
exports.findOne = (req, res) => {
  model.findAll({
    where: {
      id: req.params.id
    },
    include: [
      {
        model: db.address
      },
      {
        model: db.rentContract,
        include: [
          {
            model: db.additive
          },
          {
            model: db.itemRental,
            include: db.stockItem
          }
        ]
      }
    ]
  }).then(customer => {
    if (customer.length > 0) {
      res.send(customer[0]);
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

exports.findOneAddress = (req, res) => {
  model.findOne({
    include: [
      {
        model: db.address
      }
    ],
    where: {
      id: req.params.id
    }
  }).then(customer => {
    if (!!customer) {
      res.send(customer.address);
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

// delete customer
exports.deleteOne = async (req, res) => {
  if (await isInvalidId(req, res, model)) return;
  model.destroy({
    where: {
      id: req.params.id
    }
  }).then(() => res.send());
};

// delete all customers
exports.deleteAll = (req, res) => {
  model.destroy({
    where: {
      // all records
    },
    truncate: true,
    cascade: true
  }).then(() => res.send());
};

// edit a address
exports.update = async (req, res) => {

  if (isIdNotPresent(req, res)) return;
  if (await isInvalidId(req, res, model)) return;

  const filter = {
    include: [
      {
        model: db.address
      }
    ],
    where: { id: req.params.id }
  };

  var customer = await model.findOne(filter);

  const newAttributes = {
    name: req.body.name,
    commercialName: req.body.commercialName,
    cnpj: req.body.cnpj,
    mobilePhone: req.body.mobilePhone,
    email: req.body.email,
    active: req.body.active
  }

  customer.update(newAttributes)
  .then(updatedItem => {
    res.status(StatusCodes.CREATED);
    res.send(updatedItem);
  }).catch((err) => {
    handleApiError(res, err);
  });
};

exports.getCustomersWithActiveContracts = async (req, res) => {
  const query = `
  select
      customer.*,
      rentContract."id" as "rentContract.id",
      rentContract."startDate" as "rentContract.startDate",
      rentContract."endDate" as "rentContract.endDate",
      rentContract."approvalDate" as "rentContract.approvalDate",
      rentContract."paymentDueDate" as "rentContract.paymentDueDate",
      rentContract."paidAt" as "rentContract.paidAt",
      rentContract."contractUrl" as "rentContract.contractUrl",
      rentContract."durationMode" as "rentContract.durationMode",
      rentContract."paymentType" as "rentContract.paymentType",
      rentContract."paymentComment" as "rentContract.paymentComment",
      rentContract."workingHours" as "rentContract.workingHours",
      rentContract."deliveryMode" as "rentContract.deliveryMode",
      rentContract."installments" as "rentContract.installments",
      rentContract."additivesEndDate" as "rentContract.additivesEndDate",
      rentContract."period" as "rentContract.period",
      rentContract."deliveryCost" as "rentContract.deliveryCost",
      rentContract."contractNumber" as "rentContract.contractNumber",
      rentContract."invoiceNumber" as "rentContract.invoiceNumber",
      rentContract."invoiceStatus" as "rentContract.invoiceStatus",
      rentContract."invoiceUrl" as "rentContract.invoiceUrl",
      rentContract."value" as "rentContract.value",
      rentContract."status" as "rentContract.status",
      rentContract."comment" as "rentContract.comment",
      additive."id" as "rentContract.additive.id",
      additive."startDate" as "rentContract.additive.startDate",
      additive."endDate" as "rentContract.additive.endDate",
      additive."approvalDate" as "rentContract.additive.approvalDate",
      additive."paymentDueDate" as "rentContract.additive.paymentDueDate",
      additive."paidAt" as "rentContract.additive.paidAt",
      additive."contractUrl" as "rentContract.additive.contractUrl",
      additive."value" as "rentContract.additive.value",
      additive."status" as "rentContract.additive.status",
      additive."comment" as "rentContract.additive.comment",
      additive."rentContractId" as "rentContract.additive.rentContractId",
      additive."invoiceNumber" as "rentContract.additive.invoiceNumber",
      additive."invoiceStatus" as "rentContract.additive.invoiceStatus",
      additive."invoiceUrl" as "rentContract.additive.invoiceUrl",
      additive."paymentType" as "rentContract.additive.paymentType",
      additive."paymentComment" as "rentContract.additive.paymentComment",
      additive."contractNumber" as "rentContract.additive.contractNumber",
      additive."installments" as "rentContract.additive.installments",
      additive."period" as "rentContract.additive.period"

  from
    "customers" customer inner join
    "rentContracts" rentContract on (customer."id" = rentContract."customerId") left join
    "additives" additive on (additive."rentContractId" = rentContract."id" AND additive."endDate" >= CURRENT_TIMESTAMP AND additive."startDate" <= CURRENT_TIMESTAMP)
  where
    rentContract."startDate" <= CURRENT_TIMESTAMP AND
    (rentContract."endDate" >= CURRENT_TIMESTAMP OR rentContract."additivesEndDate" >= CURRENT_TIMESTAMP) AND
    (rentContract."status" = 'APPROVED' OR rentContract."status" = 'ON GOING')
  order by
    rentContract."startDate"
    desc
  `

  customers = await helpers.executeSelect(query);
  res.send(customers);
}

exports.getRentedStockItems = async (req, res) => {
  const query = `
  select
      stockItem.*,
      rentContract."id" as "rentContract.id",
      rentContract."startDate" as "rentContract.startDate",
      rentContract."endDate" as "rentContract.endDate",
      rentContract."approvalDate" as "rentContract.approvalDate",
      rentContract."paymentDueDate" as "rentContract.paymentDueDate",
      rentContract."paidAt" as "rentContract.paidAt",
      rentContract."contractUrl" as "rentContract.contractUrl",
      rentContract."durationMode" as "rentContract.durationMode",
      rentContract."paymentType" as "rentContract.paymentType",
      rentContract."paymentComment" as "rentContract.paymentComment",
      rentContract."workingHours" as "rentContract.workingHours",
      rentContract."deliveryMode" as "rentContract.deliveryMode",
      rentContract."installments" as "rentContract.installments",
      rentContract."additivesEndDate" as "rentContract.additivesEndDate",
      rentContract."period" as "rentContract.period",
      rentContract."deliveryCost" as "rentContract.deliveryCost",
      rentContract."contractNumber" as "rentContract.contractNumber",
      rentContract."invoiceNumber" as "rentContract.invoiceNumber",
      rentContract."invoiceStatus" as "rentContract.invoiceStatus",
      rentContract."invoiceUrl" as "rentContract.invoiceUrl",
      rentContract."value" as "rentContract.value",
      rentContract."status" as "rentContract.status",
      rentContract."comment" as "rentContract.comment",
      rentContract."customerId" as "rentContract.customerId"
  from
    "customers" customer inner join
    "rentContracts" rentContract on (customer."id" = rentContract."customerId") inner join
    "itemRentals" itemRental on (itemRental."rentContractId" = rentContract."id") inner join
    "stockItems" stockItem on (itemRental."stockItemId" = stockItem."id")
  where
    customer."id" = :id
  `

  stockItems = await helpers.executeSelect(query, { id: req.params.id });
  res.send(stockItems);
}

exports.getPastDueValue = async (req, res) => {
  results = await getClientsAndDebts();
  res.send(results)
}

exports.getPastDueDays = async (req, res) => {
  results = await getClientsAndTotalDaysInDebt();
  res.send(results)
}