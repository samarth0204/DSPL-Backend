const catchAsyncErrors = require("./catchAsyncErrors");
const ErrorHandler = require('../utils/errorhandler');
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const isAuthticatedUser = catchAsyncErrors(async (req, res, next)=>{

    const { token } = req.cookies;

    console.log("authenticated user");

    if(!token){
        return next(new ErrorHandler("Not authorized, token is required", 401));
    };

    const decodedData = jwt.verify(token,process.env.JWT_SECRET);

    req.user = await User.findById(decodedData.id);

    if (!req.user) {
        return next(new ErrorHandler("User not found", 404));
    }
    console.log("Authenticated user:", req.user.role); // Debugging
    next();

});
module.exports = isAuthticatedUser;