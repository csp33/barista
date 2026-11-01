'use client';

import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { StashItemDTO } from '@/application/usecases/GetCoffeeStashUseCase';
import { Sparkles, Plus, Edit2 } from 'lucide-react';

interface ActiveShelfProps {
  items: StashItemDTO[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  onOpenAddModal: () => void;
  onOpenEditCoffee: (index: number) => void;
}

export const ActiveShelf: React.FC<ActiveShelfProps> = ({
  items,
  selectedIndex,
  onSelectIndex,
  onOpenAddModal,
  onOpenEditCoffee,
}) => {
  const { t } = useTranslation();

  return (
    <section className="mt-4 px-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#A8988B] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#E29D52]" />
            {t.activeBeans} ({items.length})
          </h2>
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1 text-xs font-semibold text-[#D96B27] hover:text-[#E29D52] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            {t.addCoffee}
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar py-1 snap-x">
          {items.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            const c = item.coffee;
            const processLabel = t.processes[c.process] || c.process;

            return (
              <div
                key={c.id}
                className={`relative flex-shrink-0 w-64 p-4 rounded-2xl border transition-all snap-start cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#281F19] to-[#1C1612] border-[#D96B27] shadow-xl shadow-[#D96B27]/15 ring-1 ring-[#D96B27]/60'
                    : 'bg-[#181411] border-[#30261E] opacity-75 hover:opacity-100 hover:border-[#42352B]'
                }`}
                onClick={() => onSelectIndex(idx)}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-metric font-semibold tracking-wider text-[#E29D52] uppercase truncate">
                    {c.roaster}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-metric px-2 py-0.5 rounded-full bg-[#120F0D] text-[#D96B27] border border-[#3A2D23] capitalize">
                      {processLabel}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenEditCoffee(idx);
                      }}
                      title={t.editCoffee}
                      className="p-1 hover:text-[#F7F2EB] text-[#A8988B] transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <h3 className="font-serif font-bold text-sm text-[#F7F2EB] mt-1.5 truncate">
                  {c.name}
                </h3>

                <p className="text-xs text-[#A8988B] mt-0.5">
                  {c.originCountry} {c.altitudeMasl ? `• ${c.altitudeMasl}m` : ''}
                </p>

                <div className="flex flex-wrap gap-1 mt-3">
                  {c.tastingNotes.slice(0, 3).map((note, nIdx) => (
                    <span
                      key={nIdx}
                      className="text-[10px] font-serif italic px-2 py-0.5 rounded-md bg-[#120F0D] border border-[#2D231B] text-[#F7F2EB]/80"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
