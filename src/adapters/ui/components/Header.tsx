'use client';

import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { Coffee, Globe, Sliders } from 'lucide-react';

export const Header: React.FC = () => {
  const { t, language, toggleLanguage } = useTranslation();

  return (
    <header className="sticky top-0 z-30 bg-[#12100E]/90 backdrop-blur-md border-b border-[#2C2621] px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#D96B27] flex items-center justify-center text-[#12100E] shadow-sm">
            <Coffee className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold tracking-wider text-base text-[#F5EFEB]">
                {t.appName}
              </h1>
              <span className="text-[10px] font-metric bg-[#2C2621] text-[#D96B27] px-1.5 py-0.5 rounded tracking-normal">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-[#9E9288] flex items-center gap-1">
              <Sliders className="w-3 h-3 text-[#E29D52]" />
              {t.gearSetup}
            </p>
          </div>
        </div>

        <button
          onClick={toggleLanguage}
          aria-label="Toggle language"
          className="flex items-center gap-1.5 bg-[#1B1815] hover:bg-[#25201C] border border-[#2C2621] text-xs font-metric font-medium text-[#F5EFEB] px-2.5 py-1.5 rounded-full transition-colors active:scale-95"
        >
          <Globe className="w-3.5 h-3.5 text-[#D96B27]" />
          <span>{language.toUpperCase()}</span>
        </button>
      </div>
    </header>
  );
};
