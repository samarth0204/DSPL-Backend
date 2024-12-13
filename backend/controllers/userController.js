const ErrorHandler = require('../utils/errorhandler');

const catchAsyncErrors = require('../middleware/catchAsyncErrors');

const User = require('../models/userModel');

const sendToken = require('../utils/jwtToken');

const sendEmail = require('../utils/sendEmail.js');


// Register a User

exports.registerUser = catchAsyncErrors(async (req, res, next) => {
    const { name, email, password } = req.body;

    const user = await User.create({ 
        name, email, password,
        avatar:{
            public_id: 'sample id',
            url: 'sample url',
        }
    });

    // Generate web token
    sendToken(user, 201, res);

});

// Login user
exports.loginUser = catchAsyncErrors(async (req, res, next) =>{

    const { email, password } = req.body;

    //check if user has given password and email both
    if (!email || !password) {
        return next(new ErrorHandler('Please provide email and password', 400));
    }

    const user = await User.findOne({email}).select("+password");
    
    // check if user exists
    if (!user) {
        return next(new ErrorHandler('User not found', 401));
    }
    
    // check if password matches
    const isMatch = await user.comparePassword(password);
    
    // if password does not match, return error
    if (!isMatch) {
        return next(new ErrorHandler('Invalid credentials', 401));
    }
    
    // login user
    sendToken(user, 200, res);
});


// Logout user
exports.logout = catchAsyncErrors(async (req, res, next) => {
    res.cookie('token',null, {
        expires: new Date(Date.now()),
        httpOnly: true
    });
    res.status(200).json({
        success: true,
        message: 'User logged out successfully'
    });
});


// Forgot password

exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    
    if (!user) {
        return next(new ErrorHandler('No user found with that email', 404));
    }

    // get resetPasswordToken
    const resetToken = user.getPasswordResetToken();

    console.log(`usercontroller/  get resetPasswordToken : ${resetToken}`);
    try {
        await user.save({ validateBeforeSave: false });
    } catch (error) {
        console.error("Error saving user:", error);
        return next(new ErrorHandler("Failed to save user data. Please try again.", 500));
    }

    // url for reset password
    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;

    const message = `Your reset password token : \n \n ${resetPasswordUrl}, \n \n If you have not requested this email then please ignore it.`;

    try {
        await sendEmail({
            // send email here
            email: user.email,
            subject: 'DSPL Password Reset',
            message
        });
        res.status(200).json({
            success: true,
            message: 'Reset password email sent successfully'
        });
    }
    catch(error){

        console.error("Error sending email:", error);

        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({validateBeforeSave: false});

        return next(new ErrorHandler('Failed to send email. Please try again', 500));
    }

});

