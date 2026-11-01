'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, Translations } from './types';
import { en } from './en';
import { es } from './es';
import { useUserProfile } from '../context/UserProfileContext';

interface LanguageContextType {
  language: Language;
  t: Translations;
  isAdmin: boolean;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'es',
  t: es,
  isAdmin: false,
  setLanguage: () => {},
  toggleLanguage: () => {},
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { activeProfile, updateSettings } = useUserProfile();
  const [language, setLanguageState] = useState<Language>('es');

  useEffect(() => {
    if (activeProfile?.language) {
      setLanguageState(activeProfile.language);
    } else if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('barista_lang') as Language;
      if (savedLang === 'en' || savedLang === 'es') setLanguageState(savedLang);
    }
  }, [activeProfile?.language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('barista_lang', lang);
    }
    if (activeProfile) {
      updateSettings({ language: lang });
    }
  };

  const toggleLanguage = () => {
    const next = language === 'es' ? 'en' : 'es';
    setLanguage(next);
  };

  const isAdmin = activeProfile ? activeProfile.role === 'admin' : false;
  const t = language === 'es' ? es : en;

  return (
    <LanguageContext.Provider
      value={{ language, t, isAdmin, setLanguage, toggleLanguage }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => useContext(LanguageContext);
