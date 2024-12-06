const ErrorHandler = require("../utils/errorhandler");


module.exports = (err, req, res, next)=> {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    // wrong mongodb _id error handler
    if (err.name === 'CastError') {
        const message = `Resource not found ${err.path}`;
        err = new ErrorHandler(message, 400);
    };


    res.status(err.statusCode).json({
        success: false,
        error: err,
        
    });
    console.log("Response from server")
}