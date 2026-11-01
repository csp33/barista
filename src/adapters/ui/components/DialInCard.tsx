'use client';

import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { StashItemDTO } from '@/core/application/usecases/GetCoffeeStashUseCase';
import { Df64DialGauge } from './Df64DialGauge';
import { SageTempSelector } from './SageTempSelector';
import { ArrowUpRight, Flame, Edit } from 'lucide-react';
import { Translations } from '../i18n/types';

interface DialInCardProps {
  item: StashItemDTO;
  onOpenFeedback: () => void;
  onOpenEditCoffee: () => void;
}

function formatNote(
  raw: string,
  t: Translations,
  restDays: number,
  grind: number,
  roaster: string,
  name: string
): string {
  if (raw.includes('WDT') || raw.includes('tamp')) return t.baristaTips.wdt;
  if (raw.includes('fines') || raw.includes('finos')) return t.baristaTips.naturals;
  if (raw.includes('rest window') || raw.includes('Reposo') || raw.includes('reposo')) {
    return t.baristaTips.restWindow.replace('{days}', String(restDays));
  }
  if (raw.includes('finer grind') || raw.includes('fina')) return t.baristaTips.sourAdjust;
  if (raw.includes('coarser grind') || raw.includes('gruesa')) return t.baristaTips.bitterAdjust;
  if (raw.includes('Channelling') || raw.includes('Canalización')) return t.baristaTips.channeledAdjust;
  if (raw.includes('sweet spot') || raw.includes('dulce')) {
    return t.baristaTips.sweetSpot.replace('{grind}', String(grind));
  }
  if (raw.includes('tuned for') || raw.includes('calibrada')) {
    return t.baristaTips.tunedFor.replace('{roaster}', roaster).replace('{name}', name);
  }
  return raw;
}

export const DialInCard: React.FC<DialInCardProps> = ({
  item,
  onOpenFeedback,
  onOpenEditCoffee,
}) => {
  const { t } = useTranslation();
  const { coffee, recipe } = item;

  if (!recipe) return null;

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
      <div className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#120F0D] border border-[#30261E] rounded-2xl p-4">
          {/* DF64 II Rotary Gauge */}
          <div className="w-full sm:w-auto flex flex-col items-center">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[#A8988B] mb-2">
              {t.grindSetting}
            </span>
            <Df64DialGauge setting={recipe.grindSetting} />
          </div>

          {/* Sage Touch Impress Temperature Controller */}
          <div className="w-full sm:flex-1">
            <SageTempSelector currentTemp={recipe.machineTemperature} />
          </div>
        </div>

        {/* Technical Brew Parameters Bar */}
        <div className="grid grid-cols-4 gap-2 bg-[#120F0D] border border-[#30261E] rounded-2xl p-3 text-center">
          <div>
            <span className="text-[10px] uppercase font-metric text-[#8A7A6D] block">
              {t.dose}
            </span>
            <span className="text-sm font-bold font-metric text-[#F7F2EB]">
              {recipe.doseGrams}g
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-metric text-[#8A7A6D] block">
              {t.yield}
            </span>
            <span className="text-sm font-bold font-metric text-[#F7F2EB]">
              {recipe.yieldGrams}g
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-metric text-[#8A7A6D] block">
              {t.ratio}
            </span>
            <span className="text-sm font-bold font-metric text-[#E29D52]">
              {recipe.ratio}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-metric text-[#8A7A6D] block">
              {t.time}
            </span>
            <span className="text-sm font-bold font-metric text-[#F7F2EB]">
              ~{recipe.targetTimeSeconds}s
            </span>
          </div>
        </div>

        {/* Localized Barista Recommendations */}
        {recipe.notes.length > 0 && (
          <div className="bg-[#1D1713] rounded-2xl p-3.5 border border-[#3D3025]">
            <ul className="space-y-1.5">
              {recipe.notes.slice(-2).map((n, i) => (
                <li key={i} className="text-xs text-[#C8B8AB] flex items-start gap-2">
                  <Flame className="w-3.5 h-3.5 text-[#D96B27] flex-shrink-0 mt-0.5" />
                  <span>
                    {formatNote(
                      n,
                      t,
                      recipe.recommendedRestDays,
                      recipe.grindSetting,
                      coffee.roaster,
                      coffee.name
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA Pull Shot Button */}
        <button
          onClick={onOpenFeedback}
          className="w-full bg-[#D96B27] hover:bg-[#E29D52] text-[#141210] font-bold text-sm py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-lg shadow-[#D96B27]/25"
        >
          <span>{t.pullShotAndDialIn}</span>
          <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </article>
  );
};
