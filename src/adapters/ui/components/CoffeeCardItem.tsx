'use client';

import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { StashItemDTO } from '@/core/application/usecases/GetCoffeeStashUseCase';
import { Coffee } from '@/core/domain/coffee/Coffee';
import { Coffee as CoffeeIcon, Edit, Archive, CheckCircle } from 'lucide-react';

interface CoffeeCardItemProps {
  item: StashItemDTO;
  isSelected: boolean;
  onSelectForBrew: (id: string) => void;
  onEditCoffee: (coffee: Coffee) => void;
  onToggleStatus: (coffeeId: string, currentStatus: string) => void;
}

export const CoffeeCardItem: React.FC<CoffeeCardItemProps> = ({
  item,
  isSelected,
  onSelectForBrew,
  onEditCoffee,
  onToggleStatus,
}) => {
  const { t } = useTranslation();
  const c = item.coffee;
  const r = item.recipe;
  const processLabel = t.processes[c.process] || c.process;

  return (
    <div
      className={`bg-[#1A1512] border rounded-2xl overflow-hidden shadow-lg transition-all ${
        isSelected
          ? 'border-[#D96B27] ring-1 ring-[#D96B27]/60'
          : 'border-[#332820] hover:border-[#4A3B2F]'
      }`}
    >
      <div
        onClick={() => onSelectForBrew(c.id)}
        className="flex gap-3.5 p-3.5 cursor-pointer hover:bg-[#201915] transition-colors"
        title={t.selectForBrew}
      >
        <div className="w-20 h-24 rounded-xl bg-[#120F0D] border border-[#2D231C] overflow-hidden flex-shrink-0 relative">
          {c.imageUrl ? (
            <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#8C7B6E]">
              <CoffeeIcon className="w-8 h-8 opacity-40" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] font-metric font-semibold uppercase text-[#E29D52] truncate">
              {c.roaster}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#120F0D] text-[#D96B27] font-medium border border-[#3A2D23]">
              {processLabel}
            </span>
          </div>

          <h4 className="font-serif font-bold text-sm text-[#F7F2EB] truncate mt-0.5">
            {c.name}
          </h4>

          <p className="text-xs text-[#A8988B] mt-0.5">
            {c.originCountry} {c.altitudeMasl ? `• ${c.altitudeMasl}m` : ''}
          </p>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11px] font-metric font-bold text-[#F7F2EB] bg-[#120F0D] px-2 py-0.5 rounded border border-[#2D231C]">
              DF64 #{r ? r.grindSetting.toFixed(1) : '—'}
            </span>
            <span className="text-[10px] text-[#A8988B]">
              {t.extractionsCount.replace('{count}', String(item.feedbackHistory.length))}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#14100D] border-t border-[#2A211A] text-xs">
        <button
          onClick={() => onSelectForBrew(c.id)}
          className={`font-semibold flex items-center gap-1.5 transition-colors ${
            isSelected ? 'text-[#D96B27]' : 'text-[#F7F2EB] hover:text-[#D96B27]'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>{isSelected ? t.onBarActive : t.selectForBrew}</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onEditCoffee(c)}
            className="text-[#A8988B] hover:text-[#F7F2EB] flex items-center gap-1 transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>{t.editCoffee}</span>
          </button>
          <button
            onClick={() => onToggleStatus(c.id, c.status)}
            className="text-[#8C7B6E] hover:text-red-400 flex items-center gap-1 transition-colors"
            title={t.moveToHistory}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>{t.moveToHistory}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
