'use client';

import React from 'react';
import { Coffee } from '@/core/domain/coffee/Coffee';
import { Recipe } from '@/core/domain/recipe/Recipe';
import { RecipeExplainer } from '@/core/domain/recipe/RecipeExplainer';
import { useTranslation } from '../i18n/LanguageContext';
import { Compass, Thermometer, Scale, Clock, Sparkles } from 'lucide-react';

interface RecipeRationaleCardProps {
  coffee: Coffee;
  recipe: Recipe;
}

export const RecipeRationaleCard: React.FC<RecipeRationaleCardProps> = ({
  coffee,
  recipe,
}) => {
  const { language } = useTranslation();
  const rationale = RecipeExplainer.explain(coffee, recipe);

  const items = [
    {
      icon: <Compass className="w-3.5 h-3.5 text-[#D96B27] flex-shrink-0 mt-0.5" />,
      title: language === 'es' ? `Molienda DF64 #${recipe.grindSetting}` : `DF64 Grind #${recipe.grindSetting}`,
      text: rationale.grindWhy[language],
    },
    {
      icon: <Thermometer className="w-3.5 h-3.5 text-[#E29D52] flex-shrink-0 mt-0.5" />,
      title: language === 'es' ? 'Temperatura ThermoJet Sage' : 'Sage ThermoJet Temp',
      text: rationale.tempWhy[language],
    },
    {
      icon: <Scale className="w-3.5 h-3.5 text-[#D96B27] flex-shrink-0 mt-0.5" />,
      title: language === 'es' ? `Ratio & Salida (${recipe.ratio})` : `Ratio & Yield (${recipe.ratio})`,
      text: rationale.ratioWhy[language],
    },
    {
      icon: <Clock className="w-3.5 h-3.5 text-[#E29D52] flex-shrink-0 mt-0.5" />,
      title: language === 'es' ? `Ventana de Reposo (${coffee.recommendedRestDays}d)` : `Rest Window (${coffee.recommendedRestDays}d)`,
      text: rationale.restWhy[language],
    },
  ];

  return (
    <div className="bg-[#191411] border border-[#35281E] rounded-2xl p-4 space-y-3">
      {coffee.sommelierStory && (
        <div className="bg-[#130F0D] border border-[#2E241D] rounded-xl p-3 text-[11px] text-[#D8C7B9] leading-relaxed italic border-l-2 border-l-[#D96B27]">
          <span className="font-serif not-italic font-bold text-[#E29D52] block text-[10px] uppercase tracking-wider mb-1">
            {language === 'es' ? 'Notas de Sommelier & Terroir' : 'Sommelier Notes & Terroir'}
          </span>
          &ldquo;{coffee.sommelierStory}&rdquo;
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-xs font-serif font-bold text-[#F7F2EB] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#D96B27]" />
          {language === 'es' ? '¿Por qué este ajuste?' : 'Why this dial-in recipe?'}
        </h3>
        <span className="text-[10px] font-metric text-[#A8988B] bg-[#120F0D] px-2 py-0.5 rounded-full border border-[#2B211A]">
          DF64 II • Sage 54mm
        </span>
      </div>

      <div className="space-y-2.5">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-2.5 text-xs">
            {item.icon}
            <div className="flex-1 leading-snug">
              <span className="font-semibold text-[#F7F2EB] block text-[11px] mb-0.5">
                {item.title}
              </span>
              <p className="text-[11px] text-[#C8B8AB] leading-relaxed">
                {item.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
