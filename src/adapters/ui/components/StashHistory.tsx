'use client';

import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { StashItemDTO } from '@/core/application/usecases/GetCoffeeStashUseCase';
import { History, Award, CheckCircle } from 'lucide-react';

interface StashHistoryProps {
  items: StashItemDTO[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
}

export const StashHistory: React.FC<StashHistoryProps> = ({
  items,
  selectedIndex,
  onSelectIndex,
}) => {
  const { t } = useTranslation();

  return (
    <section className="mt-6 px-4 pb-12">
      <div className="max-w-md mx-auto">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#9E9288] flex items-center gap-1.5 mb-3">
          <History className="w-3.5 h-3.5 text-[#E29D52]" />
          {t.history}
        </h2>

        <div className="space-y-2">
          {items.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            const c = item.coffee;
            const r = item.recipe;

            return (
              <button
                key={c.id}
                onClick={() => onSelectIndex(idx)}
                className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#1F1B17] border-[#D96B27]/60'
                    : 'bg-[#151210] border-[#2C2621]/60 hover:border-[#2C2621]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-metric uppercase text-[#E29D52]">
                      {c.roaster}
                    </span>
                    <span className="text-[10px] text-[#9E9288]">• {c.originCountry}</span>
                  </div>
                  <h4 className="text-xs font-bold text-[#F5EFEB] mt-0.5">{c.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-metric bg-[#12100E] px-1.5 py-0.5 rounded text-[#9E9288] border border-[#2C2621]">
                      DF64 #{r ? r.grindSetting.toFixed(1) : '—'}
                    </span>
                    <span className="text-[10px] text-[#9E9288]">
                      {item.feedbackHistory.length} dial-ins
                    </span>
                  </div>
                </div>

                {isSelected ? (
                  <span className="p-1 rounded-full bg-[#D96B27]/20 text-[#D96B27]">
                    <CheckCircle className="w-4 h-4" />
                  </span>
                ) : (
                  <span className="text-[11px] text-[#9E9288] hover:text-[#F5EFEB]">
                    Select
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
