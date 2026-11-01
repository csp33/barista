'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { StashItemDTO } from '@/core/application/usecases/GetCoffeeStashUseCase';
import { TasteProfile } from '@/core/domain/recipe/ExtractionFeedback';
import { X, Check, Loader2 } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  item: StashItemDTO;
  onClose: () => void;
  onSuccess: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  item,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { recipe } = item;

  const [grind, setGrind] = useState(recipe?.grindSetting ?? 12);
  const [dose, setDose] = useState(recipe?.doseGrams ?? 18);
  const [actualYield, setActualYield] = useState(recipe?.yieldGrams ?? 36);
  const [time, setTime] = useState(28);
  const [taste, setTaste] = useState<TasteProfile>('balanced');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (recipe) {
      setGrind(recipe.grindSetting);
      setDose(recipe.doseGrams);
      setActualYield(recipe.yieldGrams);
      setTime(recipe.targetTimeSeconds || 28);
    }
  }, [recipe?.id, recipe?.grindSetting, isOpen]);

  if (!isOpen || !recipe) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/recipes/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeId: recipe.id,
          actualGrindSetting: grind,
          actualDoseGrams: dose,
          actualYieldGrams: actualYield,
          actualTimeSeconds: time,
          tasteProfile: taste,
          userNotes: notes,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Feedback submission failed');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al registrar el feedback');
    } finally {
      setLoading(false);
    }
  };

  const options: { id: TasteProfile; label: string; tone: string }[] = [
    { id: 'balanced', label: t.balancedGodShot, tone: 'border-[#4E8765] text-[#71BC8E]' },
    { id: 'sour', label: t.sourUnderExtracted, tone: 'border-amber-500 text-amber-400' },
    { id: 'bitter', label: t.bitterOverExtracted, tone: 'border-orange-500 text-orange-400' },
    { id: 'channeled', label: t.channeled, tone: 'border-red-500 text-red-400' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#1C1713] border border-[#3E3025] w-full max-w-md rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-[#A8988B] hover:text-[#F7F2EB] rounded-full bg-[#120F0D] border border-[#30261E]"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="font-serif text-lg font-bold text-[#F7F2EB] mb-1">
          {t.logExtractionFeedback}
        </h3>
        <p className="text-xs text-[#A8988B] mb-4">
          {item.coffee.roaster} • {item.coffee.name}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3 bg-[#120F0D] p-3.5 rounded-2xl border border-[#30261E]">
            <div>
              <label className="text-[11px] text-[#A8988B] block mb-1">{t.grindSetting}</label>
              <input type="number" step="0.5" value={grind} onChange={e => setGrind(parseFloat(e.target.value))} className="w-full bg-[#1C1713] border border-[#3E3025] rounded-xl p-2 text-sm font-metric font-bold text-[#F7F2EB]" />
            </div>
            <div>
              <label className="text-[11px] text-[#A8988B] block mb-1">{t.time} (s)</label>
              <input type="number" value={time} onChange={e => setTime(parseInt(e.target.value, 10))} className="w-full bg-[#1C1713] border border-[#3E3025] rounded-xl p-2 text-sm font-metric font-bold text-[#F7F2EB]" />
            </div>
            <div>
              <label className="text-[11px] text-[#A8988B] block mb-1">{t.dose} (g)</label>
              <input type="number" step="0.1" value={dose} onChange={e => setDose(parseFloat(e.target.value))} className="w-full bg-[#1C1713] border border-[#3E3025] rounded-xl p-2 text-sm font-metric font-bold text-[#F7F2EB]" />
            </div>
            <div>
              <label className="text-[11px] text-[#A8988B] block mb-1">{t.yield} (g)</label>
              <input type="number" step="0.5" value={actualYield} onChange={e => setActualYield(parseFloat(e.target.value))} className="w-full bg-[#1C1713] border border-[#3E3025] rounded-xl p-2 text-sm font-metric font-bold text-[#F7F2EB]" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#F7F2EB] block mb-2 font-serif">
              {t.tasteEvaluation}
            </label>
            <div className="space-y-2">
              {options.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTaste(opt.id)}
                  className={`w-full text-left text-xs p-3 rounded-xl border flex items-center justify-between transition-colors ${
                    taste === opt.id
                      ? `bg-[#291F18] ${opt.tone} ring-1 ring-current font-medium`
                      : 'bg-[#120F0D] border-[#30261E] text-[#A8988B]'
                  }`}
                >
                  <span>{opt.label}</span>
                  {taste === opt.id && <Check className="w-4 h-4 flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] text-[#A8988B] block mb-1">Notas adicionales</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ej. muy dulce, acidez sedosa..."
              className="w-full bg-[#120F0D] border border-[#30261E] rounded-xl p-2.5 text-xs text-[#F7F2EB] outline-none"
            />
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-red-950/70 border border-red-800 text-red-300 text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#D96B27] hover:bg-[#E29D52] text-[#141210] font-bold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#D96B27]/20"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t.saveFeedback}
          </button>
        </form>
      </div>
    </div>
  );
};
