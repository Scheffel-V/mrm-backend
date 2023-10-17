const { StatusCodes, getReasonPhrase } = require("http-status-codes");
const {Op} = require("sequelize");
const moment = require("moment");
const db = require("../models");
const helpers = require("./utils/helpers")
const handleApiError = require("./utils/apiErrorHandler");
const { hasInvalidQuery } = require("./utils/queryValidator");
const { isInvalidId, isIdNotPresent } = require("./utils/genericBodyValidator");
const { addXTotalCount } = require("./utils/headerHelper");
const { getActive } = require("./rentcontract.controller");

getPortugueseStatus = (status) => {
  if (status === "PAID") {
    return "Pago";
  }

  if (status === "INVOICED") {
    return "Faturado";
  }

  if (status === "OVERDUE") {
    return "Vencido";
  }

  if (status === "PENDING") {
    return "Pendente";
  }
  
  return status;
}

compare = ( a, b ) => {
  if (a.Numero < b.Numero){
    return -1;
  }

  if (a.Numero > b.Numero){
    return 1;
  }

  return 0;
}

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
    active: req.body.active,
    approvalDate: req.body.approvalDate,
    paymentDueDate: req.body.paymentDueDate,
    paidAt: req.body.paidAt,
    contractUrl: req.body.contractUrl,
    durationMode: req.body.durationMode,
    value: req.body.value,
    status: req.body.status,
    customerId: req.body.customerId,
    comment: req.body.comment,
    invoiceComment: req.body.invoiceComment,
    purchaseOrderNumber: req.body.purchaseOrderNumber,
    paymentType: req.body.paymentType,
    contractNumber: await helpers.get_new_contract_number(),
    //invoiceNumber: await helpers.get_new_invoice_number(),
    invoiceNumber: null,
    invoiceStatus: req.body.invoiceStatus,
    invoiceUrl: req.body.invoiceUrl,
    paymentComment: req.body.paymentComment,
    workingHours: req.body.workingHours,
    period: req.body.period,
    deliveryMode: req.body.deliveryMode,
    installments: req.body.installments,
    additivesEndDate: req.body.additivesEndDate,
    deliveryCost: req.body.deliveryCost,
    itemRentals: itemRentals,
    invoicedAt: req.body.invoicedAt,
    laborAndDisplacementPrice: req.body.laborAndDisplacementPrice,
    addressToDeliver: req.body.addressToDeliver,
    entryValue: req.body.entryValue,
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

  db.rentContract.findAll({
    where: {
      active: {
        [Op.eq]: true
      }
    },
    order: [
      ['id', 'DESC']
    ],
    include: [
      db.customer,
      db.additive,
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
  db.rentContract.findAll({
    where: {id: req.params.id},
    include: [
      db.customer,
      db.additive,
      db.pdfContract,
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

  const filter = {
    where: { id: req.params.id },
    include: [
      {
        model: db.itemRental,
        include: [db.stockItem]
      },
      {
        model: db.pdfContract
      }
    ]
  };

  var rentContract = await db.rentContract.findOne(filter);
  var itemRentals = rentContract.itemRentals;
  var pdfContracts = rentContract.pdfContracts;

  for(var i = 0; i < itemRentals.length; i++) {
    db.stockItem.update({
      status: "INVENTORY"
    }, {
      where: {
        id: itemRentals[i].stockItemId
      }
    });
    db.stockItemEvent.create({
      stockItemId: itemRentals[i].stockItemId,
      status: "INVENTORY"
    })
  };

  this.deletePdfContractFiles = function (pdfContracts) {
    const fs = require('fs');
    for (var i = 0; i < pdfContracts.length; i++) {
      fs.rm(pdfContracts[i].contractUrl, (err) =>{
        if (err) {
          console.log(err);
        };
      });
      console.log('Removed contract with path:' + pdfContracts[i].contractUrl);
    }
  };

  await db.pdfContract.destroy({
    where: {rentContractId: req.params.id}
  }).then(() => {
    this.deletePdfContractFiles(pdfContracts);
  });

  db.itemRental.destroy({
    where: {rentContractId: req.params.id}
  }).then(() => {
    db.rentContract.destroy({
      where: {id: req.params.id}
    })
    .then(async () => {

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
    active: req.body.active,
    approvalDate: req.body.approvalDate,
    paymentDueDate: req.body.paymentDueDate,
    paidAt: req.body.paidAt,
    contractUrl: req.body.contractUrl,
    durationMode: req.body.durationMode,
    value: req.body.value,
    status: req.body.status,
    customerId: req.body.customerId,
    comment: req.body.comment,
    invoiceComment: req.body.invoiceComment,
    purchaseOrderNumber: req.body.purchaseOrderNumber,
    paymentType: req.body.paymentType,
    contractNumber: req.body.contractNumber,
    invoiceNumber: req.body.invoiceNumber,
    invoiceStatus: req.body.invoiceStatus,
    invoiceUrl: req.body.invoiceUrl,
    paymentComment: req.body.paymentComment,
    period: req.body.period,
    workingHours: req.body.workingHours,
    deliveryMode: req.body.deliveryMode,
    installments: req.body.installments,
    additivesEndDate: req.body.additivesEndDate,
    deliveryCost: req.body.deliveryCost,
    invoicedAt: req.body.invoicedAt,
    laborAndDisplacementPrice: req.body.laborAndDisplacementPrice,
    addressToDeliver: req.body.addressToDeliver,
    entryValue: req.body.entryValue,
  }

  if (newAttributes.invoiceNumber === null && newAttributes.invoiceStatus === "INVOICED") {
    newAttributes.invoiceNumber = await helpers.get_new_invoice_number();
  }

  rentContract.update(newAttributes)
  .then(async updatedItem => {
    if (updatedItem.dataValues.status === "FINISHED" || !updatedItem.dataValues.active) {
      const filter = {
        where: { id: updatedItem.dataValues.id },
        include: [
          {
            model: db.itemRental,
            include: [db.stockItem]
          }
        ]
      };
    
      var rentContract = await db.rentContract.findOne(filter);
      var itemRentals = rentContract.itemRentals;
      for(var i = 0; i < itemRentals.length; i++) {
        if (itemRentals[i].returnedAt === null) {
          console.log("\n [(I) UPDATE STOCK ITEM FOR ITEM RENTAL IS NOT RETURNED AT]")
          
          db.stockItem.update({
            status: "INVENTORY"
          }, {
            where: {
              id: itemRentals[i].stockItemId
            }
          });
          db.stockItemEvent.create({
            stockItemId: itemRentals[i].stockItemId,
            status: "INVENTORY"
          })
        } else {
          console.log("\n [(II) NOT UPDATE STOCK ITEM FOR ITEM RENTAL IS RETURNED AT]")
        }
      };
    }
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
      status: {
        [Op.or]: ["APPROVED", "ON GOING"]
      },
      active: {
        [Op.eq]: true
      }
    },
    order: [
      ['id', 'DESC']
    ],
    include: [
      db.customer, 
      db.additive,
      {
        model: db.itemRental,
        include: [db.stockItem]
      }
    ]
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
    "start_date": req.params.startDate,
    "end_date": req.params.end_date
  }
  res.send(result)
}

exports.getRevenueFromLastTwelveMonths = async (req, res) => {
  var revenues = []
  let currentDate = new Date()
  let currentMonth = (currentDate.getMonth() + 1).toString()
  let currentYear = currentDate.getFullYear().toString()
  let monthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()

  if (currentMonth.length === 1) {
    currentMonth = '0' + currentMonth
  }

  for (var i = 0; i < 12; i++) {
    rentContractsRevenue = await db.rentContract.sum("value", {
      where: {
        paidAt: {
          [Op.and]: [
            { [Op.gte]: `${currentYear}-${currentMonth}-01` },
            { [Op.lte]: `${currentYear}-${currentMonth}-${monthLastDay}` }
          ]
        }
      }
    });
  
    additivesRevenue = await db.additive.sum("value", {
      where: {
        paidAt: {
          [Op.and]: [
            { [Op.gte]: `${currentYear}-${currentMonth}-01` },
            { [Op.lte]: `${currentYear}-${currentMonth}-${monthLastDay}` }
          ]
        }
      }
    });

    revenues.push(rentContractsRevenue + additivesRevenue)

    currentDate.setMonth(currentDate.getMonth() - 1)
    currentMonth = (currentDate.getMonth() + 1).toString()

    if (currentMonth.length === 1) {
      currentMonth = '0' + currentMonth
    }

    currentYear = currentDate.getFullYear().toString()
    monthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  }

  result = {
    "revenues": revenues
  }
  res.send(result)
}

exports.setOnGoingByStockItemId = async (req, res) => {
  var activeRentContracts = await db.rentContract.findAll({
    where: {
      startDate: {
        [Op.lte]: moment(),
      },
      status: {
        [Op.or]: ["APPROVED", "ON GOING"]
      },
      active: {
        [Op.eq]: true
      }
    },
    include: [
      {
        model: db.itemRental,
        include: [db.stockItem]
      }
    ]
  });

  for (var i = 0; i < activeRentContracts.length; i++) {
    var itemRentals = activeRentContracts[i].itemRentals;
    for(var j = 0; j < itemRentals.length; j++) {
      if (itemRentals[j].stockItemId == req.stockItemId) {
        const filter = {
          where: { id: activeRentContracts[i].id }
        };
      
        var rentContract = await db.rentContract.findOne(filter);
        await rentContract.update({
          status: "ON GOING",
        })
      }
    };
  };
}

exports.setFinishedByStockItemId = async (req, res) => {
  var activeRentContracts = await db.rentContract.findAll({
    where: {
      startDate: {
        [Op.lte]: moment(),
      },
      status: {
        [Op.or]: ["APPROVED", "ON GOING"]
      },
      active: {
        [Op.eq]: true
      }
    },
    include: [
      {
        model: db.itemRental,
        include: [db.stockItem]
      }
    ]
  });

  for (var i = 0; i < activeRentContracts.length; i++) {
    var itemRentals = activeRentContracts[i].itemRentals;
    for(var j = 0; j < itemRentals.length; j++) {
      if (itemRentals[j].stockItemId == req.stockItemId) {
        const filter = {
          where: { id: activeRentContracts[i].id }
        };

        shouldSetToFinished = true;
        for (var k = 0; k < itemRentals.length; k++) {
          if (itemRentals[k].stockItem.status != "INVENTORY" && itemRentals[k].stockItem.status != "MAINTENANCE") {
            shouldSetToFinished = false;
            break;
          }
        }
      
        if (shouldSetToFinished) {
          var rentContract = await db.rentContract.findOne(filter);
          await rentContract.update({
            status: "FINISHED",
          })
        }
      }
    };
  };
}

exports.setItemRentalReturnedAtByStockItemId = async (req, res) => {
  console.log("\n [1 UPDATE ITEM RENTAL]")
  var activeRentContracts = await db.rentContract.findAll({
    where: {
      status: {
        [Op.or]: ["APPROVED", "ON GOING"]
      },
      active: {
        [Op.eq]: true
      }
    },
    include: [
      {
        model: db.itemRental,
        include: [db.stockItem]
      }
    ]
  });

  for (var i = 0; i < activeRentContracts.length; i++) {
    console.log("\n [2 UPDATE ITEM RENTAL] Rent Contract ID:" + activeRentContracts[i].id)
    var itemRentals = activeRentContracts[i].itemRentals;
    for(var j = 0; j < itemRentals.length; j++) {
      console.log("\n [3 UPDATE ITEM RENTAL] Item Rental ID:" + itemRentals[j].id)
      if (itemRentals[j].stockItemId == req.stockItemId && itemRentals[j].returnedAt === null) {
        const filter = {
          where: { id: itemRentals[j].id }
        };
      
        var itemRental = await db.itemRental.findOne(filter);
        console.log("\n [4 UPDATE ITEM RENTAL] ID: " + itemRentals[j].id)
        await itemRental.update({
          returnedAt: new Date()
        })
      }
    };
  };
}

exports.getInvoicedValue = async (req, res) => {
  rentContractsRevenueCurrentMonth = await db.rentContract.sum("value", {
    where: {
      invoicedAt: {
        [Op.and]: [
          { [Op.gte]: moment().startOf("month") },
          { [Op.lte]: moment().endOf("month") }
        ]
      }
    }
  });

  additivesRevenueCurrentMonth = await db.additive.sum("value", {
    where: {
      invoicedAt: {
        [Op.and]: [
          { [Op.gte]: moment().startOf("month") },
          { [Op.lte]: moment().endOf("month") }
        ]
      }
    }
  });

  rentContractsRevenueLastMonth = await db.rentContract.sum("value", {
    where: {
      invoicedAt: {
        [Op.and]: [
          { [Op.gte]: moment().subtract(1, 'month').startOf("month") },
          { [Op.lte]: moment().subtract(1, 'month').endOf("month") }
        ]
      }
    }
  });

  additivesRevenueLastMonth = await db.additive.sum("value", {
    where: {
      invoicedAt: {
        [Op.and]: [
          { [Op.gte]: moment().subtract(1, 'month').startOf("month") },
          { [Op.lte]: moment().subtract(1, 'month').endOf("month") }
        ]
      }
    }
  });

  result = {
    "current_month_invoiced_value": rentContractsRevenueCurrentMonth + additivesRevenueCurrentMonth,
    "last_month_invoiced_value": rentContractsRevenueLastMonth + additivesRevenueLastMonth,
  }

  res.send(result)
}

exports.getInvoicesFromCurrentMonth = async (req, res) => {
  rentContractsInvoicedInCurrentMonth = await db.rentContract.findAll({
    where: {
      invoicedAt: {
        [Op.and]: [
          { [Op.gte]: moment().startOf("month") },
          { [Op.lte]: moment().endOf("month") }
        ]
      }
    },
    include: [
      {
        model: db.customer
      }
    ]
  });

  additivesInvoicedInCurrentMonth = await db.additive.findAll({
    where: {
      invoicedAt: {
        [Op.and]: [
          { [Op.gte]: moment().startOf("month") },
          { [Op.lte]: moment().endOf("month") }
        ]
      }
    },
    include: [
      {
        model: db.rentContract,
        include: [db.customer]
      }
    ]
  });

  var data = [];

  for (var i = 0; i < rentContractsInvoicedInCurrentMonth.length; i++) {
    var rentContractData = {};

    rentContractData["Numero"] = rentContractsInvoicedInCurrentMonth[i].invoiceNumber;
    var invoicedAt = new Date(rentContractsInvoicedInCurrentMonth[i].invoicedAt);
    rentContractData["Emissao"] = invoicedAt.getDate() + "/" + (invoicedAt.getMonth() + 1)  + "/" + invoicedAt.getFullYear();
    rentContractData["Valor"] = rentContractsInvoicedInCurrentMonth[i].value.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
    rentContractData["Cliente"] = rentContractsInvoicedInCurrentMonth[i].customer.name;
    rentContractData["Contrato"] = rentContractsInvoicedInCurrentMonth[i].contractNumber;
    rentContractData["Aditivo"] = 0;
    rentContractData["Status"] = getPortugueseStatus(rentContractsInvoicedInCurrentMonth[i].invoiceStatus);

    data.push(rentContractData);
  }

  for (var i = 0; i < additivesInvoicedInCurrentMonth.length; i++) {
    var additiveData = {};

    additiveData["Numero"] = additivesInvoicedInCurrentMonth[i].invoiceNumber;
    var invoicedAt = new Date(additivesInvoicedInCurrentMonth[i].invoicedAt);
    additiveData["Emissao"] = invoicedAt.getDate() + "/" + (invoicedAt.getMonth() + 1)  + "/" + invoicedAt.getFullYear();
    additiveData["Valor"] = additivesInvoicedInCurrentMonth[i].value.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
    additiveData["Cliente"] = additivesInvoicedInCurrentMonth[i].rentContract.customer.name;
    additiveData["Contrato"] = additivesInvoicedInCurrentMonth[i].contractNumber;
    additiveData["Aditivo"] = additivesInvoicedInCurrentMonth[i].additiveNumber;
    additiveData["Status"] = getPortugueseStatus(additivesInvoicedInCurrentMonth[i].invoiceStatus);

    data.push(additiveData);
  }

  result = data.sort( compare );

  res.send(result)
}

exports.getInvoicesFromLastMonth = async (req, res) => {
  rentContractsInvoicedInCurrentMonth = await db.rentContract.findAll({
    where: {
      invoicedAt: {
        [Op.and]: [
          { [Op.gte]: moment().subtract(1, 'month').startOf("month") },
          { [Op.lte]: moment().subtract(1, 'month').endOf("month") }
        ]
      }
    },
    include: [
      {
        model: db.customer
      }
    ]
  });

  additivesInvoicedInCurrentMonth = await db.additive.findAll({
    where: {
      invoicedAt: {
        [Op.and]: [
          { [Op.gte]: moment().subtract(1, 'month').startOf("month") },
          { [Op.lte]: moment().subtract(1, 'month').endOf("month") }
        ]
      }
    },
    include: [
      {
        model: db.rentContract,
        include: [db.customer]
      }
    ]
  });

  var data = [];

  for (var i = 0; i < rentContractsInvoicedInCurrentMonth.length; i++) {
    var rentContractData = {};

    rentContractData["Numero"] = rentContractsInvoicedInCurrentMonth[i].invoiceNumber;
    var invoicedAt = new Date(rentContractsInvoicedInCurrentMonth[i].invoicedAt);
    rentContractData["Emissao"] = invoicedAt.getDate() + "/" + (invoicedAt.getMonth() + 1) + "/" + invoicedAt.getFullYear();
    rentContractData["Valor"] = rentContractsInvoicedInCurrentMonth[i].value.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
    rentContractData["Cliente"] = rentContractsInvoicedInCurrentMonth[i].customer.name;
    rentContractData["Contrato"] = rentContractsInvoicedInCurrentMonth[i].contractNumber;
    rentContractData["Aditivo"] = 0;
    rentContractData["Status"] = getPortugueseStatus(rentContractsInvoicedInCurrentMonth[i].invoiceStatus);

    data.push(rentContractData);
  }

  for (var i = 0; i < additivesInvoicedInCurrentMonth.length; i++) {
    var additiveData = {};

    additiveData["Numero"] = additivesInvoicedInCurrentMonth[i].invoiceNumber;
    var invoicedAt = new Date(additivesInvoicedInCurrentMonth[i].invoicedAt);
    additiveData["Emissao"] = invoicedAt.getDate() + "/" + (invoicedAt.getMonth() + 1) + "/" + invoicedAt.getFullYear();
    additiveData["Valor"] = additivesInvoicedInCurrentMonth[i].value.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
    additiveData["Cliente"] = additivesInvoicedInCurrentMonth[i].rentContract.customer.name;
    additiveData["Contrato"] = additivesInvoicedInCurrentMonth[i].contractNumber;
    additiveData["Aditivo"] = additivesInvoicedInCurrentMonth[i].additiveNumber;
    additiveData["Status"] = getPortugueseStatus(additivesInvoicedInCurrentMonth[i].invoiceStatus);

    data.push(additiveData);
  }

  result = data.sort( compare );

  res.send(result)
}

exports.getPaidInvoicesFromCurrentMonth = async (req, res) => {
  rentContractsInvoicedInCurrentMonth = await db.rentContract.findAll({
    where: {
      paidAt: {
        [Op.and]: [
          { [Op.gte]: moment().startOf("month") },
          { [Op.lte]: moment().endOf("month") }
        ]
      }
    },
    include: [
      {
        model: db.customer
      }
    ]
  });

  additivesInvoicedInCurrentMonth = await db.additive.findAll({
    where: {
      paidAt: {
        [Op.and]: [
          { [Op.gte]: moment().startOf("month") },
          { [Op.lte]: moment().endOf("month") }
        ]
      }
    },
    include: [
      {
        model: db.rentContract,
        include: [db.customer]
      }
    ]
  });

  var data = [];

  for (var i = 0; i < rentContractsInvoicedInCurrentMonth.length; i++) {
    var rentContractData = {};

    rentContractData["Numero"] = rentContractsInvoicedInCurrentMonth[i].invoiceNumber;
    var invoicedAt = new Date(rentContractsInvoicedInCurrentMonth[i].invoicedAt);
    rentContractData["Emissao"] = invoicedAt.getDate() + "/" + (invoicedAt.getMonth() + 1)  + "/" + invoicedAt.getFullYear();
    rentContractData["Valor"] = rentContractsInvoicedInCurrentMonth[i].value.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
    rentContractData["Cliente"] = rentContractsInvoicedInCurrentMonth[i].customer.name;
    rentContractData["Contrato"] = rentContractsInvoicedInCurrentMonth[i].contractNumber;
    rentContractData["Aditivo"] = 0;
    rentContractData["Status"] = getPortugueseStatus(rentContractsInvoicedInCurrentMonth[i].invoiceStatus);

    data.push(rentContractData);
  }

  for (var i = 0; i < additivesInvoicedInCurrentMonth.length; i++) {
    var additiveData = {};

    additiveData["Numero"] = additivesInvoicedInCurrentMonth[i].invoiceNumber;
    var invoicedAt = new Date(additivesInvoicedInCurrentMonth[i].invoicedAt);
    additiveData["Emissao"] = invoicedAt.getDate() + "/" + (invoicedAt.getMonth() + 1)  + "/" + invoicedAt.getFullYear();
    additiveData["Valor"] = additivesInvoicedInCurrentMonth[i].value.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
    additiveData["Cliente"] = additivesInvoicedInCurrentMonth[i].rentContract.customer.name;
    additiveData["Contrato"] = additivesInvoicedInCurrentMonth[i].contractNumber;
    additiveData["Aditivo"] = additivesInvoicedInCurrentMonth[i].additiveNumber;
    additiveData["Status"] = getPortugueseStatus(additivesInvoicedInCurrentMonth[i].invoiceStatus);

    data.push(additiveData);
  }

  result = data.sort( compare );

  res.send(result)
}

exports.getPaidInvoicesFromLastMonth = async (req, res) => {
  rentContractsInvoicedInCurrentMonth = await db.rentContract.findAll({
    where: {
      paidAt: {
        [Op.and]: [
          { [Op.gte]: moment().subtract(1, 'month').startOf("month") },
          { [Op.lte]: moment().subtract(1, 'month').endOf("month") }
        ]
      }
    },
    include: [
      {
        model: db.customer
      }
    ]
  });

  additivesInvoicedInCurrentMonth = await db.additive.findAll({
    where: {
      paidAt: {
        [Op.and]: [
          { [Op.gte]: moment().subtract(1, 'month').startOf("month") },
          { [Op.lte]: moment().subtract(1, 'month').endOf("month") }
        ]
      }
    },
    include: [
      {
        model: db.rentContract,
        include: [db.customer]
      }
    ]
  });

  var data = [];

  for (var i = 0; i < rentContractsInvoicedInCurrentMonth.length; i++) {
    var rentContractData = {};

    rentContractData["Numero"] = rentContractsInvoicedInCurrentMonth[i].invoiceNumber;
    var invoicedAt = new Date(rentContractsInvoicedInCurrentMonth[i].invoicedAt);
    rentContractData["Emissao"] = invoicedAt.getDate() + "/" + (invoicedAt.getMonth() + 1) + "/" + invoicedAt.getFullYear();
    rentContractData["Valor"] = rentContractsInvoicedInCurrentMonth[i].value.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
    rentContractData["Cliente"] = rentContractsInvoicedInCurrentMonth[i].customer.name;
    rentContractData["Contrato"] = rentContractsInvoicedInCurrentMonth[i].contractNumber;
    rentContractData["Aditivo"] = 0;
    rentContractData["Status"] = getPortugueseStatus(rentContractsInvoicedInCurrentMonth[i].invoiceStatus);

    data.push(rentContractData);
  }

  for (var i = 0; i < additivesInvoicedInCurrentMonth.length; i++) {
    var additiveData = {};

    additiveData["Numero"] = additivesInvoicedInCurrentMonth[i].invoiceNumber;
    var invoicedAt = new Date(additivesInvoicedInCurrentMonth[i].invoicedAt);
    additiveData["Emissao"] = invoicedAt.getDate() + "/" + (invoicedAt.getMonth() + 1) + "/" + invoicedAt.getFullYear();
    additiveData["Valor"] = additivesInvoicedInCurrentMonth[i].value.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
    additiveData["Cliente"] = additivesInvoicedInCurrentMonth[i].rentContract.customer.name;
    additiveData["Contrato"] = additivesInvoicedInCurrentMonth[i].contractNumber;
    additiveData["Aditivo"] = additivesInvoicedInCurrentMonth[i].additiveNumber;
    additiveData["Status"] = getPortugueseStatus(additivesInvoicedInCurrentMonth[i].invoiceStatus);

    data.push(additiveData);
  }

  result = data.sort( compare );

  res.send(result)
}