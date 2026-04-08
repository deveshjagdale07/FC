import React, { useState, useEffect } from 'react';
import { authAPI, orderAPI, productAPI } from '../services/api';
import { FiPlus, FiEdit, FiTrash2, FiPackage, FiEdit2, FiCheck, FiX, FiUser, FiMail, FiPhone, FiMapPin as FiAddress } from 'react-icons/fi';
import toast from 'react-hot-toast';

const FarmerDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileEditMode, setProfileEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    category: 'fruits',
    description: '',
    price: '',
    quantity: '',
    unit: 'kg',
    harvestDate: '',
    isOrganic: false,
  });

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'products') {
      fetchProducts();
    } else if (activeTab === 'profile') {
      fetchProfile();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getFarmerOrders();
      setOrders(response.data.data.orders || []);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getAll();
      const productsData = response.data.data.products || [];
      
      // Parse images if they're strings
      const parsedProducts = productsData.map(product => ({
        ...product,
        images: typeof product.images === 'string' ? JSON.parse(product.images) : (product.images || [])
      }));
      
      setProducts(parsedProducts);
    } catch (error) {
      console.error('Failed to load products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getCurrentUser();
      setProfile(response.data.data.user);
      setEditData({
        fullName: response.data.data.user.fullName,
        email: response.data.data.user.email,
        phone: response.data.data.user.phone || '',
        address: response.data.data.user.address || '',
      });
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      await authAPI.updateProfile(editData);
      toast.success('Profile updated successfully!');
      setProfileEditMode(false);
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleProductFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file (JPEG, PNG, GIF)');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.quantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    // For create mode, image is required
    if (!isEditMode && !imageFile) {
      toast.error('Please select a product image');
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('category', formData.category);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('quantity', formData.quantity);
    data.append('unit', formData.unit);
    data.append('harvestDate', formData.harvestDate);
    data.append('isOrganic', formData.isOrganic);
    
    // Add image only if a new file is selected
    if (imageFile) {
      data.append('images', imageFile);
    }

    try {
      if (isEditMode) {
        await productAPI.update(editingProductId, data);
        toast.success('Product updated successfully!');
      } else {
        await productAPI.create(data);
        toast.success('Product created successfully!');
      }
      
      setShowProductForm(false);
      setIsEditMode(false);
      setEditingProductId(null);
      setImageFile(null);
      setImagePreview(null);
      setFormData({
        name: '',
        category: 'fruits',
        description: '',
        price: '',
        quantity: '',
        unit: 'kg',
        harvestDate: '',
        isOrganic: false,
      });
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || (isEditMode ? 'Failed to update product' : 'Failed to create product'));
    }
  };

  const handleEditProduct = (product) => {
    setFormData({
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price.toString(),
      quantity: product.quantity.toString(),
      unit: product.unit,
      harvestDate: product.harvestDate ? product.harvestDate.split('T')[0] : '',
      isOrganic: product.isOrganic,
    });

    // Set image preview if exists
    if (product.images && product.images.length > 0) {
      setImagePreview(`http://localhost:5000${product.images[0]}`);
    } else {
      setImagePreview(null);
    }

    setImageFile(null);
    setEditingProductId(product.id);
    setIsEditMode(true);
    setShowProductForm(true);
  };

  const cancelEdit = () => {
    setShowProductForm(false);
    setIsEditMode(false);
    setEditingProductId(null);
    setImageFile(null);
    setImagePreview(null);
    setFormData({
      name: '',
      category: 'fruits',
      description: '',
      price: '',
      quantity: '',
      unit: 'kg',
      harvestDate: '',
      isOrganic: false,
    });
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await productAPI.delete(productId);
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, { status: newStatus });
      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  return (
    <div className="container-main">
      <h1 className="text-4xl font-bold mb-8">Farmer Dashboard</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-3 font-semibold border-b-2 flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-600'
          }`}
        >
          <FiUser /> My Profile
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-3 font-semibold border-b-2 ${
            activeTab === 'orders'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-600'
          }`}
        >
          Orders
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-3 font-semibold border-b-2 ${
            activeTab === 'products'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-600'
          }`}
        >
          Products
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : activeTab === 'profile' ? (
        /* Profile Tab */
        <div>
          {profile ? (
            <div className="card max-w-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Profile Information</h2>
                {!profileEditMode && (
                  <button
                    onClick={() => setProfileEditMode(true)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <FiEdit2 /> Edit Profile
                  </button>
                )}
              </div>

              {profileEditMode ? (
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={editData.fullName}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={editData.email}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={editData.phone}
                      onChange={handleEditChange}
                      placeholder="+91 XXXXXXXXXX"
                      className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Address / Farm Location
                    </label>
                    <textarea
                      name="address"
                      value={editData.address}
                      onChange={handleEditChange}
                      placeholder="Enter your full address or farm location"
                      rows="3"
                      className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      className="btn-primary flex items-center gap-2"
                    >
                      <FiCheck /> Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileEditMode(false);
                        setEditData({
                          fullName: profile.fullName,
                          email: profile.email,
                          phone: profile.phone || '',
                          address: profile.address || '',
                        });
                      }}
                      className="btn-outline flex items-center gap-2"
                    >
                      <FiX /> Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="border-b pb-4 flex items-center gap-3">
                    <FiUser className="text-primary text-xl" />
                    <div>
                      <p className="text-sm text-gray-600">Full Name</p>
                      <p className="font-semibold">{profile.fullName}</p>
                    </div>
                  </div>

                  <div className="border-b pb-4 flex items-center gap-3">
                    <FiMail className="text-primary text-xl" />
                    <div>
                      <p className="text-sm text-gray-600">Email Address</p>
                      <p className="font-semibold">{profile.email}</p>
                    </div>
                  </div>

                  <div className="border-b pb-4 flex items-center gap-3">
                    <FiPhone className="text-primary text-xl" />
                    <div>
                      <p className="text-sm text-gray-600">Phone Number</p>
                      <p className="font-semibold">{profile.phone || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="border-b pb-4 flex items-center gap-3">
                    <FiAddress className="text-primary text-xl" />
                    <div>
                      <p className="text-sm text-gray-600">Farm Address / Location</p>
                      <p className="font-semibold">{profile.address || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded p-4 mt-4">
                    <p className="text-sm text-gray-600">Account Type</p>
                    <p className="font-semibold text-green-600">{profile.role}</p>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      ) : activeTab === 'orders' ? (
        /* Orders Tab */
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="text-center card py-12">
              <FiPackage className="mx-auto text-6xl text-gray-300 mb-4" />
              <p className="text-gray-500">No orders yet</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="card">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-gray-600 text-sm">Order Number</p>
                    <p className="font-bold">{order.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Customer</p>
                    <p className="font-bold">{order.customer.fullName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Status</p>
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                      className="font-bold px-3 py-1 border rounded"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="ACCEPTED">Accept</option>
                      <option value="REJECTED">Reject</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="DELIVERED">Delivered</option>
                    </select>
                  </div>
                </div>

                <div className="border-t pt-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center py-2 text-sm"
                    >
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-gray-600">
                          {item.quantity} {item.product.unit} @ ₹{item.priceAtOrder}
                        </p>
                      </div>
                      <p className="font-semibold">
                        ₹{(item.priceAtOrder * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t mt-4 pt-4">
                  <p className="text-sm font-semibold">
                    Delivery to: {order.customer.address}
                  </p>
                  <p className="text-sm text-gray-600">
                    Phone: {order.customer.phone}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Products Tab */
        <div>
          {!showProductForm && (
            <button
              onClick={() => {
                setIsEditMode(false);
                setEditingProductId(null);
                setImageFile(null);
                setImagePreview(null);
                setFormData({
                  name: '',
                  category: 'fruits',
                  description: '',
                  price: '',
                  quantity: '',
                  unit: 'kg',
                  harvestDate: '',
                  isOrganic: false,
                });
                setShowProductForm(true);
              }}
              className="mb-6 btn-primary flex items-center gap-2"
            >
              <FiPlus /> Add New Product
            </button>
          )}

          {/* Product Form */}
          {showProductForm && (
            <form onSubmit={handleCreateProduct} className="card mb-6 space-y-4">
              <h2 className="font-bold text-xl">
                {isEditMode ? 'Edit Product' : 'Add New Product'}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Product Name"
                  value={formData.name}
                  onChange={handleProductFormChange}
                  required
                  className="px-4 py-2 border rounded focus:outline-none focus:border-primary"
                />

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleProductFormChange}
                  className="px-4 py-2 border rounded focus:outline-none focus:border-primary"
                >
                  <option value="fruits">Fruits</option>
                  <option value="vegetables">Vegetables</option>
                  <option value="grains">Grains</option>
                  <option value="dairy">Dairy</option>
                </select>
              </div>

              <textarea
                name="description"
                placeholder="Product Description"
                value={formData.description}
                onChange={handleProductFormChange}
                required
                rows="3"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary"
              />

              {/* Image Upload Section */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                {imagePreview ? (
                  <div className="space-y-3">
                    <div className="flex justify-center">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-48 rounded-lg object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="w-full text-red-600 hover:text-red-800 font-semibold text-sm"
                    >
                      {isEditMode ? 'Use Different Image' : 'Remove Image'}
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <div className="text-center">
                      <div className="text-4xl text-gray-400 mb-2">📷</div>
                      <p className="font-semibold text-gray-700 mb-1">
                        Click to upload product image
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF (Max 5MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      required={!isEditMode}
                    />
                  </label>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="number"
                  name="price"
                  placeholder="Price (₹)"
                  value={formData.price}
                  onChange={handleProductFormChange}
                  required
                  step="0.01"
                  className="px-4 py-2 border rounded focus:outline-none focus:border-primary"
                />

                <input
                  type="number"
                  name="quantity"
                  placeholder="Quantity"
                  value={formData.quantity}
                  onChange={handleProductFormChange}
                  required
                  className="px-4 py-2 border rounded focus:outline-none focus:border-primary"
                />

                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleProductFormChange}
                  className="px-4 py-2 border rounded focus:outline-none focus:border-primary"
                >
                  <option value="kg">kg</option>
                  <option value="litre">litre</option>
                  <option value="piece">piece</option>
                  <option value="gram">gram</option>
                </select>

                <input
                  type="date"
                  name="harvestDate"
                  value={formData.harvestDate}
                  onChange={handleProductFormChange}
                  className="px-4 py-2 border rounded focus:outline-none focus:border-primary"
                />
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isOrganic"
                  checked={formData.isOrganic}
                  onChange={handleProductFormChange}
                />
                <span className="font-semibold">This product is organic</span>
              </label>

              <div className="flex gap-3">
                <button type="submit" className="btn-primary">
                  {isEditMode ? 'Update Product' : 'Create Product'}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="btn-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Products List */}
          {products.length === 0 ? (
            <div className="text-center card py-12">
              <p className="text-gray-500">No products yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="card">
                  {/* Product Image */}
                  <div className="w-full h-40 bg-gray-200 rounded mb-4 overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={`http://localhost:5000${product.images[0]}`}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>

                  <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                    {product.description}
                  </p>
                  <p className="font-bold text-primary mb-2">
                    ₹{product.price} / {product.unit}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    Stock: {product.quantity}
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEditProduct(product)}
                      className="flex-1 btn-outline text-sm flex items-center justify-center gap-1"
                    >
                      <FiEdit /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="flex-1 bg-red-100 text-red-800 px-3 py-2 rounded text-sm flex items-center justify-center gap-1 hover:bg-red-200"
                    >
                      <FiTrash2 /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FarmerDashboard;
