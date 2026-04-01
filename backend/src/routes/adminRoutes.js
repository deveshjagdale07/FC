const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRole } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// All admin routes require authentication and ADMIN role
router.use(authMiddleware, authorizeRole(['ADMIN']));

// User management
router.get('/users', adminController.getAllUsers);
router.put('/users/:userId/deactivate', adminController.deactivateUser);
router.put('/users/:userId/activate', adminController.activateUser);

// Product management
router.get('/products', adminController.getAllProducts);

// Order management
router.get('/orders', adminController.getAllOrders);

// Dashboard stats
router.get('/dashboard/stats', adminController.getDashboardStats);

module.exports = router;
