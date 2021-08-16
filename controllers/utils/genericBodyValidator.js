const { StatusCodes } = require("http-status-codes");
const { Op } = require("sequelize");

async function isInvalidId(req, res, model) {
  const found = await model.count({
    where: {
      id: {
        [Op.eq]: req.params.id
      }
    }
  });
  if (found == 0) {
    res.status(StatusCodes.NOT_FOUND);
    res.send({
      message: "The given id was not found"
    });
    return true;
  }
  return false;
}

function isIdNotPresent(req, res) {
    if (!req.params.id) {
      res.status(StatusCodes.BAD_REQUEST);
      res.send({
        message: "Parameter id is required for updates"
      });
      return true;
    }
    return false;
}
  
function getModelValueIfUndefined(bodyValue, modelValue) {
  return bodyValue === undefined ? modelValue : bodyValue;
}


exports.isInvalidId = isInvalidId;
exports.isIdNotPresent = isIdNotPresent;
exports.getModelValueIfUndefined = getModelValueIfUndefined;