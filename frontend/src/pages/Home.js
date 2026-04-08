import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiTrendingUp, FiShield, FiTruck, FiAward } from 'react-icons/fi';

const Home = () => {
  const { user, isAuthenticated, loading } = useAuth();

  const features = [
    {
      icon: <FiTrendingUp size={32} />,
      title: 'Fresh Produce',
      description: 'Direct from farmers to your table',
    },
    {
      icon: <FiShield size={32} />,
      title: 'Quality Assured',
      description: 'All products are quality checked',
    },
    {
      icon: <FiTruck size={32} />,
      title: 'Fast Delivery',
      description: 'Quick and reliable shipping',
    },
    {
      icon: <FiAward size={32} />,
      title: 'Best Prices',
      description: 'Direct from source, no middlemen',
    },
  ];

  const renderCustomerHome = () => (
    <div className="container-main">
      <section className="py-20 text-center">
        <h1 className="text-5xl font-bold text-primary mb-4">
          Welcome back, {user.fullName}!
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Continue shopping fresh produce from trusted farmers.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/products" className="btn-primary text-lg px-8 py-3">
            Browse Products
          </Link>
          <Link to="/customer/dashboard" className="btn-outline text-lg px-8 py-3">
            My Dashboard
          </Link>
        </div>
      </section>

      <section className="py-16">
        <h2 className="text-4xl font-bold text-center mb-12">Your Shopper Benefits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="card text-center">
              <div className="text-primary mb-4 flex justify-center">
                {feature.icon}
              </div>
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
          Welcome back, Farmer {user.fullName}!
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Manage your products, orders and profile from one place.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/farmer/dashboard" className="btn-primary text-lg px-8 py-3">
            Open Farmer Dashboard
          </Link>
          <Link to="/products" className="btn-outline text-lg px-8 py-3">
            View Marketplace
          </Link>
        </div>
      </section>

      <section className="py-16">
        <h2 className="text-4xl font-bold text-center mb-12">Farmer Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="card text-center">
            <div className="text-primary mb-4 flex justify-center">
              <FiTrendingUp size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Sell Faster</h3>
            <p className="text-gray-600">Showcase your fresh produce directly to buyers.</p>
          </div>
          <div className="card text-center">
            <div className="text-primary mb-4 flex justify-center">
              <FiShield size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Secure Orders</h3>
            <p className="text-gray-600">Accept orders and manage fulfillment in one dashboard.</p>
          </div>
          <div className="card text-center">
            <div className="text-primary mb-4 flex justify-center">
              <FiTruck size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Easy Shipping</h3>
            <p className="text-gray-600">Track delivery and keep your customers updated.</p>
          </div>
          <div className="card text-center">
            <div className="text-primary mb-4 flex justify-center">
              <FiAward size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Trusted Seller</h3>
            <p className="text-gray-600">Build trust with customers by keeping your profile updated.</p>
          </div>
        </div>
      </section>
    </div>
  );

  const renderAdminHome = () => (
    <div className="container-main">
      <section className="py-20 text-center">
        <h1 className="text-5xl font-bold text-primary mb-4">Welcome back, Admin!</h1>
        <p className="text-xl text-gray-600 mb-8">Manage the marketplace, review reports and approve content.</p>
        <div className="flex justify-center gap-4">
          <Link to="/admin/dashboard" className="btn-primary text-lg px-8 py-3">
            Open Admin Dashboard
          </Link>
          <Link to="/products" className="btn-outline text-lg px-8 py-3">
            View Marketplace
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
        <h1 className="text-5xl font-bold text-primary mb-4">
          Welcome to Farmer Marketplace
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Direct connection between farmers and customers for fresh, quality produce
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/products" className="btn-primary text-lg px-8 py-3">
            Browse Products
          </Link>
          <Link to="/register" className="btn-outline text-lg px-8 py-3">
            Get Started
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <h2 className="text-4xl font-bold text-center mb-12">Why Choose Us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="card text-center">
              <div className="text-primary mb-4 flex justify-center">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-white rounded-lg p-12 text-center my-12">
        <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
        <p className="text-lg mb-6">
          Are you a farmer? Share your products and reach customers directly.
        </p>
        <Link to="/register" className="btn-secondary text-lg px-8 py-3">
          Register as Farmer
        </Link>
      </section>

      {/* Stats Section */}
      <section className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="text-4xl font-bold text-primary">500+</h3>
            <p className="text-gray-600 mt-2">Products Available</p>
          </div>
          <div>
            <h3 className="text-4xl font-bold text-primary">2000+</h3>
            <p className="text-gray-600 mt-2">Happy Customers</p>
          </div>
          <div>
            <h3 className="text-4xl font-bold text-primary">100+</h3>
            <p className="text-gray-600 mt-2">Trusted Farmers</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
