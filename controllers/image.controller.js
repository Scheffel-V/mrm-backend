const { StatusCodes, getReasonPhrase } = require("http-status-codes");
const db = require("../models");
const handleApiError = require("./utils/apiErrorHandler");
const helpers = require("./utils/helpers")
const model = db.stockItem;


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
      const oldpath = files.image.path;
      const newpath = path.join(__dirname, '..', "images", "stockItemId-" + req.params.id + "-" + files.image.name);
      fs.renameSync(oldpath, newpath);

      const filter = {
        where: { id: req.params.id }
      };

      var stockItem = await db.stockItem.findOne(filter);

      stockItem.update({imageURL: newpath})
        .then(updatedItem => {
            res.status(StatusCodes.CREATED);
            res.send("{\"path\":\"" + newpath + "\"}");
        }).catch((err) => {
            handleApiError(res, err);
        });
    });
};

exports.findOne = (req, res) => {
    model.findOne({
        where: {
          id: req.params.id
        }
      }).then(stockItem => {
        res.download(stockItem.imageURL)
      }).catch(err => {
            handleApiError(res, err);
      });
};