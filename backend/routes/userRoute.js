const express = require('express');
const { registerUser, loginUser, logout, forgotPassword, resetPassword, getUserDetails, updatePassword, updateProfile, getAllUsers, getSingleUser, deleteUser } = require('../controllers/userController');
const router = express.Router();
const isAuthticatedUser = require('../middleware/auth');
const authorizeRoles = require('../middleware/authorizeRole');

// POST route for register request
router.route('/register').post(registerUser);

// POST route for login request
router.route('/login').post(loginUser);

// POST route for forgot password request
router.route('/password/forgot').post(forgotPassword);

router.route('/password/reset/:token').put(resetPassword);

// GET route for logout request
router.route('/logout').get(logout);

router.route('/me').get(isAuthticatedUser, getUserDetails);

router.route('/password/update').put(isAuthticatedUser, updatePassword);

router.route('/me/update').put(isAuthticatedUser, updateProfile);

// Get route for all users (admin)
router.route('/admin/users').get(isAuthticatedUser, authorizeRoles("admin"), getAllUsers);

// Get route for single user (admin)

router.route('/admin/user/:id')
    .get(isAuthticatedUser, authorizeRoles("admin"), getSingleUser)
    .put(isAuthticatedUser,authorizeRoles("admin"), updateProfile)
    .delete(isAuthticatedUser, authorizeRoles("admin"), deleteUser);


module.exports = router;