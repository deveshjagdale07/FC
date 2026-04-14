import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartAPI } from '../services/api';
import { FiTrash2, FiShoppingCart } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await cartAPI.getCart();
      setCartItems(response.data.data.items || []);
    } catch (error) {
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      await cartAPI.updateItem(itemId, { quantity: newQuantity });
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
      toast.success('Quantity updated');
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await cartAPI.removeItem(itemId);
      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
      toast.success('Item removed');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear the cart?')) return;

    try {
      await cartAPI.clearCart();
      setCartItems([]);
      toast.success('Cart cleared');
    } catch (error) {
      toast.error('Failed to clear cart');
    }
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="container-main">
      <h1 className="text-4xl font-bold mb-8">{t('cartTitle')}</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <FiShoppingCart className="mx-auto text-6xl text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg mb-6">{t('cartEmpty')}</p>
          <Link to="/products" className="btn-primary">
            {t('cartContinueShopping')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="card flex gap-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                    {item.product.images && item.product.images.length > 0 ? (
                      <img
                        src={`http://localhost:5000${item.product.images[0]}`}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        {t('productNoImage')}
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2">{item.product.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">
                      From: {item.product.farmer.fullName}
                    </p>
                    <p className="font-semibold text-primary">
                      ₹{item.product.price.toFixed(2)} / {item.product.unit}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center border rounded">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-1 hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 font-bold">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-1 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-gray-500 text-sm">Subtotal</p>
                      <p className="font-bold">
                        ₹{(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                      <FiTrash2 /> {t('cartRemove')}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleClearCart}
              className="mt-6 text-red-500 hover:text-red-700 font-semibold"
            >
              {t('cartClear')}
            </button>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-20">
              <h2 className="font-bold text-lg mb-6">{t('cartOrderSummary')}</h2>

              <div className="space-y-3 mb-6 border-b pb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('cartSubtotal')}</span>
                  <span className="font-semibold">₹{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('cartShipping')}</span>
                  <span className="font-semibold">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('cartTax')}</span>
                  <span className="font-semibold">₹0</span>
                </div>
              </div>

              <div className="flex justify-between mb-6 text-xl font-bold">
                <span>{t('cartTotal')}</span>
                <span className="text-primary">₹{totalPrice.toFixed(2)}</span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full btn-primary py-3 font-bold mb-3"
              >
                {t('cartProceedCheckout')}
              </button>

              <Link to="/products" className="block w-full text-center btn-outline py-3">
                {t('cartContinueShopping')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
