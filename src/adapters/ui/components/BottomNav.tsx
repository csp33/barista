'use client';

import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { Coffee, Layers, Sliders } from 'lucide-react';

export type NavTab = 'bar' | 'stash' | 'gear';

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  activeCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  activeCount,
}) => {
  const { t } = useTranslation();

  const tabs: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'stash',
      label: t.navStash,
      icon: <Layers className="w-5 h-5 stroke-[2.2]" />,
      badge: activeCount,
    },
    {
      id: 'gear',
      label: t.navGear,
      icon: <Sliders className="w-5 h-5 stroke-[2.2]" />,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#16120F]/95 backdrop-blur-lg border-t border-[#332820] py-2 px-6 safe-bottom shadow-2xl">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map(tab => {
          const isActive = tab.id === 'stash' ? (activeTab === 'stash' || activeTab === 'bar') : activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center gap-1 py-1 px-4 rounded-2xl transition-all relative ${
                isActive
                  ? 'text-[#D96B27]'
                  : 'text-[#8C7B6E] hover:text-[#C2B2A3]'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[#D96B27] text-[#120F0D] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center font-metric">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium tracking-wide ${isActive ? 'font-bold' : ''}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#D96B27] mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
