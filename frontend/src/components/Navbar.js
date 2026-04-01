import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiX, FiShoppingCart, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const getDashboardLink = () => {
    switch (user?.role) {
      case 'FARMER':
        return '/farmer/dashboard';
      case 'CUSTOMER':
        return '/customer/dashboard';
      case 'ADMIN':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  return (
    <>
      <nav className="bg-primary text-white shadow-lg">
        <div className="container-main flex justify-between items-center">
          <Link to="/" className="font-bold text-2xl">
            🌾 Farmer Marketplace
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/products" className="hover:text-green-200">
              Products
            </Link>

            {isAuthenticated ? (
              <>
                {user?.role === 'CUSTOMER' && (
                  <Link to="/cart" className="flex items-center gap-2 hover:text-green-200">
                    <FiShoppingCart /> Cart
                  </Link>
                )}

                <Link to={getDashboardLink()} className="hover:text-green-200">
                  Dashboard
                </Link>

                <div className="flex items-center gap-3">
                  <span>{user?.fullName}</span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-red-500 px-3 py-2 rounded hover:bg-red-600"
                  >
                    <FiLogOut /> Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-outline">
                  Login
                </Link>
                <Link to="/register" className="btn-secondary">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="md:hidden bg-green-600 p-4 space-y-4">
            <Link to="/products" className="block hover:text-green-200">
              Products
            </Link>

            {isAuthenticated ? (
              <>
                {user?.role === 'CUSTOMER' && (
                  <Link to="/cart" className="block hover:text-green-200">
                    Cart
                  </Link>
                )}

                <Link to={getDashboardLink()} className="block hover:text-green-200">
                  Dashboard
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full text-left bg-red-500 px-3 py-2 rounded hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block hover:text-green-200">
                  Login
                </Link>
                <Link to="/register" className="block hover:text-green-200">
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
