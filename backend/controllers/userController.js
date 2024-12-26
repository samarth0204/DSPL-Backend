const ErrorHandler = require('../utils/errorhandler');

const catchAsyncErrors = require('../middleware/catchAsyncErrors');

const User = require('../models/userModel');

const sendToken = require('../utils/jwtToken');

const sendEmail = require('../utils/sendEmail.js');

const crypto = require('crypto');

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

// Reset password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {

    // Creating token hash
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        return next(new ErrorHandler('Invalid token or token expired', 400));
    }
    //Password does not match
    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler('Passwords do not match', 400));
    }
    // Update password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    // Generate and send token
    // user will login
    sendToken(user, 200, res);

});

// Get user profile

exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({
        success: true,
        user
    });
});
// Update user password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
    try {
        // Fetch the user with their password
        const user = await User.findById(req.user.id).select('+password');

        // Check if user exists
        if (!user) {
            return next(new ErrorHandler('User not found', 404));
        }

        console.log(user);
        console.log(typeof user.comparePassword); // Should output "function"

        // Check if the old password matches the user's current password
        const isPasswordMatched = await user.comparePassword(req.body.oldpassword);
        if (!isPasswordMatched) {
            return next(new ErrorHandler('Incorrect current password', 401));
        }

        // Validate the presence of newpassword and confirmPassword
        if (!req.body.newpassword || !req.body.confirmPassword) {
            return next(new ErrorHandler('New password and confirmation are required', 400));
        }

        // Check if new passwords match
        if (req.body.newpassword !== req.body.confirmPassword) {
            return next(new ErrorHandler('Passwords do not match', 400));
        }

        // Update the user's password
        user.password = req.body.newpassword;

        // Save the updated user to the database
        await user.save();

        // Send token to log the user in after password update
        sendToken(user, 200, res);

    } catch (error) {
        console.error('Error in updating password:', error);
        return next(new ErrorHandler('Failed to update password. Please try again.', 500));
    }
});


// Update User Profile --Admin

exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
       // avatar: req.body.avatar
    }
    //we will add cloudinary later

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, { 
        new: true,
        runValidators: true,
        useFindAndModify:false
    });

    if (!user) {
        return next(new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
    });
});

// Delete User (Admin)

exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    //  //we will remove cloudinary later
    if (!user) {
        return next(new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 404));
    }
    await user.deleteOne();

    res.status(200).json({
        success: true,
        message: 'User deleted successfully'
    });
});

// Get All Users (Admin)
exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
    const users = await User.find().select('-password');
    res.status(200).json({
        success: true,
        users
    });
});


// Get Single Users (Admin)
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 404));
    }
    res.status(200).json({
        success: true,
        user
    });
});
