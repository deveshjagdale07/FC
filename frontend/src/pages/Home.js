import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { FiTrendingUp, FiShield, FiTruck, FiAward } from 'react-icons/fi';

const Home = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const { t } = useLanguage();

  const features = [
    {
      icon: <FiTrendingUp size={32} />,
      title: t('homeFeatureFresh'),
      description: t('homeFeatureFreshDesc'),
    },
    {
      icon: <FiShield size={32} />,
      title: t('homeFeatureQuality'),
      description: t('homeFeatureQualityDesc'),
    },
    {
      icon: <FiTruck size={32} />,
      title: t('homeFeatureDelivery'),
      description: t('homeFeatureDeliveryDesc'),
    },
    {
      icon: <FiAward size={32} />,
      title: t('homeFeaturePrices'),
      description: t('homeFeaturePricesDesc'),
    },
  ];

  const renderCustomerHome = () => (
    <div className="container-main">
      <section className="py-20 text-center">
        <h1 className="text-5xl font-bold text-primary mb-4">
          {t('heroWelcomeUser', { name: user.fullName })}
        </h1>
        <p className="text-xl text-gray-600 mb-8">{t('heroContinueShopping')}</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/products" className="btn-primary text-lg px-8 py-3">
            {t('homeBrowseProducts')}
          </Link>
          <Link to="/customer/dashboard" className="btn-outline text-lg px-8 py-3">
            {t('navDashboard')}
          </Link>
        </div>
      </section>

      <section className="py-16">
        <h2 className="text-4xl font-bold text-center mb-12">{t('homeYourBenefits')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="card text-center">
              <div className="text-primary mb-4 flex justify-center">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const renderFarmerHome = () => (
    <div className="container-main">
      <section className="py-20 text-center">
        <h1 className="text-5xl font-bold text-primary mb-4">
          {t('heroWelcomeUser', { name: user.fullName })}
        </h1>
        <p className="text-xl text-gray-600 mb-8">{t('homeSellFasterDesc')}</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/farmer/dashboard" className="btn-primary text-lg px-8 py-3">
            {t('heroOpenFarmerDashboard')}
          </Link>
          <Link to="/products" className="btn-outline text-lg px-8 py-3">
            {t('heroViewMarketplace')}
          </Link>
        </div>
      </section>

      <section className="py-16">
        <h2 className="text-4xl font-bold text-center mb-12">{t('homeWhyChooseUs')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="card text-center">
            <div className="text-primary mb-4 flex justify-center">
              <FiTrendingUp size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">{t('homeSellFaster')}</h3>
            <p className="text-gray-600">{t('homeSellFasterDesc')}</p>
          </div>
          <div className="card text-center">
            <div className="text-primary mb-4 flex justify-center">
              <FiShield size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">{t('homeSecureOrders')}</h3>
            <p className="text-gray-600">{t('homeSecureOrdersDesc')}</p>
          </div>
          <div className="card text-center">
            <div className="text-primary mb-4 flex justify-center">
              <FiTruck size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">{t('homeEasyShipping')}</h3>
            <p className="text-gray-600">{t('homeEasyShippingDesc')}</p>
          </div>
          <div className="card text-center">
            <div className="text-primary mb-4 flex justify-center">
              <FiAward size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">{t('homeTrustedSeller')}</h3>
            <p className="text-gray-600">{t('homeTrustedSellerDesc')}</p>
          </div>
        </div>
      </section>
    </div>
  );

  const renderAdminHome = () => (
    <div className="container-main">
      <section className="py-20 text-center">
        <h1 className="text-5xl font-bold text-primary mb-4">{t('homeWelcome')}</h1>
        <p className="text-xl text-gray-600 mb-8">{t('homeSubtitle')}</p>
        <div className="flex justify-center gap-4">
          <Link to="/admin/dashboard" className="btn-primary text-lg px-8 py-3">
            {t('navDashboard')}
          </Link>
          <Link to="/products" className="btn-outline text-lg px-8 py-3">
            {t('homeBrowseProducts')}
          </Link>
        </div>
      </section>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    if (user?.role === 'FARMER') {
      return renderFarmerHome();
    }

    if (user?.role === 'CUSTOMER') {
      return renderCustomerHome();
    }

    if (user?.role === 'ADMIN') {
      return renderAdminHome();
    }
  }

  return (
    <div className="container-main">
      {/* Hero Section */}
      <section className="py-20 text-center">
        <h1 className="text-5xl font-bold text-primary mb-4">{t('homeWelcome')}</h1>
        <p className="text-xl text-gray-600 mb-8">{t('homeSubtitle')}</p>
        <div className="flex justify-center gap-4">
          <Link to="/products" className="btn-primary text-lg px-8 py-3">
            {t('homeBrowseProducts')}
          </Link>
          <Link to="/register" className="btn-outline text-lg px-8 py-3">
            {t('homeGetStarted')}
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <h2 className="text-4xl font-bold text-center mb-12">{t('homeWhyChooseUs')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="card text-center">
              <div className="text-primary mb-4 flex justify-center">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-white rounded-lg p-12 text-center my-12">
        <h2 className="text-3xl font-bold mb-4">{t('homeJoinCommunity')}</h2>
        <p className="text-lg mb-6">{t('homeJoinCommunityDesc')}</p>
        <Link to="/register" className="btn-secondary text-lg px-8 py-3">
          {t('homeRegisterAsFarmer')}
        </Link>
      </section>

      {/* Stats Section */}
      <section className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="text-4xl font-bold text-primary">500+</h3>
            <p className="text-gray-600 mt-2">{t('homeStatsProducts')}</p>
          </div>
          <div>
            <h3 className="text-4xl font-bold text-primary">2000+</h3>
            <p className="text-gray-600 mt-2">{t('homeStatsCustomers')}</p>
          </div>
          <div>
            <h3 className="text-4xl font-bold text-primary">24/7</h3>
            <p className="text-gray-600 mt-2">{t('homeFeatureDeliveryDesc')}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
