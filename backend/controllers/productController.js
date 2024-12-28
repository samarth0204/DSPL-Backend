const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorhandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ApiFeatures = require('../utils/apiFeatures');

//Create a new Product -- Admin Route 
exports.createProduct = catchAsyncErrors(
    async (req,res,next) => {

        req.body.user = req.user.id;
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
    
            // Handle case where product is not found
            if (!product) {
                console.error("Product Not Found");
                return next(new ErrorHandler("Product not found", 404));
            }
    
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

// Create New Review and update the existing review
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {

    const {rating, comment, productId} = req.body;
    const review = {
        user: req.user.id,
        name: req.user.name,
        rating: Number(rating),
        comment
    };
    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find(
        (rev) => rev.user.toString() === req.user._id.toString()
    );

    // Update the product's rating and number of reviews if the user has already reviewed the product
    if(isReviewed){
        product.reviews.forEach((rev) =>{
            if(rev.user.toString() === req.user._id.toString()){
                (rev.rating = rating),
                (rev.comment = comment)
            }
        });
    }
    else{
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
       
    }

    // average rating of all reviews
    let avg = 0;
    product.reviews.forEach((rev) => {
        avg += rev.rating;
    }); 

    product.ratings= avg / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        message: 'Review created or updated successfully'
    });
});

// Get all reviews of a product
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
    const productId = req.params.id; // Get product ID from route parameter

    const product = await Product.findById(productId); // Fetch product by ID

    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

    res.status(200).json({
        success: true,
        reviews: product.reviews || [] // Return reviews if available
    });
});


// // Delete a product review 
// exports.deleteReviews = catchAsyncErrors(async (req, res, next) => {
//     const product = await Product.findById(req.query.id);
//     if(!product){
//         return next(new ErrorHandler("Product not found", 404));
//     }

//     const reviews = product.reviews.filter(
//             (rev) => rev._id.toString() !== req.query.id.toString()
//         );

        
//     // average rating of all reviews
//     let avg = 0;
//     reviews.forEach((rev) => {
//         avg += rev.rating;
//     }); 

//     const ratings= avg / reviews.length;

//     const numOfReviews = reviews.length;

//     await product.findByIdAndUpdate(req.query.productId, {
//         reviews,
//         ratings,
//         numOfReviews
//         }, 
//         { 
//         new: true,
//         useFindAndModify: false,
//         runValidators: true,
//         });

    
//         res.status(200).json({
//             success: true
//         });
// });


// Delete a product review //for postman /reviewId/?=productId=<product Id>
exports.deleteReviews = catchAsyncErrors(async (req, res, next) => {
    const { id: reviewId } = req.params; // Review ID from URL path
    const { productId } = req.query;    // Product ID from query parameters

    const product = await Product.findById(productId);

    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

    // Filter out the review from the product's reviews array
    const reviews = product.reviews.filter(
        (rev) => rev._id.toString() !== reviewId
    );

    if (reviews.length === product.reviews.length) {
        return next(new ErrorHandler("Review not found", 404));
    }

    product.reviews = reviews;
    await product.save();

    res.status(200).json({
        success: true,
        message: "Review deleted successfully",
    });
});
