const express = require('express');
const router = express.Router();
const isAuthticatedUser = require('../middleware/auth');
const { newOrder } = require('../controllers/orderController');

router.route("/order/new").post(isAuthticatedUser, newOrder);

module.exports = router;