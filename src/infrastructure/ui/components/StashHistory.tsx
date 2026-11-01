'use client';

import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { StashItemDTO } from '@/application/usecases/GetCoffeeStashUseCase';
import { History, CheckCircle2, ChevronRight } from 'lucide-react';

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
    <section className="mt-8 px-4 pb-16">
      <div className="max-w-md mx-auto">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#A8988B] flex items-center gap-1.5 mb-3.5">
          <History className="w-3.5 h-3.5 text-[#E29D52]" />
          {t.history} ({items.length})
        </h2>

        <div className="space-y-2">
          {items.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            const c = item.coffee;
            const r = item.recipe;
            const processLabel = t.processes[c.process] || c.process;

            return (
              <button
                key={c.id}
                onClick={() => onSelectIndex(idx)}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#241C16] border-[#D96B27] shadow-md shadow-[#D96B27]/10'
                    : 'bg-[#16120F] border-[#2C231B] hover:border-[#3E3025]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-metric font-semibold uppercase text-[#E29D52]">
                      {c.roaster}
                    </span>
                    <span className="text-[10px] text-[#A8988B]">• {c.originCountry}</span>
                    <span className="text-[10px] text-[#D96B27]">({processLabel})</span>
                  </div>
                  <h4 className="font-serif font-bold text-sm text-[#F7F2EB] mt-0.5">
                    {c.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1.5 font-metric text-[11px]">
                    <span className="bg-[#120F0D] px-2 py-0.5 rounded text-[#D96B27] border border-[#3A2D23]">
                      #{r ? r.grindSetting.toFixed(1) : '—'}
                    </span>
                    <span className="text-[#A8988B]">
                      {item.feedbackHistory.length} dial-ins
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[#D96B27]">
                  {isSelected ? (
                    <CheckCircle2 className="w-5 h-5 fill-[#D96B27]/20" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-[#A8988B]" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
