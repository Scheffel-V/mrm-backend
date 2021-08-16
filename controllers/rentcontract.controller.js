const { StatusCodes, getReasonPhrase } = require("http-status-codes");
const {Op} = require("sequelize");
const moment = require("moment");
const db = require("../models");
const helpers = require("./utils/helpers")
const handleApiError = require("./utils/apiErrorHandler");
const { hasInvalidQuery } = require("./utils/queryValidator");
const { isInvalidId, isIdNotPresent } = require("./utils/genericBodyValidator");
const { addXTotalCount } = require("./utils/headerHelper");


exports.create = async (req, res) => {
  var itemRentals = [];
  if(req.body.itemRentals) {
    var itemRentalsLength = req.body.itemRentals.length;
  } else {
    var itemRentalsLength = 0;
  }
  for(var i = 0; i < itemRentalsLength; i++) {
    var newItemRental = {
      leftAt: req.body.itemRentals[i].leftAt,
      returnedAt: req.body.itemRentals[i].returnedAt,
      value: req.body.itemRentals[i].value,
      comment: req.body.itemRentals[i].comment,
      stockItemId: req.body.itemRentals[i].stockItemId
    };
    itemRentals.push(newItemRental);
  };
  db.rentContract.create({
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    approvalDate: req.body.approvalDate,
    paymentDueDate: req.body.paymentDueDate,
    paidAt: req.body.paidAt,
    contractUrl: req.body.contractUrl,
    durationMode: req.body.durationMode,
    value: req.body.value,
    status: req.body.status,
    customerId: req.body.customerId,
    comment: req.body.comment,
    paymentType: req.body.paymentType,
    contractNumber: await helpers.get_new_contract_number(),
    invoiceNumber: await helpers.get_new_invoice_number(),
    invoiceStatus: req.body.invoiceStatus,
    invoiceUrl: req.body.invoiceUrl,
    paymentComment: req.body.paymentComment,
    workingHours: req.body.workingHours,
    period: req.body.period,
    deliveryMode: req.body.deliveryMode,
    installments: req.body.installments,
    additivesEndDate: req.body.additivesEndDate,
    deliveryCost: req.body.deliveryCost,
    itemRentals: itemRentals
  }, {
    include: [db.itemRental]
  }).then(createdItem => {
    for(var i = 0; i < itemRentalsLength; i++) {
      db.stockItem.update({
        status: "RENTED"
      }, {
        where: {
          id: itemRentals[i].stockItemId
        }
      });
      db.stockItemEvent.create({
        stockItemId: itemRentals[i].stockItemId,
        status: "RENTED"
      })
    };
    res.status(StatusCodes.CREATED);
    res.send(createdItem);
  }).catch((err) => {
    handleApiError(res, err);
  });
};

exports.findAll = (req, res) => {
  if (hasInvalidQuery(req, res, db.rentContract)) return;

  db.rentContract.findAll({include: [db.customer]})
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
  db.rentContract.findAll({
    where: {id: req.params.id},
    include: [
      db.customer,
      db.additive,
      {
        model: db.itemRental,
        include: [db.stockItem]
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
  if (await isInvalidId(req, res, db.rentContract)) return;
  db.itemRental.destroy({
    where: {rentContractId: req.params.id}
  }).then(() => {
    db.rentContract.destroy({
      where: {id: req.params.id}
    })
    .then(() => {
      res.status(StatusCodes.OK);
      res.send()
    });
  })
};

exports.deleteAll = (req, res) => {
  db.rentContract.destroy({
    where: {},
    cascade: true,
    truncate: true
  }).then(() => {
    res.status(StatusCodes.OK);
    res.send()
  });
};

exports.update = async (req, res) => {

  if (isIdNotPresent(req, res)) return;
  if (await isInvalidId(req, res, db.rentContract)) return;

  const filter = {
    where: { id: req.params.id }
  };

  var rentContract = await db.rentContract.findOne(filter);

  const newAttributes = {
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    approvalDate: req.body.approvalDate,
    paymentDueDate: req.body.paymentDueDate,
    paidAt: req.body.paidAt,
    contractUrl: req.body.contractUrl,
    durationMode: req.body.durationMode,
    value: req.body.value,
    status: req.body.status,
    customerId: req.body.customerId,
    comment: req.body.comment,
    paymentType: req.body.paymentType,
    contractNumber: rentContract.contractNumber,
    invoiceNumber: rentContract.invoiceNumber,
    invoiceStatus: req.body.invoiceStatus,
    invoiceUrl: req.body.invoiceUrl,
    paymentComment: req.body.paymentComment,
    period: req.body.period,
    workingHours: req.body.workingHours,
    deliveryMode: req.body.deliveryMode,
    installments: req.body.installments,
    additivesEndDate: req.body.additivesEndDate,
    deliveryCost: req.body.deliveryCost,
  }

  rentContract.update(newAttributes)
  .then(updatedItem => {
    res.status(StatusCodes.CREATED);
    res.send(updatedItem);
  }).catch((err) => {
    handleApiError(res, err);
  });
};

exports.getActive = async (req, res) => {
  db.rentContract.findAll({
    where: {
      startDate: {
        [Op.lte]: moment(),
      },
      [Op.or]: [
        { endDate: { [Op.gte]: moment() } },
        { additivesEndDate: { [Op.gte]: moment() } }
      ],
      status: {
        [Op.or]: ["APPROVED", "ON GOING"]
      }
    },
    include: [db.customer, db.additive]
  }).then(results => {
      res.send(results);
  }).catch((err) => {
    handleApiError(res, err);
  });
}

exports.getRevenue = async (req, res) => {
  rentContractsRevenueCurrentMonth = await db.rentContract.sum("value", {
    where: {
      paidAt: {
        [Op.and]: [
          { [Op.gte]: moment().startOf("month") },
          { [Op.lte]: moment().endOf("month") }
        ]
      }
    }
  });

  additivesRevenueCurrentMonth = await db.additive.sum("value", {
    where: {
      paidAt: {
        [Op.and]: [
          { [Op.gte]: moment().startOf("month") },
          { [Op.lte]: moment().endOf("month") }
        ]
      }
    }
  });

  rentContractsRevenueLastMonth = await db.rentContract.sum("value", {
    where: {
      paidAt: {
        [Op.and]: [
          { [Op.gte]: moment().subtract(1, 'month').startOf("month") },
          { [Op.lte]: moment().subtract(1, 'month').endOf("month") }
        ]
      }
    }
  });

  additivesRevenueLastMonth = await db.additive.sum("value", {
    where: {
      paidAt: {
        [Op.and]: [
          { [Op.gte]: moment().subtract(1, 'month').startOf("month") },
          { [Op.lte]: moment().subtract(1, 'month').endOf("month") }
        ]
      }
    }
  });

  result = {
    "last_month_revenue": rentContractsRevenueLastMonth + additivesRevenueLastMonth,
    "current_month_revenue": rentContractsRevenueCurrentMonth + additivesRevenueCurrentMonth,
  }
  res.send(result)
}

exports.getRevenueFromPeriod = async (req, res) => {
  rentContractsRevenue = await db.rentContract.sum("value", {
    where: {
      paidAt: {
        [Op.and]: [
          { [Op.gte]: req.params.start_date },
          { [Op.lte]: req.params.end_date }
        ]
      }
    }
  });

  additivesRevenue = await db.additive.sum("value", {
    where: {
      paidAt: {
        [Op.and]: [
          { [Op.gte]: req.params.start_date },
          { [Op.lte]: req.params.end_date }
        ]
      }
    }
  });

  result = {
    "revenue": rentContractsRevenue + additivesRevenue,
  }
  res.send(result)
}