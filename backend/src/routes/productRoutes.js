const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRole } = require('../middleware/auth');
const upload = require('../config/multer');
const productController = require('../controllers/productController');

// Get all products (public)
router.get('/', productController.getAllProducts);

// Get product by ID (public)
router.get('/:id', productController.getProductById);

// Get products by farmer
router.get('/farmer/:farmerId', productController.getFarmerProducts);

// Create product (Farmer only)
router.post(
  '/',
  authMiddleware,
  authorizeRole(['FARMER']),
  upload.array('images', 5),
  productController.createProduct
);

// Update product (Farmer only)
router.put(
  '/:id',
  authMiddleware,
  authorizeRole(['FARMER']),
  upload.array('images', 5),
  productController.updateProduct
);

// Delete product (Farmer only)
router.delete(
  '/:id',
  authMiddleware,
  authorizeRole(['FARMER']),
  productController.deleteProduct
);

module.exports = router;
