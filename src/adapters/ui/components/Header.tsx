'use client';

import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { Coffee, Globe, Sliders } from 'lucide-react';

export const Header: React.FC = () => {
  const { t, language, toggleLanguage } = useTranslation();

  return (
    <header className="sticky top-0 z-30 bg-[#120F0D]/90 backdrop-blur-md border-b border-[#30261E] px-4 py-3.5">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D96B27] to-[#B35216] flex items-center justify-center text-[#141210] shadow-md shadow-[#D96B27]/20">
            <Coffee className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-black tracking-wider text-base text-[#F7F2EB]">
                {t.appName}
              </h1>
              <span className="text-[10px] font-metric bg-[#281F18] border border-[#3D3025] text-[#D96B27] px-2 py-0.5 rounded-full">
                Specialty Lab
              </span>
            </div>
            <p className="text-[11px] text-[#A8988B] flex items-center gap-1 font-metric">
              <Sliders className="w-3 h-3 text-[#E29D52]" />
              {t.gearSetup}
            </p>
          </div>
        </div>

        <button
          onClick={toggleLanguage}
          aria-label="Toggle language"
          className="flex items-center gap-1.5 bg-[#1B1511] hover:bg-[#281F19] border border-[#3A2E24] text-xs font-metric font-semibold text-[#F7F2EB] px-3 py-1.5 rounded-full transition-all active:scale-95 shadow-sm"
        >
          <Globe className="w-3.5 h-3.5 text-[#D96B27]" />
          <span>{language.toUpperCase()}</span>
        </button>
      </div>
    </header>
  );
};
