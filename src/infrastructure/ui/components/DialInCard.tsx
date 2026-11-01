'use client';

import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { StashItemDTO } from '@/application/usecases/GetCoffeeStashUseCase';
import { Df64DialGauge } from './Df64DialGauge';
import { SageTempSelector } from './SageTempSelector';
import { RecipeRationaleCard } from './RecipeRationaleCard';
import {
  findPresetGrinderById,
  findPresetMachineById,
} from '@/infrastructure/equipment/EquipmentCatalogRepository';
import { ArrowUpRight, Edit, Gauge, Coffee as CoffeeIcon } from 'lucide-react';

interface DialInCardProps {
  item: StashItemDTO;
  onOpenFeedback: () => void;
  onOpenEditCoffee: () => void;
}

export const DialInCard: React.FC<DialInCardProps> = ({
  item,
  onOpenFeedback,
  onOpenEditCoffee,
}) => {
  const { t } = useTranslation();
  const { coffee, recipe } = item;

  if (!recipe) return null;

  const grinder = findPresetGrinderById(recipe.grinderId);
  const machine = findPresetMachineById(recipe.machineId);
  const processLabel = t.processes[coffee.process] || coffee.process;
  const roastLabel = t.roasts[coffee.roastLevel] || coffee.roastLevel;

  return (
    <article className="relative bg-[#181411] border border-[#3A3027] rounded-3xl overflow-hidden shadow-2xl">
      {/* Editorial Header Banner with subtle crema illumination */}
      <div className="relative p-5 pb-4 bg-gradient-to-b from-[#261E18] to-[#181411] border-b border-[#30261E]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-metric font-semibold tracking-wider uppercase text-[#E29D52]">
                {coffee.roaster}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2A211A] text-[#D96B27] font-medium border border-[#443529]">
                {processLabel} • {roastLabel}
              </span>
            </div>
            <h2 className="text-xl font-serif font-bold text-[#F7F2EB] tracking-tight mt-1">
              {coffee.name}
            </h2>
            <p className="text-xs text-[#A8988B] mt-0.5">
              {coffee.originCountry} {coffee.altitudeMasl ? `• ${coffee.altitudeMasl}m` : ''}
              {coffee.variety ? ` • ${coffee.variety}` : ''}
            </p>
          </div>

          <button
            onClick={onOpenEditCoffee}
            title={t.editCoffee}
            className="flex items-center gap-1 text-[11px] text-[#A8988B] hover:text-[#F7F2EB] bg-[#12100E] border border-[#3A3027] px-2.5 py-1.5 rounded-xl transition-colors active:scale-95"
          >
            <Edit className="w-3.5 h-3.5 text-[#D96B27]" />
            <span>{t.editCoffee}</span>
          </button>
        </div>

        {/* Tasting Notes Stamp Chips */}
        {coffee.tastingNotes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {coffee.tastingNotes.map((note, i) => (
              <span
                key={i}
                className="text-[11px] font-serif italic px-2.5 py-0.5 rounded-lg bg-[#241C16] border border-[#3D3025] text-[#F7F2EB]/90"
              >
                {note}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Main Barista Hardware Tuning Section */}
      <div className="p-5 sm:p-6 space-y-4">
        {/* Rotary Instrument Gauge */}
        <div className="bg-[#120F0D] border border-[#30261E] rounded-2xl p-5 flex flex-col items-center shadow-inner">
          <div className="w-full mb-3 px-1">
            <span className="text-[11px] font-metric font-semibold uppercase tracking-wider text-[#E29D52] flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-[#D96B27]" />
              {t.grindSetting} • {grinder.brand} {grinder.model}
            </span>
          </div>
          <Df64DialGauge setting={recipe.grindSetting} grinder={grinder} />
        </div>

        {/* Machine Temperature Controller */}
        <SageTempSelector currentTemp={recipe.machineTemperature} machine={machine} />

        {/* Technical Brew Parameters Bar */}
        <div className="grid grid-cols-4 gap-2 bg-[#120F0D] border border-[#30261E] rounded-2xl p-4 text-center">
          <div>
            <span className="text-[10px] uppercase font-metric text-[#8A7A6D] block mb-0.5">
              {t.dose}
            </span>
            <span className="text-base font-bold font-metric text-[#F7F2EB]">
              {recipe.doseGrams}g
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-metric text-[#8A7A6D] block mb-0.5">
              {t.yield}
            </span>
            <span className="text-base font-bold font-metric text-[#F7F2EB]">
              {recipe.yieldGrams}g
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-metric text-[#8A7A6D] block mb-0.5">
              {t.ratio}
            </span>
            <span className="text-base font-bold font-metric text-[#E29D52]">
              {recipe.ratio}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-metric text-[#8A7A6D] block mb-0.5">
              {t.time}
            </span>
            <span className="text-base font-bold font-metric text-[#F7F2EB]">
              ~{recipe.targetTimeSeconds}s
            </span>
          </div>
        </div>

        {/* Primary CTA: Pull Shot Button placed directly below brew parameters */}
        <button
          onClick={onOpenFeedback}
          className="w-full bg-gradient-to-r from-[#D96B27] via-[#E29D52] to-[#D96B27] hover:brightness-110 text-[#141210] font-bold text-sm py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-[#D96B27]/30 border border-[#F7F2EB]/15"
        >
          <CoffeeIcon className="w-4 h-4 stroke-[2.5]" />
          <span>{t.pullShotAndDialIn}</span>
          <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Localized Barista Recommendations & Rationales */}
        <RecipeRationaleCard coffee={coffee} recipe={recipe} grinder={grinder} machine={machine} />
      </div>
    </article>
  );
};
