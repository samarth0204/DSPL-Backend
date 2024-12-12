const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorhandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ApiFeatures = require('../utils/apiFeatures');

//Create a new Product -- Admin Route 
exports.createProduct = catchAsyncErrors(
    async (req,res,next) => {

        const product = await Product.create(req.body);
    
        res.status(201).json({ 
            success: true,
            product
         });
    }
);

// Get all products -- Public Route
exports.getAllProducts = catchAsyncErrors(
    async(req,res)=>{
    
        console.log('accessing all products');
        
        const apiFeature = new ApiFeatures(Product.find(), req.query).search().filter();

        const products = await apiFeature.query;
        
        
        res.status(200).json({
            success: true,
            products
        })
    }
);

// Get a single product -- Public Route
exports.getProductDetails = catchAsyncErrors(
    async (req, res, next) => {
            
            // Fetch the product
            const product = await Product.findById(req.params.id);
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
        
    }
);


// Update a Product -- Admin Route

exports.updateProduct = catchAsyncErrors(
    async (req,res,next) => {

        let product = await Product.findById(req.params.id);
    
        if(!product){
            return next(new ErrorHandler("Product Not Found", 404));
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
);

// Delete a Product -- Admin Route

exports.deleteProduct = catchAsyncErrors(
    async (req,res,next) => {

        const product = await Product.findById(req.params.id);
    
        if(!product){
            return next(new ErrorHandler("Product Not Found", 404));
        }
    
        await product.deleteOne({ _id: req.params.id });
    
        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        })
    }
);