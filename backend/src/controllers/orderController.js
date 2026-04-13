const { PrismaClient } = require('@prisma/client');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const config = require('../config/config');

const prisma = new PrismaClient();

const razorpayClient = new Razorpay({
  key_id: config.razorpay.keyId,
  key_secret: config.razorpay.keySecret,
});

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

// Create Razorpay order for checkout
const createRazorpayOrder = async (req, res) => {
  try {
    const customerId = req.user.userId;

    const cartItems = await prisma.cartItem.findMany({
      where: { customerId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty',
      });
    }

    let totalPrice = 0;
    for (const item of cartItems) {
      if (item.product.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.product.name}`,
        });
      }
      totalPrice += item.product.price * item.quantity;
    }

    const amount = Math.round(totalPrice * 100); // amount in paise
    const razorpayOrder = await razorpayClient.orders.create({
      amount,
      currency: 'INR',
      payment_capture: 1,
    });

    res.json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: config.razorpay.keyId,
      },
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment order',
    });
  }
};

// Verify Razorpay payment and create order
const verifyRazorpayPayment = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const { deliveryAddress, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    const generatedSignature = crypto
      .createHmac('sha256', config.razorpay.keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
      });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { customerId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty',
      });
    }

    let totalPrice = 0;
    for (const item of cartItems) {
      if (item.product.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.product.name}`,
        });
      }
      totalPrice += item.product.price * item.quantity;
    }

    const order = await prisma.order.create({
      data: {
        customerId,
        orderNumber: generateOrderNumber(),
        totalPrice: parseFloat(totalPrice.toFixed(2)),
        deliveryAddress,
        paymentMethod: 'ONLINE',
        status: 'PENDING',
        paymentStatus: 'COMPLETED',
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
      },
    });

    const orderItems = await Promise.all(
      cartItems.map(async (item) => {
        const orderItem = await prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            priceAtOrder: item.product.price,
          },
        });

        await prisma.product.update({
          where: { id: item.productId },
          data: {
            quantity: { decrement: item.quantity },
          },
        });

        return orderItem;
      })
    );

    await prisma.cartItem.deleteMany({ where: { customerId } });

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
      message: 'Payment verified and order created successfully',
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
    console.error('Verify Razorpay payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
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

    const totalRevenue = farmerOrders.reduce((orderSum, order) => {
      return orderSum + order.items.reduce((itemSum, item) => {
        return itemSum + ((item.priceAtOrder || 0) * (item.quantity || 0));
      }, 0);
    }, 0);

    const totalItemsSold = farmerOrders.reduce((orderSum, order) => {
      return orderSum + order.items.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0);
    }, 0);

    const uniqueProductIds = new Set();
    farmerOrders.forEach((order) => {
      order.items.forEach((item) => {
        uniqueProductIds.add(item.product?.id || item.productId);
      });
    });

    const orderStatusCounts = farmerOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    const paymentMethodCounts = farmerOrders.reduce((acc, order) => {
      acc[order.paymentMethod] = (acc[order.paymentMethod] || 0) + 1;
      return acc;
    }, {});

    const paymentStatusCounts = farmerOrders.reduce((acc, order) => {
      acc[order.paymentStatus] = (acc[order.paymentStatus] || 0) + 1;
      return acc;
    }, {});

    const stats = {
      totalOrders: farmerOrders.length,
      totalRevenue,
      totalItemsSold,
      uniqueProductsSold: uniqueProductIds.size,
      averageOrderValue: farmerOrders.length ? totalRevenue / farmerOrders.length : 0,
      orderStatusCounts,
      paymentMethodCounts,
      paymentStatusCounts,
    };

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
        stats,
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

// Get farmer payment summary and withdrawal requests
const getFarmerPayments = async (req, res) => {
  try {
    const farmerId = req.user.userId;

    const farmerItems = await prisma.orderItem.findMany({
      where: {
        product: { farmerId },
      },
      include: {
        order: true,
      },
    });

    const totalCompletedEarnings = farmerItems.reduce((sum, item) => {
      return item.order.paymentStatus === 'COMPLETED'
        ? sum + (item.priceAtOrder * item.quantity)
        : sum;
    }, 0);

    const totalPendingEarnings = farmerItems.reduce((sum, item) => {
      return item.order.paymentStatus !== 'COMPLETED'
        ? sum + (item.priceAtOrder * item.quantity)
        : sum;
    }, 0);

    const withdrawalRequests = await prisma.withdrawalRequest.findMany({
      where: { farmerId },
      orderBy: { requestedAt: 'desc' },
    });

    const totalApprovedWithdrawn = withdrawalRequests
      .filter((request) => request.status === 'APPROVED')
      .reduce((sum, request) => sum + request.amount, 0);

    const totalRequested = withdrawalRequests.reduce((sum, request) => sum + request.amount, 0);

    const summary = {
      totalCompletedEarnings,
      totalPendingEarnings,
      totalWithdrawn: totalApprovedWithdrawn,
      totalRequested,
      availableBalance: Math.max(totalCompletedEarnings - totalApprovedWithdrawn, 0),
      withdrawalRequestsCount: withdrawalRequests.length,
    };

    res.json({
      success: true,
      data: {
        summary,
        withdrawals: withdrawalRequests,
      },
    });
  } catch (error) {
    console.error('Get farmer payment summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment details',
    });
  }
};

const createWithdrawalRequest = async (req, res) => {
  try {
    const farmerId = req.user.userId;
    const { amount, method, bankName, accountNumber, ifscCode, upiId } = req.body;

    const parsedAmount = parseFloat(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Enter a valid withdrawal amount' });
    }

    const farmerItems = await prisma.orderItem.findMany({
      where: {
        product: { farmerId },
      },
      include: {
        order: true,
      },
    });

    const totalCompletedEarnings = farmerItems.reduce((sum, item) => {
      return item.order.paymentStatus === 'COMPLETED'
        ? sum + (item.priceAtOrder * item.quantity)
        : sum;
    }, 0);

    const approvedWithdrawals = await prisma.withdrawalRequest.aggregate({
      where: { farmerId, status: 'APPROVED' },
      _sum: { amount: true },
    });

    const currentBalance = totalCompletedEarnings - (approvedWithdrawals._sum.amount || 0);
    if (parsedAmount > currentBalance) {
      return res.status(400).json({
        success: false,
        message: 'Withdrawal amount exceeds available balance',
      });
    }

    if (method === 'BANK') {
      if (!bankName || !accountNumber || !ifscCode) {
        return res.status(400).json({
          success: false,
          message: 'Bank name, account number and IFSC code are required for bank transfers',
        });
      }
    }

    if (method === 'UPI' && !upiId) {
      return res.status(400).json({
        success: false,
        message: 'UPI ID is required for UPI transfers',
      });
    }

    const withdrawal = await prisma.withdrawalRequest.create({
      data: {
        farmerId,
        amount: parsedAmount,
        method,
        bankName: method === 'BANK' ? bankName : null,
        accountNumber: method === 'BANK' ? accountNumber : null,
        ifscCode: method === 'BANK' ? ifscCode : null,
        upiId: method === 'UPI' ? upiId : null,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      data: withdrawal,
    });
  } catch (error) {
    console.error('Create withdrawal request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting withdrawal request',
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
  createRazorpayOrder,
  verifyRazorpayPayment,
  getCustomerOrders,
  getOrderById,
  getFarmerOrders,
  getFarmerPayments,
  createWithdrawalRequest,
  updateOrderStatus,
};
