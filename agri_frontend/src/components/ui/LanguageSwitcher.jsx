import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    localStorage.setItem('app_language', lang);
  };

  return (
    <select 
      value={i18n.language || 'en'} 
      onChange={handleLanguageChange}
      style={{
        padding: '0.25rem 0.5rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)',
        background: 'var(--white)',
        color: 'var(--text-primary)',
        outline: 'none',
        cursor: 'pointer'
      }}
    >
      <option value="en">English</option>
      <option value="ta">தமிழ்</option>
      <option value="hi">हिंदी</option>
    </select>
  );
};

export default LanguageSwitcher;
