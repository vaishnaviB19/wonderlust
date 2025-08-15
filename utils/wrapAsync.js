module.exports = function wrapAsync(fn) {
    return function (req, res, next) {
        try {
            const maybePromise = fn(req, res, next);
            if (maybePromise && typeof maybePromise.catch === 'function') {
                maybePromise.catch(next);
            }
        } catch (err) {
            next(err);
        }
    };
};
