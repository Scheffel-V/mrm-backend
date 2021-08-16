const handleApiError = require("./apiErrorHandler");

const _hasInvalidQuery = (req, res, model) => {
    if (req.query) {
        const queryAttributes = new Set(Object.keys(req.query));
        const possibleAttributes = new Set(Object.keys(model.rawAttributes));
        const notValidAttributes = new Set(
          [...queryAttributes].filter(x => !possibleAttributes.has(x))
        );
    
        if (notValidAttributes.size > 0) {
          handleApiError(res, `Not valid query parameters: ${Array.from(notValidAttributes).join(",")}`);
          return true;
        }
    }
    return false;
}

exports.hasInvalidQuery = _hasInvalidQuery;