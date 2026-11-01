'use client';

import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { StashItemDTO } from '@/core/application/usecases/GetCoffeeStashUseCase';
import { Compass, Thermometer, Clock, Scale, ArrowUpRight, Flame } from 'lucide-react';

interface DialInCardProps {
  item: StashItemDTO;
  onOpenFeedback: () => void;
}

export const DialInCard: React.FC<DialInCardProps> = ({ item, onOpenFeedback }) => {
  const { t } = useTranslation();
  const { coffee, recipe } = item;

  if (!recipe) return null;

  const tempColors: Record<string, string> = {
    low: 'text-blue-400 bg-blue-950/40 border-blue-800/50',
    normal: 'text-amber-300 bg-amber-950/40 border-amber-800/50',
    high: 'text-orange-400 bg-orange-950/40 border-orange-800/50',
    very_high: 'text-red-400 bg-red-950/40 border-red-800/50',
  };

  const tempLabels: Record<string, string> = {
    low: t.temperaturePresets.low,
    normal: t.temperaturePresets.normal,
    high: t.temperaturePresets.high,
    very_high: t.temperaturePresets.very_high,
  };

  return (
    <div className="bg-[#181512] border border-[#2C2621] rounded-3xl p-5 shadow-xl relative overflow-hidden">
      {/* Background radial accent */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#D96B27]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-[#2C2621]/60 pb-3 mb-4">
        <div>
          <span className="text-[11px] font-metric uppercase tracking-wider text-[#E29D52]">
            {coffee.roaster}
          </span>
          <h2 className="text-lg font-bold text-[#F5EFEB] leading-tight">
            {coffee.name}
          </h2>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase font-metric text-[#9E9288] block">
            {t.restDays}
          </span>
          <span className="text-xs font-semibold text-[#4E8765] bg-[#4E8765]/10 px-2 py-0.5 rounded-full inline-block">
            {recipe.recommendedRestDays} {t.daysRestOptimal}
          </span>
        </div>
      </div>

      {/* Hero Gear Dial-In Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* DF64 II Setting */}
        <div className="bg-[#12100E] border border-[#2C2621] rounded-2xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#9E9288]">
            <span className="text-[11px] font-medium">{t.grindSetting}</span>
            <Compass className="w-4 h-4 text-[#D96B27]" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold font-metric text-[#F5EFEB]">
              #{recipe.grindSetting.toFixed(1)}
            </span>
            <span className="text-[11px] text-[#9E9288] block mt-0.5">
              Stepless collar
            </span>
          </div>
        </div>

        {/* Sage Impress Temp Preset */}
        <div className="bg-[#12100E] border border-[#2C2621] rounded-2xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#9E9288]">
            <span className="text-[11px] font-medium">{t.temperature}</span>
            <Thermometer className="w-4 h-4 text-[#E29D52]" />
          </div>
          <div className="my-2">
            <span
              className={`text-xs font-bold px-2 py-1 rounded-lg border inline-block ${
                tempColors[recipe.machineTemperature] || tempColors.normal
              }`}
            >
              {tempLabels[recipe.machineTemperature] || recipe.machineTemperature}
            </span>
            <span className="text-[11px] text-[#9E9288] block mt-1.5">
              Sage Touch screen
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Specs Row */}
      <div className="grid grid-cols-4 gap-2 bg-[#12100E] border border-[#2C2621]/60 rounded-xl p-2.5 mb-4 text-center">
        <div>
          <span className="text-[10px] text-[#9E9288] block">{t.dose}</span>
          <span className="text-xs font-bold font-metric text-[#F5EFEB]">
            {recipe.doseGrams}g
          </span>
        </div>
        <div>
          <span className="text-[10px] text-[#9E9288] block">{t.yield}</span>
          <span className="text-xs font-bold font-metric text-[#F5EFEB]">
            {recipe.yieldGrams}g
          </span>
        </div>
        <div>
          <span className="text-[10px] text-[#9E9288] block">{t.ratio}</span>
          <span className="text-xs font-bold font-metric text-[#E29D52]">
            {recipe.ratio}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-[#9E9288] block">{t.time}</span>
          <span className="text-xs font-bold font-metric text-[#F5EFEB]">
            ~{recipe.targetTimeSeconds}s
          </span>
        </div>
      </div>

      {/* Barista Notes */}
      {recipe.notes.length > 0 && (
        <div className="mb-4 bg-[#12100E]/70 rounded-xl p-3 border border-[#2C2621]/40">
          <ul className="space-y-1">
            {recipe.notes.slice(-2).map((n, i) => (
              <li key={i} className="text-[11px] text-[#9E9288] flex items-center gap-1.5">
                <Flame className="w-3 h-3 text-[#D96B27] flex-shrink-0" />
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action CTA Button */}
      <button
        onClick={onOpenFeedback}
        className="w-full bg-[#D96B27] hover:bg-[#E29D52] text-[#12100E] font-bold text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-md shadow-[#D96B27]/20"
      >
        <span>{t.pullShotAndDialIn}</span>
        <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
      </button>
    </div>
  );
};
