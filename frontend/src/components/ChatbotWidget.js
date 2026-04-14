import React, { useState } from 'react';
import { FiSend, FiMessageCircle } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';

const ChatbotWidget = ({ role }) => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState([
    { from: 'bot', text: t('chatbotWelcome') },
  ]);
  const [input, setInput] = useState('');

  const getResponse = (message) => {
    const normalized = message.toLowerCase();

    if (/(how|what).*work|how.*use|use.*website|website.*work/.test(normalized)) {
      return t('chatbotAnswerHowItWorks');
    }

    if (/(order|track|status|delivery|shipping)/.test(normalized)) {
      return t('chatbotAnswerOrder');
    }

    if (/(pay|payment|cod|razorpay|online)/.test(normalized)) {
      return t('chatbotAnswerPayment');
    }

    if (/(profile|account|email|phone|address)/.test(normalized)) {
      return t('chatbotAnswerProfile');
    }

    if (/(product|list|sell|add product|inventory)/.test(normalized) && role === 'FARMER') {
      return t('chatbotAnswerProductsFarmer');
    }

    if (/(product|search|buy|catalog|available)/.test(normalized) && role === 'CUSTOMER') {
      return t('chatbotAnswerProductsCustomer');
    }

    if (/(support|help|team|question)/.test(normalized)) {
      return t('chatbotAnswerSupport');
    }

    return t('chatbotDefaultAnswer');
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage = { from: 'user', text: trimmed };
    const botMessage = { from: 'bot', text: getResponse(trimmed) };

    setMessages((prev) => [...prev, userMessage, botMessage]);
    setInput('');
  };

  const handleSuggestion = (text) => {
    setInput(text);
    setMessages((prev) => [...prev, { from: 'user', text }, { from: 'bot', text: getResponse(text) }]);
  };

  return (
    <div className="card bg-white p-6 shadow-sm border border-gray-200">
      <div className="flex items-center gap-3 mb-5">
        <FiMessageCircle className="text-primary text-2xl" />
        <div>
          <h2 className="text-2xl font-bold">{t('chatbotTitle')}</h2>
          <p className="text-gray-600">{t('chatbotDescription')}</p>
        </div>
      </div>

      <div className="space-y-3 mb-5">
        {messages.map((message, index) => (
          <div
            key={`${message.from}-${index}`}
            className={`p-4 rounded-xl ${message.from === 'bot' ? 'bg-gray-100 text-gray-800' : 'bg-primary text-white self-end'}`}
          >
            {message.text}
          </div>
        ))}
      </div>

      <div className="mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-2">{t('chatbotSuggestedLabel')}</p>
        <div className="flex flex-wrap gap-2">
          {[
            t('chatbotQuestionHowItWorks'),
            t('chatbotQuestionOrderStatus'),
            role === 'FARMER' ? t('chatbotQuestionProductsFarmer') : t('chatbotQuestionProductsCustomer'),
            t('chatbotQuestionProfile'),
          ].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => handleSuggestion(suggestion)}
              className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('chatbotPlaceholder')}
          className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-primary"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
        />
        <button
          onClick={handleSend}
          className="inline-flex items-center gap-2 rounded bg-primary px-4 py-3 text-white hover:bg-primary-dark"
        >
          <FiSend /> {t('chatbotSendButton')}
        </button>
      </div>
    </div>
  );
};

export default ChatbotWidget;
