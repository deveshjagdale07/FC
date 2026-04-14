import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests and handle Content-Type for FormData
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Set Content-Type only if not FormData (let axios handle FormData)
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }
  
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Product API calls
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getByFarmerId: (farmerId) => api.get(`/products/farmer/${farmerId}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// Cart API calls
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (data) => api.post('/cart', data),
  updateItem: (itemId, data) => api.put(`/cart/${itemId}`, data),
  removeItem: (itemId) => api.delete(`/cart/${itemId}`),
  clearCart: () => api.delete('/cart'),
};

// Order API calls
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  createRazorpayOrder: () => api.post('/orders/razorpay/order'),
  verifyRazorpayPayment: (data) => api.post('/orders/razorpay/verify', data),
  getCustomerOrders: (params) => api.get('/orders/customer/orders', { params }),
  getFarmerOrders: (params) => api.get('/orders/farmer/orders', { params }),
  getFarmerPayments: () => api.get('/orders/farmer/payments'),
  downloadInvoice: (orderId) => api.get(`/orders/${orderId}/invoice`, { responseType: 'blob' }),
  requestWithdrawal: (data) => api.post('/orders/farmer/payments/withdraw', data),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, data) => api.put(`/orders/${id}`, data),
};

// Review API calls
export const reviewAPI = {
  add: (data) => api.post('/reviews', data),
  getProductReviews: (productId, params) => api.get(`/reviews/product/${productId}`, { params }),
  getCustomerReview: (productId) => api.get(`/reviews/product/${productId}/customer`),
  delete: (id) => api.delete(`/reviews/${id}`),
};

// Admin API calls
export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  deactivateUser: (userId) => api.put(`/admin/users/${userId}/deactivate`),
  activateUser: (userId) => api.put(`/admin/users/${userId}/activate`),
  getProducts: (params) => api.get('/admin/products', { params }),
  getOrders: (params) => api.get('/admin/orders', { params }),
  getWithdrawals: () => api.get('/admin/withdrawals'),
  updateWithdrawalStatus: (withdrawalId, data) => api.put(`/admin/withdrawals/${withdrawalId}/status`, data),
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
};

export default api;
