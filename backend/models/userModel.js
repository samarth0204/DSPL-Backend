const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const crypto = require('crypto');

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, 'Please enter your name'],
        minlength: [4, 'Name should be at least 4 characters'],
        maxlength: [30, 'Name should be at most 30 characters']
    },

    email: {
        type: String,
        required: [true, 'Please enter your email'],
        unique: true,
        validate: [validator.isEmail, 'Please enter a valid email']
    },

    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minlength: [8, 'Password should be at least 8 characters'],
        select: false,
    },
    avatar: {
            public:{
                type: String,
                //required: true
            },
            url:{
                type: String,
                //required: true
            }
    },

    role: {
        type: String,
        default: 'user'
    },

    resetPasswordToken: String,
    resetPasswordExpire: Date,
    
});

// Encrypt password before saving it to the database
userSchema.pre("save",async function(next){

    if(!this.isModified("password")){
        next();
    }
    this.password = await bcrypt.hash(this.password,10);
});

// JWT Token
userSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};
// Compare password

userSchema.methods.comparePassword = async function (enteredpassword) {
    return await bcrypt.compare(enteredpassword, this.password);
};

// Generating Password reset token
userSchema.methods.getPasswordResetToken = function (){

    // Generating Password reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hashing and adding resetPasswordToken to userSchema
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    
    // Setting resetPasswordExpire to 1 hour from now
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    
    return resetToken;
}



module.exports = mongoose.model('User', userSchema);