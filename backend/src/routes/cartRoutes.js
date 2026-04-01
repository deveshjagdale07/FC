const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRole } = require('../middleware/auth');
const { body } = require('express-validator');
const cartController = require('../controllers/cartController');

// Get cart
router.get('/', authMiddleware, authorizeRole(['CUSTOMER']), cartController.getCart);

// Add to cart
router.post(
  '/',
  authMiddleware,
  authorizeRole(['CUSTOMER']),
  [
    body('productId').isInt(),
    body('quantity').isInt({ min: 1 }),
  ],
  cartController.addToCart
);

// Update cart item
router.put(
  '/:cartItemId',
  authMiddleware,
  authorizeRole(['CUSTOMER']),
  [
    body('quantity').isInt({ min: 1 }),
  ],
  cartController.updateCartItem
);

// Remove from cart
router.delete(
  '/:cartItemId',
  authMiddleware,
  authorizeRole(['CUSTOMER']),
  cartController.removeFromCart
);

// Clear cart
router.delete(
  '/',
  authMiddleware,
  authorizeRole(['CUSTOMER']),
  cartController.clearCart
);

module.exports = router;
