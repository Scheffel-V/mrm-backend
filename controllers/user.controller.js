const { StatusCodes, getReasonPhrase } = require("http-status-codes");
const db = require("../models");
const handleApiError = require("./utils/apiErrorHandler");
const { Op } = require("sequelize");
const { addXTotalCount } = require("./utils/headerHelper");
const model = db.user;

exports.create = (req, res) => {
  model.create({
    username: req.body.username,
    password: req.body.password
  }).then(submitedUser => {
    res.status(StatusCodes.CREATED);
    res.send(submitedUser);
  }).catch((err) => {
    handleApiError(res, err);
  });
};

exports.findAll = (req, res) => {
  model.findAll()
    .then(users => {
      addXTotalCount(res, users.length);
      res.send(users);
    })
    .catch((err) => {
      handleApiError(res, err);
    });
};

exports.findOne = (req, res) => {
  model.findAll({
    where: {
      username: req.params.username
    }
  }).then(users => {
    if (users.length > 0) {
      res.send(users[0]);
    } else {
      res.status(StatusCodes.NOT_FOUND);
      res.send(
        {
          "message": getReasonPhrase(StatusCodes.NOT_FOUND)
        }
      );
    }
  })
    .catch(err => {
      handleApiError(res, err);
    });
};

exports.deleteOne = (req, res) => {
  model.destroy({
    where: {
      username: req.params.username
    }
  }).then(() => res.send());
};

exports.deleteAll = (req, res) => {
  model.destroy({
    where: {
      // all records
    },
    truncate: true
  }).then(() => res.send());
};

exports.update = async (req, res) => {

  model.update(
    {
      password: req.body.password
    },
    {
      where: { username: req.params.username }
    }
  ).then((newObject) => res.send(newObject));
};
