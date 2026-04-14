import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI, cartAPI, reviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { FiStar, FiShoppingCart } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    fetchProductDetails();
    if (isAuthenticated && user?.role === 'CUSTOMER') {
      fetchUserReview();
    }
  }, [id, isAuthenticated]);

  const fetchProductDetails = async () => {
    try {
      const response = await productAPI.getById(id);
      setProduct(response.data.data.product);
    } catch (error) {
      toast.error(t('productDetailLoadError'));
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReview = async () => {
    try {
      const response = await reviewAPI.getCustomerReview(parseInt(id));
      setUserReview(response.data.data.review);
      setRating(response.data.data.review.rating);
      setComment(response.data.data.review.comment || '');
    } catch (error) {
      // User hasn't reviewed yet
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error(t('productDetailPleaseLogin'));
      navigate('/login');
      return;
    }

    if (user?.role !== 'CUSTOMER') {
      toast.error(t('productDetailOnlyCustomer'));
      return;
    }

    try {
      await cartAPI.addToCart({
        productId: parseInt(id),
        quantity: parseInt(quantity),
      });
      toast.success(t('productDetailAddedToCart'));
    } catch (error) {
      toast.error(error.response?.data?.message || t('productDetailAddCartError'));
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error(t('productDetailPleaseLogin'));
      navigate('/login');
      return;
    }

    if (rating === 0) {
      toast.error(t('productDetailSelectRating'));
      return;
    }

    setSubmittingReview(true);

    try {
      await reviewAPI.add({
        productId: parseInt(id),
        rating: parseInt(rating),
        comment: comment || undefined,
      });

      toast.success(userReview ? t('productDetailReviewUpdated') : t('productDetailReviewAdded'));
      fetchProductDetails();
      fetchUserReview();
      setRating(0);
      setComment('');
    } catch (error) {
      toast.error(error.response?.data?.message || t('productDetailReviewError'));
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!product) {
    return <div className="text-center py-12">{t('productDetailNotFound')}</div>;
  }

  return (
    <div className="container-main">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
        <div>
          <div className="w-full bg-gray-200 rounded-lg overflow-hidden mb-4">
            {product.images && product.images.length > 0 ? (
              <img
                src={`http://localhost:5000${product.images[0]}`}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-96 text-gray-400">
                {t('productDetailNoImage')}
              </div>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, idx) => (
                <img
                  key={idx}
                  src={`http://localhost:5000${img}`}
                  alt={`Product ${idx}`}
                  className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80"
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center">
              <FiStar className="text-yellow-400 mr-2" />
              <span className="font-semibold">
                {product.rating ? product.rating.toFixed(1) : t('productDetailNoRating')} ({product.totalReviews || 0} {t('productDetailReviews')})
              </span>
            </div>
            {product.isOrganic && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                🌱 Organic
              </span>
            )}
          </div>

          <div className="text-3xl font-bold text-primary mb-2">
            ₹{product.price.toFixed(2)} / {product.unit}
          </div>

          <p className="text-gray-600 text-lg mb-6">{product.description}</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-100 p-3 rounded">
              <p className="text-gray-600 text-sm">{t('productDetailCategory')}</p>
              <p className="font-bold capitalize">{product.category}</p>
            </div>
            <div className="bg-gray-100 p-3 rounded">
              <p className="text-gray-600 text-sm">{t('productDetailAvailableStock')}</p>
              <p className="font-bold">{product.quantity}</p>
            </div>
            <div className="bg-gray-100 p-3 rounded">
              <p className="text-gray-600 text-sm">{t('productDetailHarvestDate')}</p>
              <p className="font-bold">
                {product.harvestDate
                  ? new Date(product.harvestDate).toLocaleDateString()
                  : t('productDetailNotAvailable')}
              </p>
            </div>
            <div className="bg-gray-100 p-3 rounded">
              <p className="text-gray-600 text-sm">{t('productDetailFarmer')}</p>
              <p className="font-bold">{product.farmer.fullName}</p>
            </div>
          </div>

          {/* Add to Cart */}
          {user?.role === 'CUSTOMER' && (
            <div className="flex gap-4 mb-6">
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-gray-100"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center py-2 border-l border-r focus:outline-none"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
              <button onClick={handleAddToCart} className="flex-1 btn-primary flex items-center justify-center gap-2">
                <FiShoppingCart /> {t('productDetailAddToCart')}
              </button>
            </div>
          )}

          {/* Farmer Info */}
          <div className="card">
            <h3 className="font-bold text-lg mb-3">{t('productDetailFromFarmer')}</h3>
            <p className="text-lg font-semibold mb-1">{product.farmer.fullName}</p>
            <p className="text-gray-600 mb-1">{t('productDetailFarmerEmail')}: {product.farmer.email}</p>
            {product.farmer.phone && <p className="text-gray-600">{t('productDetailFarmerPhone')}: {product.farmer.phone}</p>}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold mb-6">{t('productDetailReviewsTitle')}</h2>
          {product.reviews && product.reviews.length > 0 ? (
            <div className="space-y-4">
              {product.reviews.map((review) => (
                <div key={review.id} className="card">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold">{review.customer.fullName}</p>
                      <p className="text-yellow-400 text-sm">{'⭐'.repeat(review.rating)}</p>
                    </div>
                    <span className="text-gray-500 text-sm">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && <p className="text-gray-600">{review.comment}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">{t('productDetailNoReviews')}</p>
          )}
        </div>

        {/* Add Review Form */}
        {user?.role === 'CUSTOMER' && (
          <div>
            <div className="card">
              <h3 className="font-bold text-lg mb-4">
                {userReview ? t('productDetailUpdateReview') : t('productDetailWriteReview')}
              </h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block font-semibold mb-2">{t('productDetailReviewRating')}</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`text-3xl transition ${
                          star <= rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-2">{t('productDetailReviewComment')}</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary"
                    rows="4"
                    placeholder={t('productDetailReviewPlaceholder')}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full btn-primary"
                >
                  {submittingReview
                    ? t('productDetailSubmitting')
                    : userReview
                    ? t('productDetailUpdateReviewButton')
                    : t('productDetailSubmitReviewButton')}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
