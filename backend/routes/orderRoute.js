const express = require('express');
const router = express.Router();
const isAuthticatedUser = require('../middleware/auth');
const authorizeRoles = require('../middleware/authorizeRole');
const { newOrder, myOrders, getSingleOrder } = require('../controllers/orderController');

router.route("/order/new").post(isAuthticatedUser, newOrder);

router.route("/admin/order/:id").get(isAuthticatedUser, authorizeRoles("admin"), getSingleOrder);

router.route("/order/me").get(isAuthticatedUser, myOrders);


module.exports = router;