const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;

    const where = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          address: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching users' 
    });
  }
};

// Deactivate user
const deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { isActive: false },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
      },
    });

    res.json({
      success: true,
      message: 'User deactivated successfully',
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deactivating user' 
    });
  }
};

// Activate user
const activateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { isActive: true },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
      },
    });

    res.json({
      success: true,
      message: 'User activated successfully',
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error activating user' 
    });
  }
};

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;

    const where = {};
    if (category) where.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          farmer: { select: { id: true, fullName: true, email: true } },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        products: products.map(p => ({
          ...p,
          images: p.images ? JSON.parse(p.images) : [],
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
    console.error('Get all products error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching products' 
    });
  }
};

// Get all orders
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const where = {};
    if (status) where.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: { select: { id: true, fullName: true, email: true } },
          items: {
            include: {
              product: { select: { name: true, price: true } },
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
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching orders' 
    });
  }
};

// Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalProducts, totalOrders, totalRevenue, ordersByStatus, usersByRole] = await Promise.all([
      prisma.user.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { totalPrice: true },
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: true,
      }),
      prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue._sum.totalPrice || 0,
        ordersByStatus: ordersByStatus.map(item => ({
          status: item.status,
          count: item._count,
        })),
        usersByRole: usersByRole.map(item => ({
          role: item.role,
          count: item._count,
        })),
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching stats' 
    });
  }
};

module.exports = {
  getAllUsers,
  deactivateUser,
  activateUser,
  getAllProducts,
  getAllOrders,
  getDashboardStats,
};
