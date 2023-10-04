const { StatusCodes, getReasonPhrase } = require("http-status-codes");
const db = require("../models");
const handleApiError = require("./utils/apiErrorHandler");
const helpers = require("./utils/helpers")
const model = db.rentContract;
const pdfContractModel = db.pdfContract;


exports.create = async (req, res) => {
    const formidable = require('formidable');
    const fs = require('fs');
    const form = new formidable.IncomingForm();
   
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.log("error");
        handleApiError(res, err);
        return;
      }

      const path = require('path');
      console.log(files);

      const oldpath = files.pdf.path;
      const newpath = path.join(__dirname, '..', "pdfContracts", "rentContractId-" + req.params.id + "-pdf-" + (new Date()).toISOString());
      fs.renameSync(oldpath, newpath);

      db.pdfContract.create({
          contractUrl: newpath,
          rentContractId: req.params.id
      }).then(createdItem=> {
          res.status(StatusCodes.CREATED);
          res.send(createdItem);
      }).catch((err) => {
          handleApiError(res, err);
      });
    });
};

exports.findOne = (req, res) => {
    pdfContractModel.findOne({
        where: {
          id: req.params.id
        }
      }).then(pdfContract => {
        res.download(pdfContract.contractUrl)
      }).catch(err => {
            handleApiError(res, err);
      });
};
