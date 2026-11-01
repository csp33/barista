'use client';

import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { StashItemDTO } from '@/core/application/usecases/GetCoffeeStashUseCase';
import { Coffee } from '@/core/domain/coffee/Coffee';
import { Coffee as CoffeeIcon, Edit, Archive } from 'lucide-react';

interface CoffeeCardItemProps {
  item: StashItemDTO;
  onSelectForBrew: (id: string) => void;
  onEditCoffee: (coffee: Coffee) => void;
  onToggleStatus: (coffeeId: string, currentStatus: string) => void;
}

export const CoffeeCardItem: React.FC<CoffeeCardItemProps> = ({
  item,
  onSelectForBrew,
  onEditCoffee,
  onToggleStatus,
}) => {
  const { t } = useTranslation();
  const c = item.coffee;
  const r = item.recipe;
  const processLabel = t.processes[c.process] || c.process;

  return (
    <article
      onClick={() => onSelectForBrew(c.id)}
      className="bg-[#181310] border border-[#2F241C] hover:border-[#4E3D30] rounded-2xl p-4 transition-all cursor-pointer shadow-md group"
    >
      <div className="flex gap-4 items-start">
        {/* Coffee Bag Image */}
        <div className="w-20 h-24 rounded-xl bg-[#120F0D] border border-[#2D231C] overflow-hidden flex-shrink-0 relative">
          {c.imageUrl ? (
            <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#8C7B6E]">
              <CoffeeIcon className="w-8 h-8 opacity-40" />
            </div>
          )}
        </div>

        {/* Coffee Information */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-metric font-semibold uppercase tracking-wider text-[#E29D52] truncate">
              {c.roaster}
            </span>

            {/* Quiet Actions */}
            <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => onEditCoffee(c)}
                className="p-1.5 text-[#8A796C] hover:text-[#F7F2EB] hover:bg-[#251D17] rounded-lg transition-colors"
                title={t.editCoffee}
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onToggleStatus(c.id, c.status)}
                className="p-1.5 text-[#8A796C] hover:text-amber-400 hover:bg-[#251D17] rounded-lg transition-colors"
                title={t.moveToHistory}
              >
                <Archive className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <h4 className="font-serif font-bold text-base text-[#F7F2EB] truncate mt-0.5 group-hover:text-[#E29D52] transition-colors">
            {c.name}
          </h4>

          <p className="text-xs text-[#A8988B] mt-0.5 truncate">
            {c.originCountry} {c.altitudeMasl ? `• ${c.altitudeMasl}m` : ''} • {processLabel}
          </p>

          {/* Tasting Notes */}
          {c.tastingNotes.length > 0 && (
            <p className="text-[11px] font-serif italic text-[#C5B5A7]/80 truncate mt-1">
              {c.tastingNotes.slice(0, 3).join(', ')}
            </p>
          )}

          {/* Hardware dial badges */}
          <div className="flex items-center gap-2 mt-2.5 font-metric text-[11px]">
            <span className="font-bold text-[#F7F2EB] bg-[#120F0D] px-2.5 py-0.5 rounded-lg border border-[#2D231C]">
              DF64 #{r ? r.grindSetting.toFixed(1) : '—'}
            </span>
            {r && (
              <span className="text-[#A8988B] bg-[#120F0D] px-2 py-0.5 rounded-lg border border-[#2D231C]">
                Sage {t.temperaturePresets[r.machineTemperature as keyof typeof t.temperaturePresets]?.split('(')[0].trim() || r.machineTemperature}
              </span>
            )}
            <span className="text-[10px] text-[#8C7B6E] ml-auto">
              {t.extractionsCount.replace('{count}', String(item.feedbackHistory.length))}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};
