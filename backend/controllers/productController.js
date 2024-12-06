const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorhandler');
const mongoose = require('mongoose');
//Create a new Product -- Admin Route 
exports.createProduct = async (req,res,next) => {

    const product = await Product.create(req.body);

    res.status(201).json({ 
        success: true,
        product
     });
}

// Get all products -- Public Route
exports.getAllProducts = async(req,res)=>{

    const products = await Product.find()
    
    
    res.status(200).json({
        success: true,
        products
    })
};

// Get a single product -- Public Route
exports.getProductDetails = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Log the incoming ID
        console.log("Product ID:", id);

        // Validate the ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.error("Invalid Product ID");
            return next(new ErrorHandler("Invalid Product ID", 400));
        }

        // Fetch the product
        const product = await Product.findById(id);
        console.log("Inside Product");

        // Handle case where product is not found
        if (!product) {
            console.error("Product Not Found");
            return next(new ErrorHandler("Product not found", 404));
        }

        console.log("Product Found");

        // Return the product details
        res.status(200).json({
            success: true,
            product, // Single product
        });
    } catch (error) {
        console.error("Server Error:", error);
        next(new ErrorHandler("Internal Server Error", 500)); // Pass to your global error handler
    }
};


// Update a Product -- Admin Route

exports.updateProduct = async (req,res,next) => {

    let product = await Product.findById(req.params.id);

    if(!product){
        return res.status(500).json({
            success: false,
            message: 'Product not found'
        })
    }

    // Ensure the _id field is not being updated
    const { _id, ...updateData } = req.body;


    product = await Product.findByIdAndUpdate(req.params.id, updateData,{
        new: true, 
        runValidators: true,
        useFindAndModify:false
    });

    res.status(200).json({
        success: true,
        product  // update product
    })
}

// Delete a Product -- Admin Route

exports.deleteProduct = async (req,res,next) => {

    const product = await Product.findById(req.params.id);

    if(!product){
        return res.status(500).json({
            success: false,
            message: 'Product not found'
        })
    }

    await product.deleteOne({ _id: req.params.id });

    res.status(200).json({
        success: true,
        message: 'Product deleted successfully'
    })
}