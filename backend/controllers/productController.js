const Product = require('../models/productModel');

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
exports.getProductDetails = async (req,res,next) => {
    
    const product = await Product.findById(req.params.id);
    
    if(!product){
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        })
    }
    
    res.status(200).json({
        success: true,
        product // single product
    })
}

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