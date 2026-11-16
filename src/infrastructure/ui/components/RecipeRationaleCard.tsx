'use client';

import React from 'react';
import { Coffee } from '@/domain/coffee/Coffee';
import { Recipe } from '@/domain/recipe/Recipe';
import { ExtractionFeedback } from '@/domain/recipe/ExtractionFeedback';
import { Grinder } from '@/domain/equipment/Grinder';
import { EspressoMachine } from '@/domain/equipment/EspressoMachine';
import { RecipeExplainer } from '@/domain/recipe/RecipeExplainer';
import {
  findPresetGrinderById,
  findPresetMachineById,
} from '@/infrastructure/equipment/EquipmentCatalogRepository';
import { useTranslation } from '../i18n/LanguageContext';
import { Layers, Compass, Thermometer, Scale, Clock, Sparkles, Activity } from 'lucide-react';

interface RecipeRationaleCardProps {
  coffee: Coffee;
  recipe: Recipe;
  grinder?: Grinder;
  machine?: EspressoMachine;
  feedbackHistory?: ExtractionFeedback[];
}

export const RecipeRationaleCard: React.FC<RecipeRationaleCardProps> = ({
  coffee,
  recipe,
  grinder,
  machine,
  feedbackHistory = [],
}) => {
  const { language } = useTranslation();
  const g = grinder || findPresetGrinderById(recipe.grinderId);
  const m = machine || findPresetMachineById(recipe.machineId);
  const deterministic = RecipeExplainer.explain(coffee, recipe, m);
  const latestFeedback = feedbackHistory[0];

  const tasteLabel: Record<string, { es: string; en: string }> = {
    balanced: { es: 'Equilibrado', en: 'Balanced' },
    sour: { es: 'Ácido / Sub-extraído', en: 'Sour / Under-extracted' },
    bitter: { es: 'Amargo / Sobre-extraído', en: 'Bitter / Over-extracted' },
    astringent: { es: 'Astringente', en: 'Astringent' },
    weak: { es: 'Aguado', en: 'Weak' },
    channeled: { es: 'Canalización', en: 'Channeled' },
  };

  const items = [
    {
      icon: <Layers className="w-3.5 h-3.5 text-[#D96B27] flex-shrink-0 mt-0.5" />,
      title: language === 'es' ? `Dosis (${recipe.doseGrams}g • ${m.portafilterSizeMm}mm)` : `Dose (${recipe.doseGrams}g • ${m.portafilterSizeMm}mm)`,
      text: deterministic.doseWhy[language],
    },
    {
      icon: <Compass className="w-3.5 h-3.5 text-[#E29D52] flex-shrink-0 mt-0.5" />,
      title: language === 'es' ? `Molienda ${g.brand} #${recipe.grindSetting}` : `${g.brand} Grind #${recipe.grindSetting}`,
      text: deterministic.grindWhy[language],
    },
    {
      icon: <Thermometer className="w-3.5 h-3.5 text-[#D96B27] flex-shrink-0 mt-0.5" />,
      title: language === 'es' ? `Temperatura ${m.brand}` : `${m.brand} Temp`,
      text: deterministic.tempWhy[language],
    },
    {
      icon: <Scale className="w-3.5 h-3.5 text-[#E29D52] flex-shrink-0 mt-0.5" />,
      title: language === 'es' ? `Ratio & Salida (${recipe.ratio})` : `Ratio & Yield (${recipe.ratio})`,
      text: deterministic.ratioWhy[language],
    },
    {
      icon: <Clock className="w-3.5 h-3.5 text-[#D96B27] flex-shrink-0 mt-0.5" />,
      title: language === 'es' ? `Ventana de Reposo (${coffee.recommendedRestDays}d)` : `Rest Window (${coffee.recommendedRestDays}d)`,
      text: deterministic.restWhy[language],
    },
  ];

  const latestTasteText = latestFeedback
    ? (tasteLabel[latestFeedback.tasteProfile]?.[language] ?? latestFeedback.tasteProfile)
    : '';

  return (
    <div className="bg-[#191411] border border-[#35281E] rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
      {latestFeedback && (
        <div className="bg-[#130F0D] border border-[#2E241D] rounded-xl px-3.5 py-2.5 text-xs text-[#D8C7B9] flex items-start gap-2.5 border-l-2 border-l-[#D96B27] font-metric">
          <Activity className="w-3.5 h-3.5 text-[#D96B27] flex-shrink-0 mt-0.5" />
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 leading-relaxed">
            <span>
              {language === 'es'
                ? `Último tiro: ${latestFeedback.actualDoseGrams}g → ${latestFeedback.actualYieldGrams}g en ${latestFeedback.actualTimeSeconds}s (${latestTasteText})`
                : `Last shot: ${latestFeedback.actualDoseGrams}g → ${latestFeedback.actualYieldGrams}g in ${latestFeedback.actualTimeSeconds}s (${latestTasteText})`}
            </span>
            <span className="text-[#E29D52] font-semibold whitespace-nowrap">
              {`• Dial #${latestFeedback.actualGrindSetting} → #${recipe.grindSetting}`}
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-b border-[#2B211A] pb-2.5">
        <h3 className="text-sm font-serif font-bold text-[#F7F2EB] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#D96B27]" />
          {language === 'es' ? '¿Por qué este ajuste?' : 'Why this dial-in recipe?'}
        </h3>
        <span className="text-[10px] font-metric text-[#8C7B6E] bg-[#120F0D] px-2.5 py-0.5 rounded-full border border-[#2B211A]">
          {m.brand} {m.portafilterSizeMm}mm • {g.brand}
        </span>
      </div>

      <div className="space-y-3.5">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-3 text-xs">
            {item.icon}
            <div className="flex-1 leading-snug">
              <span className="font-semibold text-[#F7F2EB] block text-xs mb-0.5">
                {item.title}
              </span>
              <p className="text-xs text-[#C8B8AB] leading-relaxed">
                {item.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
