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

// get Single Order 
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
    // Check if the order ID is valid
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return next(new ErrorHandler("Invalid Order ID", 400));
    }

    const order = await Order.findById(req.params.id).populate("user", "name email");

    if (!order) {
        return next(new ErrorHandler("Order not found", 404));
    }

    res.status(200).json({
        success: true,
        order
    });
});

// Get Logged In User Orders
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
    // Check if req.user._id is set
    if (!req.user || !req.user._id) {
        return next(new ErrorHandler("User not authenticated", 401));
    }

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

// Get All Orders -- Admin Route
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find();

    let totalAmount = 0;
    orders.forEach(order => {
        totalAmount += order.totalPrice;
    });

    res.status(200).json({
        success: true,
        totalAmount,
        orders
    });
});


// // update Order Status -- Admin Route
// exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
//     const order = await Order.findById(req.params.id);

//     if(order.orderStatus === "Delivered") {
//         return next(new ErrorHandler("Order has already been delivered", 400));
//     }

//     order.orderItems.forEach(async o => {
//         await updateStock(o.product, o.quantity);
//     });

//     order.orderStatus = req.body.status;
    
//     if(req.body.status === "Delivered") {
//         order.deliveredAt = Date.now();
//     }

//     await order.save(validateBeforeSave = false);


//     res.status(200).json({
//         success: true,
//     });
// });

// async function updateStock(id, quantity) {
//     const product = await Product.findById(id);
//     console.log("Product found:", product);

//     product.stock = product.stock - quantity;

//     await product.save(validateBeforeSave = false);
// }

// update Order Status -- Admin Route
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHandler("Order not found", 404));
    }

    if (order.orderStatus === "Delivered") {
        return next(new ErrorHandler("Order has already been delivered", 400));
    }


    // Use `for...of` to handle async updates sequentially
    for (const o of order.orderItems) {
        await updateStock(o.product, o.quantity);
    }

    order.orderStatus = req.body.status;

    if (req.body.status === "Delivered") {
        order.deliveredAt = Date.now();
    }

    await order.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
    });
});

// Update stock for a product
async function updateStock(id, quantity) {
    const product = await Product.findById(id);

    if (!product) {
        throw new Error(`Product with ID ${id} not found`);
    }

    product.stock = product.stock - quantity;

    await product.save({ validateBeforeSave: false });

}

// Delete Order -- Admin Route
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);  
    if(!order) {
        return next(new ErrorHandler("Order not found", 404));
    }
    await order.deleteOne();
    res.status(200).json({
        success: true,
        message: "Order deleted successfully"
    });
});
