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

    next();

});
module.exports = isAuthticatedUser;


const authorizeRoles = (...roles)=>{
    return (req, res, next)=>{

        if(!roles.includes(req.user.role)){
            return next(
                new ErrorHandler(
                    `Role: ${req.user.role} is not allowed to be authorized`, 403
                )
        );
        
        }

        next();
    };
};

module.exports = authorizeRoles;