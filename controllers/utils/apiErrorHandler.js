const { StatusCodes, getReasonPhrase } = require("http-status-codes");


module.exports = (res, err) => {
    console.log(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    res.send({
        message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        error: err
    });
}