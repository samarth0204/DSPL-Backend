const ErrorHandler = require("../utils/errorhandler");


module.exports = (err, req, res, next)=> {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    // Handle invalid MongoDB ObjectId (CastError)
    if (err.name === 'CastError') {
        const message = `Resource not found ${err.path}`;
        err = new ErrorHandler(message, 400);
    };

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const message = `Duplicate field value in database at ${Object.keys(err.keyValue)} `;
        err = new ErrorHandler(message, 400);
    }

    // wrong JWT error
    if (err.name === 'JsonWebTokenError') {
        const message = `Json Web token is invalid, Try again.`;
        err = new ErrorHandler(message, 400);
    };

    if (err.name === 'TokenExpirederror'){
        const message = `Json Web token is Expired, Try again.`;
        err = new ErrorHandler(message, 400);
    };

    res.status(err.statusCode).json({
        success: false,
        message: err.message
        
    });
    console.log("Response from server : error.js ")
}