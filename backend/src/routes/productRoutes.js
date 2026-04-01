const express = require('express');
const multer = require('multer');
const router = express.Router();
const { authMiddleware, authorizeRole } = require('../middleware/auth');
const upload = require('../config/multer');
const productController = require('../controllers/productController');

// Error handling middleware for multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File size exceeds 5MB limit' });
    }
    return res.status(400).json({ success: false, message: err.message });
  } else if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
};

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
  upload.single('images'),
  handleUploadError,
  productController.createProduct
);

// Update product (Farmer only)
router.put(
  '/:id',
  authMiddleware,
  authorizeRole(['FARMER']),
  upload.single('images'),
  handleUploadError,
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
