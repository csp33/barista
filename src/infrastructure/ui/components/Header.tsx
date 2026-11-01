'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useUserProfile } from '../context/UserProfileContext';
import { Coffee, Globe, ShieldCheck, User } from 'lucide-react';

interface HeaderProps {
  onGoHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onGoHome }) => {
  const { t, language, toggleLanguage, isAdmin } = useTranslation();
  const { activeProfile, setIsProfileModalOpen } = useUserProfile();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const effectiveAdmin = mounted ? isAdmin : false;
  const effectiveProfileName = mounted && activeProfile ? activeProfile.name : '';
  const effectiveLanguage = mounted ? language : 'es';

  return (
    <header className="sticky top-0 z-30 bg-[#120F0D]/90 backdrop-blur-md border-b border-[#30261E] px-2.5 sm:px-4 py-2.5 sm:py-3">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-1.5 sm:gap-2">
        <button
          onClick={onGoHome}
          className="flex items-center gap-2 text-left hover:opacity-85 transition-opacity cursor-pointer group shrink-0"
          title="Ir a Mi Café"
          type="button"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#D96B27] to-[#B35216] flex items-center justify-center text-[#141210] shadow-md shadow-[#D96B27]/20 group-hover:scale-105 transition-transform shrink-0">
            <Coffee className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-brand font-bold tracking-[0.14em] text-sm sm:text-base text-[#F7F2EB] uppercase select-none">
              {t.appName}
            </h1>
          </div>
        </button>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Multiuser Profile Button */}
          <button
            onClick={() => setIsProfileModalOpen(true)}
            title={t.profiles.switchProfile}
            suppressHydrationWarning
            className="flex items-center gap-1 bg-[#1B1511] hover:bg-[#281F19] border border-[#3A2E24] hover:border-[#D96B27]/50 text-xs font-metric font-semibold text-[#F7F2EB] px-2 py-1.5 rounded-full transition-all active:scale-95 shadow-sm cursor-pointer shrink-0"
          >
            <div className="w-4 h-4 rounded-full bg-[#D96B27] text-[#141210] flex items-center justify-center font-bold text-[9px] shrink-0">
              {effectiveProfileName ? effectiveProfileName.slice(0, 1).toUpperCase() : <User className="w-2.5 h-2.5" />}
            </div>
            <span className="text-xs max-w-[55px] sm:max-w-none truncate">{effectiveProfileName || t.profiles.selectProfile}</span>
          </button>

          {/* User Admin Badge */}
          {effectiveAdmin && (
            <div
              title={t.profiles.adminRole}
              className="flex items-center gap-1 text-[11px] font-metric font-bold p-1 sm:px-2.5 sm:py-1.5 rounded-full bg-[#2E1D13] border border-[#D96B27]/40 text-[#E29D52] shadow-sm shadow-[#D96B27]/15 shrink-0"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#D96B27]" />
              <span className="hidden sm:inline">ADMIN</span>
            </div>
          )}

          <button
            onClick={toggleLanguage}
            aria-label="Toggle language"
            suppressHydrationWarning
            className="flex items-center gap-1 bg-[#1B1511] hover:bg-[#281F19] border border-[#3A2E24] text-xs font-metric font-semibold text-[#F7F2EB] px-2 sm:px-3 py-1.5 rounded-full transition-all active:scale-95 shadow-sm cursor-pointer shrink-0"
          >
            <Globe className="w-3.5 h-3.5 text-[#D96B27]" />
            <span>{effectiveLanguage.toUpperCase()}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
