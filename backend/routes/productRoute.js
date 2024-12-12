const express = require('express');
const { getAllProducts, createProduct, updateProduct, deleteProduct, getProductDetails } = require('../controllers/productController');
const isAuthticatedUser = require('../middleware/auth');
//const authorizeRoles = require('../middleware/auth');

const router = express.Router();

router.route("/products").get(isAuthticatedUser, getAllProducts);

// Add new product route
router.route("/product/new").post(isAuthticatedUser, createProduct);

// Update product route
router.route("/product/:id").put(isAuthticatedUser, updateProduct).delete(isAuthticatedUser, deleteProduct).get(getProductDetails);



module.exports = router;