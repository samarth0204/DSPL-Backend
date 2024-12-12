const express = require('express');
const { getAllProducts, createProduct, updateProduct, deleteProduct, getProductDetails } = require('../controllers/productController');
const isAuthticatedUser = require('../middleware/auth');
const authorizeRoles = require('../middleware/authorizeRole');

const router = express.Router();

router.route("/products").get(isAuthticatedUser, authorizeRoles("admin"), getAllProducts);

// Add new product route
router.route("/product/new").post(createProduct);

// Update product route // Delete product // get single Product by id
router.route("/product/:id").put(updateProduct).delete(deleteProduct).get(getProductDetails);



module.exports = router;