const catchAsyncErrors = require("./catchAsyncErrors");
const ErrorHandler = require('../utils/errorhandler');
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const authorizeRoles = (...roles)=>{
    return (req, res, next)=>{

        if(!req.user || !roles.includes(req.user.role)) {
            return next(
                new ErrorHandler(
                    `Role: ${req.user ? req.user.role : "undefined"} is not allowed to be authorized`,
                     403
                )
        );
        
    }

    next();
    };
};
module.exports = authorizeRoles;