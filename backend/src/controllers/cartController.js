const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get cart items
const getCart = async (req, res) => {
  try {
    const customerId = req.user.userId;

    const cartItems = await prisma.cartItem.findMany({
      where: { customerId },
      include: {
        product: {
          include: {
            farmer: { select: { id: true, fullName: true } },
          },
        },
      },
    });

    const total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    res.json({
      success: true,
      data: {
        items: cartItems.map(item => ({
          ...item,
          product: {
            ...item.product,
            images: item.product.images ? JSON.parse(item.product.images) : [],
          },
        })),
        total: parseFloat(total.toFixed(2)),
        itemCount: cartItems.length,
      },
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching cart' 
    });
  }
};

// Add to cart
const addToCart = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const { productId, quantity } = req.body;

    // Check if product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
    });

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    if (!product.isActive) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product is not available' 
      });
    }

    if (product.quantity < parseInt(quantity)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Insufficient quantity available' 
      });
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        customerId_productId: {
          customerId,
          productId: parseInt(productId),
        },
      },
    });

    let cartItem;
    if (existingItem) {
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + parseInt(quantity),
        },
        include: {
          product: { include: { farmer: { select: { id: true, fullName: true } } } },
        },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          customerId,
          productId: parseInt(productId),
          quantity: parseInt(quantity),
        },
        include: {
          product: { include: { farmer: { select: { id: true, fullName: true } } } },
        },
      });
    }

    res.json({
      success: true,
      message: 'Item added to cart',
      data: {
        cartItem: {
          ...cartItem,
          product: {
            ...cartItem.product,
            images: cartItem.product.images ? JSON.parse(cartItem.product.images) : [],
          },
        },
      },
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error adding to cart' 
    });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const { cartItemId } = req.params;
    const { quantity } = req.body;

    // Check if cart item exists and belongs to user
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: parseInt(cartItemId) },
      include: { product: true },
    });

    if (!cartItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cart item not found' 
      });
    }

    if (cartItem.customerId !== customerId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }

    // Check product quantity
    if (cartItem.product.quantity < parseInt(quantity)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Insufficient quantity available' 
      });
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: parseInt(cartItemId) },
      data: { quantity: parseInt(quantity) },
      include: { product: { include: { farmer: { select: { id: true, fullName: true } } } } },
    });

    res.json({
      success: true,
      message: 'Cart item updated',
      data: {
        cartItem: {
          ...updatedItem,
          product: {
            ...updatedItem.product,
            images: updatedItem.product.images ? JSON.parse(updatedItem.product.images) : [],
          },
        },
      },
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating cart item' 
    });
  }
};

// Remove from cart
const removeFromCart = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const { cartItemId } = req.params;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: parseInt(cartItemId) },
    });

    if (!cartItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cart item not found' 
      });
    }

    if (cartItem.customerId !== customerId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }

    await prisma.cartItem.delete({
      where: { id: parseInt(cartItemId) },
    });

    res.json({
      success: true,
      message: 'Item removed from cart',
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error removing item from cart' 
    });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    const customerId = req.user.userId;

    await prisma.cartItem.deleteMany({
      where: { customerId },
    });

    res.json({
      success: true,
      message: 'Cart cleared',
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error clearing cart' 
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
