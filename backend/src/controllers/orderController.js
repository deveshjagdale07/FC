const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Generate unique order number
const generateOrderNumber = () => {
  return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

// Create order from cart
const createOrder = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const { deliveryAddress, paymentMethod } = req.body;

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { customerId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cart is empty' 
      });
    }

    // Calculate total and check stock
    let totalPrice = 0;
    for (const item of cartItems) {
      if (item.product.quantity < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock for ${item.product.name}` 
        });
      }
      totalPrice += item.product.price * item.quantity;
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        customerId,
        orderNumber: generateOrderNumber(),
        totalPrice: parseFloat(totalPrice.toFixed(2)),
        deliveryAddress,
        paymentMethod: paymentMethod || 'COD',
        status: 'PENDING',
        paymentStatus: paymentMethod === 'ONLINE' ? 'PENDING' : 'PENDING',
      },
    });

    // Create order items and update product quantities
    const orderItems = await Promise.all(
      cartItems.map(async (item) => {
        // Create order item
        const orderItem = await prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            priceAtOrder: item.product.price,
          },
        });

        // Update product quantity
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            quantity: { decrement: item.quantity },
          },
        });

        return orderItem;
      })
    );

    // Clear cart
    await prisma.cartItem.deleteMany({ where: { customerId } });

    // Fetch complete order with items
    const completeOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                farmer: { select: { id: true, fullName: true, email: true } },
              },
            },
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order: {
          ...completeOrder,
          items: completeOrder.items.map(item => ({
            ...item,
            product: {
              ...item.product,
              images: item.product.images ? JSON.parse(item.product.images) : [],
            },
          })),
        },
      },
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating order' 
    });
  }
};

// Get customer orders
const getCustomerOrders = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const { status, page = 1, limit = 10 } = req.query;

    const where = { customerId };
    if (status) where.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                include: {
                  farmer: { select: { id: true, fullName: true } },
                },
              },
            },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        orders: orders.map(order => ({
          ...order,
          items: order.items.map(item => ({
            ...item,
            product: {
              ...item.product,
              images: item.product.images ? JSON.parse(item.product.images) : [],
            },
          })),
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching orders' 
    });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        items: {
          include: {
            product: {
              include: {
                farmer: { select: { id: true, fullName: true, email: true, phone: true } },
              },
            },
          },
        },
        customer: { select: { id: true, fullName: true, email: true, phone: true, address: true } },
      },
    });

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Check authorization
    if (userRole !== 'ADMIN' && order.customerId !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }

    res.json({
      success: true,
      data: {
        order: {
          ...order,
          items: order.items.map(item => ({
            ...item,
            product: {
              ...item.product,
              images: item.product.images ? JSON.parse(item.product.images) : [],
            },
          })),
        },
      },
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching order' 
    });
  }
};

// Get farmer orders
const getFarmerOrders = async (req, res) => {
  try {
    const farmerId = req.user.userId;
    const { status, page = 1, limit = 10 } = req.query;

    const where = {};
    if (status) where.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get orders containing products from this farmer
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            where: {
              product: { farmerId },
            },
            include: {
              product: {
                include: {
                  farmer: { select: { id: true, fullName: true } },
                },
              },
            },
          },
          customer: { select: { id: true, fullName: true, email: true, phone: true, address: true } },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    // Filter orders to only include those with items from this farmer
    const farmerOrders = orders.filter(order => order.items.length > 0);

    res.json({
      success: true,
      data: {
        orders: farmerOrders.map(order => ({
          ...order,
          items: order.items.map(item => ({
            ...item,
            product: {
              ...item.product,
              images: item.product.images ? JSON.parse(item.product.images) : [],
            },
          })),
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: farmerOrders.length,
        },
      },
    });
  } catch (error) {
    console.error('Get farmer orders error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching orders' 
    });
  }
};

// Update order status (Farmer can accept/reject, Admin can change any status)
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Authorization: Only farmer whose product is in order or admin can update
    if (userRole === 'FARMER') {
      const isFarmerProduct = order.items.some(item => item.product.farmerId === userId);
      if (!isFarmerProduct) {
        return res.status(403).json({ 
          success: false, 
          message: 'Unauthorized' 
        });
      }
    } else if (userRole !== 'ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: { status },
      include: {
        items: {
          include: {
            product: {
              include: {
                farmer: { select: { id: true, fullName: true } },
              },
            },
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Order status updated',
      data: {
        order: {
          ...updatedOrder,
          items: updatedOrder.items.map(item => ({
            ...item,
            product: {
              ...item.product,
              images: item.product.images ? JSON.parse(item.product.images) : [],
            },
          })),
        },
      },
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating order' 
    });
  }
};

module.exports = {
  createOrder,
  getCustomerOrders,
  getOrderById,
  getFarmerOrders,
  updateOrderStatus,
};
