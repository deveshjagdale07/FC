import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const Contact = () => {
  const { t } = useLanguage();

  return (
    <section className="container-main py-16">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t('contactTitle')}</h1>
        <p className="text-lg text-gray-600">{t('contactSubtitle')}</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-3">{t('contactPhoneLabel')}</h2>
          <p className="text-gray-700">+91 98765 43210</p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-3">{t('contactEmailLabel')}</h2>
          <p className="text-gray-700">support@farmer-marketplace.com</p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-3">{t('contactAddressLabel')}</h2>
          <p className="text-gray-700">{t('contactAddressExample')}</p>
        </div>
      </div>

      <div className="mt-12 bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-2xl font-semibold mb-3">{t('contactSupportTitle')}</h2>
        <p className="text-gray-700">{t('contactSupportText')}</p>
      </div>
    </section>
  );
};

export default Contact;
