const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Create product (Farmer only)
const createProduct = async (req, res) => {
  try {
    const { name, category, description, price, quantity, unit, harvestDate, isOrganic } = req.body;
    const farmerId = req.user.userId;

    // Handle image
    let images = [];
    if (req.file) {
      images.push(`/uploads/${req.file.filename}`);
    }

    const product = await prisma.product.create({
      data: {
        farmerId,
        name,
        category,
        description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        unit,
        harvestDate: harvestDate ? new Date(harvestDate) : null,
        isOrganic: isOrganic === 'true' || isOrganic === true,
        images: images.length > 0 ? JSON.stringify(images) : null,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product },
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating product' 
    });
  }
};

// Get all products (with filters)
const getAllProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search, page = 1, limit = 12 } = req.query;

    const where = { isActive: true };

    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          farmer: {
            select: { id: true, fullName: true, email: true, phone: true, address: true },
          },
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
    console.error('Get products error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching products' 
    });
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        farmer: {
          select: { 
            id: true, 
            fullName: true, 
            email: true, 
            phone: true, 
            address: true,
            profileImage: true,
          },
        },
        reviews: {
          include: {
            customer: { select: { id: true, fullName: true, profileImage: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    res.json({
      success: true,
      data: {
        product: {
          ...product,
          images: product.images ? JSON.parse(product.images) : [],
        },
      },
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching product' 
    });
  }
};

// Update product (Farmer only)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, description, price, quantity, unit, harvestDate, isOrganic } = req.body;
    const farmerId = req.user.userId;

    // Check if product belongs to farmer
    const product = await prisma.product.findUnique({ where: { id: parseInt(id) } });
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    if (product.farmerId !== farmerId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }

    // Handle new image
    let images = product.images;
    if (req.file) {
      images = JSON.stringify([`/uploads/${req.file.filename}`]);
    }

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name: name || undefined,
        category: category || undefined,
        description: description || undefined,
        price: price ? parseFloat(price) : undefined,
        quantity: quantity ? parseInt(quantity) : undefined,
        unit: unit || undefined,
        harvestDate: harvestDate ? new Date(harvestDate) : undefined,
        isOrganic: isOrganic !== undefined ? (isOrganic === 'true' || isOrganic === true) : undefined,
        images: images,
      },
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: {
        product: {
          ...updatedProduct,
          images: updatedProduct.images ? JSON.parse(updatedProduct.images) : [],
        },
      },
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating product' 
    });
  }
};

// Delete product (Farmer only)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const farmerId = req.user.userId;

    const product = await prisma.product.findUnique({ where: { id: parseInt(id) } });
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    if (product.farmerId !== farmerId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }

    // Delete associated images
    if (product.images) {
      const images = JSON.parse(product.images);
      images.forEach(imagePath => {
        const fullPath = path.join(__dirname, '../../' + imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
    }

    await prisma.product.delete({ where: { id: parseInt(id) } });

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting product' 
    });
  }
};

// Get farmer products
const getFarmerProducts = async (req, res) => {
  try {
    const { farmerId } = req.params;

    const products = await prisma.product.findMany({
      where: { farmerId: parseInt(farmerId) },
      include: {
        farmer: { select: { id: true, fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: {
        products: products.map(p => ({
          ...p,
          images: p.images ? JSON.parse(p.images) : [],
        })),
      },
    });
  } catch (error) {
    console.error('Get farmer products error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching farmer products' 
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getFarmerProducts,
};
