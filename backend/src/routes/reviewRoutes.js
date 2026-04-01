const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRole } = require('../middleware/auth');
const { body } = require('express-validator');
const reviewController = require('../controllers/reviewController');

// Add/Update review (Customer only)
router.post(
  '/',
  authMiddleware,
  authorizeRole(['CUSTOMER']),
  [
    body('productId').isInt(),
    body('rating').isInt({ min: 1, max: 5 }),
    body('comment').optional().trim(),
  ],
  reviewController.addReview
);

// Get product reviews
router.get('/product/:productId', reviewController.getProductReviews);

// Get customer review for product
router.get(
  '/product/:productId/customer',
  authMiddleware,
  authorizeRole(['CUSTOMER']),
  reviewController.getCustomerReview
);

// Delete review (Customer only)
router.delete(
  '/:reviewId',
  authMiddleware,
  authorizeRole(['CUSTOMER']),
  reviewController.deleteReview
);

module.exports = router;
