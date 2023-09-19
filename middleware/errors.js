const createError = require('http-errors');

const errorHandler = (async (req, res, next) => {
    next(createError(404, 'This route does not exist'));
});

const errorProcess = (err, req, res, next) => {
    res.status(err.status || 500)
    res.send({
        error: {
            status: err.status || 500,
            message: err.message
        }
    })
};



module.exports = {errorHandler, errorProcess};