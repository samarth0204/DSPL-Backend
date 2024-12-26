const express = require('express');
const { getAllProducts, createProduct, updateProduct, deleteProduct, getProductDetails, createProductReview, getProductReviews, deleteReviews } = require('../controllers/productController');
const isAuthticatedUser = require('../middleware/auth');
const authorizeRoles = require('../middleware/authorizeRole');

const router = express.Router();

router.route("/products").get(getAllProducts);

// Add new product route
router.route("/admin/product/new").post(isAuthticatedUser, authorizeRoles("admin"), createProduct);

// Update product route // Delete product 
router.route("/admin/product/:id").put(isAuthticatedUser, authorizeRoles("admin"), updateProduct)
                            .delete(isAuthticatedUser, authorizeRoles("admin"), deleteProduct)
                            
// get single Product by id
router.route("/product/:id").get(getProductDetails);

router.route("/review").put(isAuthticatedUser, createProductReview);

router.route("/review")
    .get(getProductReviews)
    .delete(isAuthticatedUser, deleteReviews);

module.exports = router;