import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const About = () => {
  const { t } = useLanguage();

  return (
    <section className="container-main py-16">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t('aboutTitle')}</h1>
        <p className="text-lg text-gray-600">{t('aboutSubtitle')}</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-2xl font-semibold mb-3">{t('aboutMissionTitle')}</h2>
          <p className="text-gray-700">{t('aboutMissionText')}</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-2xl font-semibold mb-3">{t('aboutVisionTitle')}</h2>
          <p className="text-gray-700">{t('aboutVisionText')}</p>
        </div>
      </div>
    </section>
  );
};

export default About;
