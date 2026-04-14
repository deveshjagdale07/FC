import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

const Checkout = () => {
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        return resolve(true);
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleOnlinePayment = async () => {
    const paymentOrderResponse = await orderAPI.createRazorpayOrder();
    const { orderId, amount, currency, keyId } = paymentOrderResponse.data.data;

    const options = {
      key: keyId,
      amount,
      currency,
      name: 'Farmer Marketplace',
      description: 'Online payment for your order',
      order_id: orderId,
      prefill: {
        name: user?.fullName || '',
        email: user?.email || '',
        contact: user?.phone || '',
      },
      theme: {
        color: '#2563eb',
      },
      handler: async (response) => {
        try {
          await orderAPI.verifyRazorpayPayment({
            deliveryAddress,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          });
          toast.success('Payment successful and order placed!');
          navigate('/customer/dashboard');
        } catch (error) {
          toast.error(error.response?.data?.message || 'Payment verification failed');
        }
      },
      modal: {
        ondismiss: () => {
          setLoading(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!deliveryAddress.trim()) {
      toast.error('Please enter delivery address');
      return;
    }

    setLoading(true);

    try {
      if (paymentMethod === 'ONLINE') {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          toast.error('Unable to load payment gateway, please try again later.');
          return;
        }

        await handleOnlinePayment();
      } else {
        await orderAPI.create({
          deliveryAddress,
          paymentMethod,
        });
        toast.success('Order placed successfully!');
        navigate(`/customer/dashboard`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-main">
      <h1 className="text-4xl font-bold mb-8">{t('checkoutTitle')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmitOrder} className="space-y-6">
            {/* Delivery Information */}
            <div className="card">
              <h2 className="font-bold text-2xl mb-6">{t('checkoutDeliveryInfo')}</h2>

              <div className="space-y-4">
                <div>
                  <label className="block font-semibold mb-2">{t('checkoutFullName')}</label>
                  <input
                    type="text"
                    value={user?.fullName}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">{t('checkoutEmail')}</label>
                  <input
                    type="email"
                    value={user?.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">{t('checkoutPhone')}</label>
                  <input
                    type="tel"
                    value={user?.phone || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">{t('checkoutAddress')}</label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                    rows="4"
                    placeholder={t('checkoutAddressPlaceholder')}
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card">
              <h2 className="font-bold text-2xl mb-6">{t('checkoutPaymentMethod')}</h2>

              <div className="space-y-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <span className="font-semibold">{t('checkoutCOD')}</span>
                </label>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="ONLINE"
                    checked={paymentMethod === 'ONLINE'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <span className="font-semibold">{t('checkoutOnline')}</span>
                </label>
              </div>

              {paymentMethod === 'ONLINE' && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">{t('checkoutPaymentInfo')}</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 font-bold text-lg"
            >
              {loading ? t('checkoutPlacingOrder') : t('checkoutPlaceOrder')}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-20">
            <h2 className="font-bold text-2xl mb-6">{t('checkoutSummaryTitle')}</h2>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">{t('checkoutSummaryInfo')}</p>
              </div>

              <div className="border-b pb-4">
                <p className="text-gray-600 mb-2">{t('checkoutSummaryDeliveryLabel')}</p>
                <p className="font-semibold text-sm">
                  {deliveryAddress || t('checkoutSummaryEnterAddress')}
                </p>
              </div>

              <div className="border-b pb-4">
                <p className="text-gray-600 mb-2">{t('checkoutSummaryPaymentLabel')}</p>
                <p className="font-semibold">
                  {paymentMethod === 'COD'
                    ? t('checkoutCODShort')
                    : t('checkoutOnlineShort')}
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-800">
                  {t('checkoutSummaryStatusInfo')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
