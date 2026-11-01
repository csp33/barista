'use client';

import React, { createContext, useContext, useState } from 'react';
import { Language, Translations } from './types';
import { en } from './en';
import { es } from './es';

interface LanguageContextType {
  language: Language;
  t: Translations;
  isAdmin: boolean;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  toggleAdmin: () => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'es',
  t: es,
  isAdmin: false,
  setLanguage: () => {},
  toggleLanguage: () => {},
  toggleAdmin: () => {},
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('barista_lang') as Language;
      if (saved === 'en' || saved === 'es') return saved;
    }
    return 'es';
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('barista_admin') === 'true';
    }
    return false;
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('barista_lang', lang);
    }
  };

  const toggleLanguage = () => {
    const next = language === 'es' ? 'en' : 'es';
    setLanguage(next);
  };

  const toggleAdmin = () => {
    setIsAdmin(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('barista_admin', String(next));
      }
      return next;
    });
  };

  const t = language === 'es' ? es : en;

  return (
    <LanguageContext.Provider value={{ language, t, isAdmin, setLanguage, toggleLanguage, toggleAdmin }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => useContext(LanguageContext);
