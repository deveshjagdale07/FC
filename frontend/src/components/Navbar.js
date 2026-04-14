import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiX, FiShoppingCart, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { languages } from '../i18n';
import toast from 'react-hot-toast';

const Navbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  const handleLogout = () => {
    logout();
    toast.success(t('logoutSuccess'));
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
            {t('navBrand')}
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/products" className="hover:text-green-200">
              {t('navProducts')}
            </Link>

            {isAuthenticated ? (
              <>
                {user?.role === 'CUSTOMER' && (
                  <Link to="/cart" className="flex items-center gap-2 hover:text-green-200">
                    <FiShoppingCart /> {t('navCart')}
                  </Link>
                )}

                <Link to={getDashboardLink()} className="hover:text-green-200">
                  {t('navDashboard')}
                </Link>

                <div className="flex items-center gap-3">
                  <span>{user?.fullName}</span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-red-500 px-3 py-2 rounded hover:bg-red-600"
                  >
                    <FiLogOut /> {t('navLogout')}
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-outline">
                  {t('navLogin')}
                </Link>
                <Link to="/register" className="btn-secondary">
                  {t('navRegister')}
                </Link>
              </>
            )}

            <div className="flex items-center gap-2">
              <label htmlFor="language-select" className="text-sm">
                {t('languageLabel')}:
              </label>
              <select
                id="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="rounded border border-white bg-white text-black px-2 py-1 text-sm"
              >
                {Object.entries(languages).map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
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
              {t('navProducts')}
            </Link>

            {isAuthenticated ? (
              <>
                {user?.role === 'CUSTOMER' && (
                  <Link to="/cart" className="block hover:text-green-200">
                    {t('navCart')}
                  </Link>
                )}

                <Link to={getDashboardLink()} className="block hover:text-green-200">
                  {t('navDashboard')}
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full text-left bg-red-500 px-3 py-2 rounded hover:bg-red-600"
                >
                  {t('navLogout')}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block hover:text-green-200">
                  {t('navLogin')}
                </Link>
                <Link to="/register" className="block hover:text-green-200">
                  {t('navRegister')}
                </Link>
              </>
            )}

            <div className="pt-4 border-t border-white/20">
              <label htmlFor="language-select-mobile" className="block text-sm mb-2">
                {t('languageLabel')}:
              </label>
              <select
                id="language-select-mobile"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded border border-white bg-white text-black px-2 py-2 text-sm"
              >
                {Object.entries(languages).map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
