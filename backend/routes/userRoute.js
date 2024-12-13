const express = require('express');
const { registerUser, loginUser, logout, forgotPassword } = require('../controllers/userController');
const router = express.Router();

// POST route for register request
router.route('/register').post(registerUser);

// POST route for login request
router.route('/login').post(loginUser);

// POST route for forgot password request
router.route('/password/forgot').post(forgotPassword);

// GET route for logout request
router.route('/logout').get(logout);

module.exports = router;