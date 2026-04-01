const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRole } = require('../middleware/auth');
const { body } = require('express-validator');
const orderController = require('../controllers/orderController');

// Create order (Customer only)
router.post(
  '/',
  authMiddleware,
  authorizeRole(['CUSTOMER']),
  [
    body('deliveryAddress').notEmpty().trim(),
    body('paymentMethod').isIn(['COD', 'ONLINE']),
  ],
  orderController.createOrder
);

// Get customer orders
router.get(
  '/customer/orders',
  authMiddleware,
  authorizeRole(['CUSTOMER']),
  orderController.getCustomerOrders
);

// Get farmer orders
router.get(
  '/farmer/orders',
  authMiddleware,
  authorizeRole(['FARMER']),
  orderController.getFarmerOrders
);

// Get order by ID
router.get(
  '/:orderId',
  authMiddleware,
  orderController.getOrderById
);

// Update order status
router.put(
  '/:orderId',
  authMiddleware,
  [
    body('status').isIn(['PENDING', 'ACCEPTED', 'REJECTED', 'SHIPPED', 'DELIVERED']),
  ],
  orderController.updateOrderStatus
);

module.exports = router;
