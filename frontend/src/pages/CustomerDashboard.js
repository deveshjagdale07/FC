import React, { useState, useEffect } from 'react';
import { authAPI, orderAPI } from '../services/api';
import { FiPackage, FiMapPin, FiDollarSign, FiClock, FiEdit2, FiCheck, FiX, FiUser, FiMail, FiPhone, FiMapPin as FiAddress } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CustomerDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    } else {
      fetchProfile();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getCustomerOrders({
        status: selectedStatus || undefined,
      });
      setOrders(response.data.data.orders || []);
    } catch (error) {
      toast.error('Failed to load orders');
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
      setEditMode(false);
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const statusOptions = ['PENDING', 'ACCEPTED', 'SHIPPED', 'DELIVERED', 'REJECTED'];

  return (
    <div className="container-main">
      <h1 className="text-4xl font-bold mb-8">My Dashboard</h1>

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
          className={`px-4 py-3 font-semibold border-b-2 flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-600'
          }`}
        >
          <FiPackage /> My Orders
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : profile ? (
            <div className="card max-w-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Profile Information</h2>
                {!editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <FiEdit2 /> Edit Profile
                  </button>
                )}
              </div>

              {editMode ? (
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
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={editData.address}
                      onChange={handleEditChange}
                      placeholder="Enter your full address"
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
                        setEditMode(false);
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

                  <div className="pb-4 flex items-center gap-3">
                    <FiAddress className="text-primary text-xl" />
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-semibold">{profile.address || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded p-4 mt-4">
                    <p className="text-sm text-gray-600">Account Type</p>
                    <p className="font-semibold text-blue-600">{profile.role}</p>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div>
          {/* Status Filter */}
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedStatus('')}
              className={`px-4 py-2 rounded font-semibold ${
                selectedStatus === '' ? 'bg-primary text-white' : 'bg-gray-200'
              }`}
            >
              All Orders
            </button>
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded font-semibold ${
                  selectedStatus === status ? 'bg-primary text-white' : 'bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 card">
              <FiPackage className="mx-auto text-6xl text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No orders found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="card">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-gray-600 text-sm">Order Number</p>
                      <p className="font-bold">{order.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Total Amount</p>
                      <p className="font-bold text-primary">₹{order.totalPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Order Date</p>
                      <p className="font-semibold">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="font-semibold mb-3 flex items-center gap-2">
                      <FiPackage /> Items ({order.items.length})
                    </p>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded"
                        >
                          <div>
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-gray-600">
                              {item.quantity} {item.product.unit}
                            </p>
                          </div>
                          <p className="font-semibold">
                            ₹{(item.priceAtOrder * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t mt-4 pt-4">
                    <p className="font-semibold mb-2 flex items-center gap-2">
                      <FiMapPin /> Delivery Address
                    </p>
                    <p className="text-gray-600">{order.deliveryAddress}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-gray-600 text-sm">Payment Method</p>
                      <p className="font-semibold">
                        {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Payment Status</p>
                      <p className="font-semibold text-green-600">{order.paymentStatus}</p>
                    </div>
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

export default CustomerDashboard;
