import React from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-12 mt-12">
      <div className="container-main grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* About */}
        <div>
          <h3 className="text-xl font-bold mb-4">🌾 Farmer Marketplace</h3>
          <p className="text-gray-400">
            Connecting farmers directly with customers for fresh, quality produce.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-bold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-gray-400">
            <li>
              <Link to="/" className="hover:text-primary">
                Home
              </Link>
            </li>
            <li>
              <Link to="/products" className="hover:text-primary">
                Products
              </Link>
            </li>
            <li>
              <a href="#about" className="hover:text-primary">
                About Us
              </a>
            </li>
            <li>
              <a href="#contact" className="hover:text-primary">
                Contact
              </a>
            </li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h4 className="font-bold mb-4">Categories</h4>
          <ul className="space-y-2 text-gray-400">
            <li>
              <Link to="/products?category=fruits" className="hover:text-primary">
                Fruits
              </Link>
            </li>
            <li>
              <Link to="/products?category=vegetables" className="hover:text-primary">
                Vegetables
              </Link>
            </li>
            <li>
              <Link to="/products?category=grains" className="hover:text-primary">
                Grains
              </Link>
            </li>
            <li>
              <Link to="/products?category=dairy" className="hover:text-primary">
                Dairy
              </Link>
            </li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h4 className="font-bold mb-4">Follow Us</h4>
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
              Privacy Policy
            </a>
            <a href="#terms" className="hover:text-primary">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
