const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Add review
const addReview = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const { productId, rating, comment } = req.body;

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rating must be between 1 and 5' 
      });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
    });

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    // Check if customer has already reviewed
    const existingReview = await prisma.review.findUnique({
      where: {
        productId_customerId: {
          productId: parseInt(productId),
          customerId,
        },
      },
    });

    let review;
    if (existingReview) {
      // Update existing review
      review = await prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating: parseInt(rating),
          comment: comment || null,
        },
        include: {
          customer: { select: { id: true, fullName: true, profileImage: true } },
        },
      });
    } else {
      // Create new review
      review = await prisma.review.create({
        data: {
          productId: parseInt(productId),
          customerId,
          rating: parseInt(rating),
          comment: comment || null,
        },
        include: {
          customer: { select: { id: true, fullName: true, profileImage: true } },
        },
      });
    }

    // Recalculate product rating
    const allReviews = await prisma.review.findMany({
      where: { productId: parseInt(productId) },
    });

    const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.product.update({
      where: { id: parseInt(productId) },
      data: {
        rating: parseFloat(averageRating.toFixed(1)),
        totalReviews: allReviews.length,
      },
    });

    res.status(201).json({
      success: true,
      message: existingReview ? 'Review updated successfully' : 'Review added successfully',
      data: { review },
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error adding review' 
    });
  }
};

// Get product reviews
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { productId: parseInt(productId) },
        include: {
          customer: { select: { id: true, fullName: true, profileImage: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.review.count({ where: { productId: parseInt(productId) } }),
    ]);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching reviews' 
    });
  }
};

// Get customer review for a product
const getCustomerReview = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const { productId } = req.params;

    const review = await prisma.review.findUnique({
      where: {
        productId_customerId: {
          productId: parseInt(productId),
          customerId,
        },
      },
      include: {
        customer: { select: { id: true, fullName: true, profileImage: true } },
      },
    });

    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found' 
      });
    }

    res.json({
      success: true,
      data: { review },
    });
  } catch (error) {
    console.error('Get customer review error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching review' 
    });
  }
};

// Delete review
const deleteReview = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const { reviewId } = req.params;

    const review = await prisma.review.findUnique({
      where: { id: parseInt(reviewId) },
    });

    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found' 
      });
    }

    if (review.customerId !== customerId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }

    await prisma.review.delete({
      where: { id: parseInt(reviewId) },
    });

    // Recalculate product rating
    const allReviews = await prisma.review.findMany({
      where: { productId: review.productId },
    });

    const newRating = allReviews.length > 0
      ? parseFloat((allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1))
      : 0;

    await prisma.product.update({
      where: { id: review.productId },
      data: {
        rating: newRating,
        totalReviews: allReviews.length,
      },
    });

    res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting review' 
    });
  }
};

module.exports = {
  addReview,
  getProductReviews,
  getCustomerReview,
  deleteReview,
};
