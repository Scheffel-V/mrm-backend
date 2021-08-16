const addXTotalCount = (res, count) => {
    res.set('X-Total-Count', count);
    res.set('Access-Control-Expose-Headers', 'X-Total-Count');
}

exports.addXTotalCount = addXTotalCount;