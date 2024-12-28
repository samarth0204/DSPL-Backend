const catchAsyncErrors = require("./catchAsyncErrors");
const ErrorHandler = require('../utils/errorhandler');
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const isAuthticatedUser = catchAsyncErrors(async (req, res, next)=>{

    const { token } = req.cookies;

    if(!token){
        return next(new ErrorHandler("Not authorized, token is required", 401));
    };

    const decodedData = jwt.verify(token,process.env.JWT_SECRET);

    req.user = await User.findById(decodedData.id);

    if (!req.user) {
        return next(new ErrorHandler("User not found", 404));
    }
    next();

});
module.exports = isAuthticatedUser;