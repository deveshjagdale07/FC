import React, { useState, useEffect } from 'react';
import { orderAPI } from '../services/api';
import { FiPackage, FiMapPin, FiDollarSign, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CustomerDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

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
      <h1 className="text-4xl font-bold mb-8">My Orders</h1>

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
  );
};

export default CustomerDashboard;
