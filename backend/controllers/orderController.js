const Order = require('../models/orderModels');
const ErrorHandler = require('../utils/errorhandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const Product = require('../models/productModel');
const mongoose = require("mongoose");


// Create a new Order -- User Route
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
    const {
        shippingInfo,
        orderItems, 
        paymentInfo, 
        itemsPrice, 
        taxPrice, 
        shippingPrice, 
        totalPrice
    } = req.body;

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt: Date.now(),
        user: req.user._id,
    });
    
    res.status(201).json({
        success: true,
        order
    });
});


exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
    // Check if the order ID is valid
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return next(new ErrorHandler("Invalid Order ID", 400));
    }

    const order = await Order.findById(req.params.id).populate("user", "name email");

    console.log(`Order Id: ${req.params.id}`);
    if (!order) {
        return next(new ErrorHandler("Order not found", 404));
    }

    res.status(200).json({
        success: true,
        order
    });
});

exports.myOrders = catchAsyncErrors(async (req, res, next) => {
    // Check if req.user._id is set
    if (!req.user || !req.user._id) {
        return next(new ErrorHandler("User not authenticated", 401));
    }

    console.log("User ID:", req.user._id);

    const orders = await Order.find({ user: req.user._id });
    
    // If no orders are found, handle it
    if (!orders || orders.length === 0) {
        return res.status(404).json({
            success: false,
            message: "No orders found for this user."
        });
    }

    res.status(200).json({
        success: true,
        orders
    });
});
