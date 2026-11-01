'use client';

import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { Coffee, Globe, Sliders, Shield, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onGoHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onGoHome }) => {
  const { t, language, toggleLanguage, isAdmin, toggleAdmin } = useTranslation();

  return (
    <header className="sticky top-0 z-30 bg-[#120F0D]/90 backdrop-blur-md border-b border-[#30261E] px-4 py-3.5">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <button
          onClick={onGoHome}
          className="flex items-center gap-3 text-left hover:opacity-85 transition-opacity cursor-pointer group"
          title="Ir a Mi Café"
          type="button"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D96B27] to-[#B35216] flex items-center justify-center text-[#141210] shadow-md shadow-[#D96B27]/20 group-hover:scale-105 transition-transform">
            <Coffee className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-black tracking-wider text-base text-[#F7F2EB]">
                {t.appName}
              </h1>
              <span className="text-[10px] font-metric bg-[#281F18] border border-[#3D3025] text-[#D96B27] px-2 py-0.5 rounded-full">
                {language === 'es' ? 'Laboratorio Especialidad' : 'Specialty Lab'}
              </span>
            </div>
            <p className="text-[11px] text-[#A8988B] flex items-center gap-1 font-metric">
              <Sliders className="w-3 h-3 text-[#E29D52]" />
              {t.gearSetup}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleAdmin}
            title={isAdmin ? 'Modo Administrador activado' : 'Activar Modo Administrador'}
            className={`flex items-center gap-1 text-[11px] font-metric font-semibold px-2.5 py-1.5 rounded-full border transition-all active:scale-95 ${
              isAdmin
                ? 'bg-[#2E1D13] border-[#D96B27] text-[#E29D52] shadow-sm shadow-[#D96B27]/20'
                : 'bg-[#181310] border-[#30261E] text-[#8C7B6E] hover:text-[#C5B5A7]'
            }`}
          >
            {isAdmin ? <ShieldCheck className="w-3.5 h-3.5 text-[#D96B27]" /> : <Shield className="w-3.5 h-3.5" />}
            <span>{isAdmin ? 'ADMIN' : 'USER'}</span>
          </button>

          <button
            onClick={toggleLanguage}
            aria-label="Toggle language"
            className="flex items-center gap-1.5 bg-[#1B1511] hover:bg-[#281F19] border border-[#3A2E24] text-xs font-metric font-semibold text-[#F7F2EB] px-3 py-1.5 rounded-full transition-all active:scale-95 shadow-sm"
          >
            <Globe className="w-3.5 h-3.5 text-[#D96B27]" />
            <span>{language.toUpperCase()}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
