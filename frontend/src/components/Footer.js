import React from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-dark text-white py-12 mt-12">
      <div className="container-main grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* About */}
        <div>
          <h3 className="text-xl font-bold mb-4">{t('footerAboutTitle')}</h3>
          <p className="text-gray-400">{t('footerAboutText')}</p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-bold mb-4">{t('footerQuickLinks')}</h4>
          <ul className="space-y-2 text-gray-400">
            <li>
              <Link to="/" className="hover:text-primary">
                {t('footerHome')}
              </Link>
            </li>
            <li>
              <Link to="/products" className="hover:text-primary">
                {t('footerProducts')}
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-primary">
                {t('footerAboutUs')}
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-primary">
                {t('footerContact')}
              </Link>
            </li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h4 className="font-bold mb-4">{t('footerCategories')}</h4>
          <ul className="space-y-2 text-gray-400">
            <li>
              <Link to="/products?category=fruits" className="hover:text-primary">
                {t('category_fruits')}
              </Link>
            </li>
            <li>
              <Link to="/products?category=vegetables" className="hover:text-primary">
                {t('category_vegetables')}
              </Link>
            </li>
            <li>
              <Link to="/products?category=grains" className="hover:text-primary">
                {t('category_grains')}
              </Link>
            </li>
            <li>
              <Link to="/products?category=dairy" className="hover:text-primary">
                {t('category_dairy')}
              </Link>
            </li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h4 className="font-bold mb-4">{t('footerFollowUs')}</h4>
          <div className="flex gap-4">
            <a href="#facebook" className="text-gray-400 hover:text-primary text-2xl">
              <FiFacebook />
            </a>
            <a href="#twitter" className="text-gray-400 hover:text-primary text-2xl">
              <FiTwitter />
            </a>
            <a href="#instagram" className="text-gray-400 hover:text-primary text-2xl">
              <FiInstagram />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 mt-8 pt-8">
        <div className="container-main flex flex-col md:flex-row justify-between items-center text-gray-400">
          <p>&copy; 2024 Farmer Marketplace. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#privacy" className="hover:text-primary">
              {t('footerPrivacy')}
            </a>
            <a href="#terms" className="hover:text-primary">
              {t('footerTerms')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
