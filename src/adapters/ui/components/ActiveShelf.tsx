'use client';

import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { StashItemDTO } from '@/core/application/usecases/GetCoffeeStashUseCase';
import { Sparkles, Plus } from 'lucide-react';

interface ActiveShelfProps {
  items: StashItemDTO[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  onOpenAddModal: () => void;
}

export const ActiveShelf: React.FC<ActiveShelfProps> = ({
  items,
  selectedIndex,
  onSelectIndex,
  onOpenAddModal,
}) => {
  const { t } = useTranslation();

  return (
    <section className="mt-4 px-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#9E9288] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#E29D52]" />
            {t.activeBeans} ({items.length})
          </h2>
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1 text-xs font-medium text-[#D96B27] hover:text-[#E29D52] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            {t.addCoffee}
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar py-1 snap-x">
          {items.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            const c = item.coffee;

            return (
              <button
                key={c.id}
                onClick={() => onSelectIndex(idx)}
                className={`flex-shrink-0 w-64 text-left p-3.5 rounded-2xl border transition-all snap-start ${
                  isSelected
                    ? 'bg-[#221E19] border-[#D96B27] shadow-lg shadow-[#D96B27]/10 ring-1 ring-[#D96B27]/50'
                    : 'bg-[#181512] border-[#2C2621] opacity-75 hover:opacity-100'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-medium tracking-wide text-[#E29D52] uppercase truncate">
                    {c.roaster}
                  </span>
                  <span className="text-[10px] font-metric px-1.5 py-0.5 rounded bg-[#2C2621] text-[#9E9288] capitalize">
                    {c.process}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-[#F5EFEB] mt-1 truncate">
                  {c.name}
                </h3>

                <p className="text-xs text-[#9E9288] mt-0.5">
                  {c.originCountry} {c.altitudeMasl ? `• ${c.altitudeMasl}m` : ''}
                </p>

                <div className="flex flex-wrap gap-1 mt-2.5">
                  {c.tastingNotes.slice(0, 3).map((note, nIdx) => (
                    <span
                      key={nIdx}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-[#12100E] border border-[#2C2621] text-[#F5EFEB]/90"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
