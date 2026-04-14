import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    role: 'CUSTOMER',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();
  const { t } = useLanguage();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password.length < 6) {
      toast.error(t('registerPasswordError'));
      return;
    }

    setLoading(true);

    try {
      const data = await register(formData);
      toast.success(t('registerButton') + ' successful!');
      const role = data?.data?.user?.role;
      if (role === 'FARMER') {
        navigate('/farmer/dashboard');
      } else if (role === 'CUSTOMER') {
        navigate('/customer/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      toast.error(error.message || `${t('registerButton')} failed`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-main flex justify-center items-center min-h-screen">
      <div className="card w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-primary">{t('registerTitle')}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">{t('registerName')}</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">{t('registerEmail')}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">{t('registerPhone')}</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">{t('registerPassword')}</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">{t('registerRole')}</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
            >
              <option value="CUSTOMER">{t('registerAsCustomer')}</option>
              <option value="FARMER">{t('registerAsFarmer')}</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary font-semibold py-3 mt-6"
          >
            {loading ? t('registerSubmitting') : t('registerButton')}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          {t('registerLoginPrompt')}{' '}
          <Link to="/login" className="text-primary font-bold hover:underline">
            {t('registerLoginLink')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
