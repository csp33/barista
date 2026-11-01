'use client';

import React, { useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { StashItemDTO } from '@/core/application/usecases/GetCoffeeStashUseCase';
import { TasteProfile } from '@/core/domain/recipe/ExtractionFeedback';
import { X, Check, AlertCircle, Sparkles, Loader2 } from 'lucide-react';

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

  const [grind, setGrind] = useState(recipe?.grindSetting ?? 16);
  const [dose, setDose] = useState(recipe?.doseGrams ?? 18);
  const [actualYield, setActualYield] = useState(recipe?.yieldGrams ?? 38);
  const [time, setTime] = useState(28);
  const [taste, setTaste] = useState<TasteProfile>('balanced');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !recipe) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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

      if (!res.ok) throw new Error('Feedback submission failed');

      onSuccess();
      onClose();
    } catch {
      alert('Could not record feedback');
    } finally {
      setLoading(false);
    }
  };

  const options: { id: TasteProfile; label: string; tone: string }[] = [
    { id: 'balanced', label: t.balancedGodShot, tone: 'border-[#4E8765] text-[#4E8765]' },
    { id: 'sour', label: t.sourUnderExtracted, tone: 'border-amber-500 text-amber-400' },
    { id: 'bitter', label: t.bitterOverExtracted, tone: 'border-orange-500 text-orange-400' },
    { id: 'channeled', label: t.channeled, tone: 'border-red-500 text-red-400' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#181512] border border-[#2C2621] w-full max-w-md rounded-3xl p-5 shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#9E9288] hover:text-[#F5EFEB] rounded-full bg-[#12100E] border border-[#2C2621]"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="font-bold text-base text-[#F5EFEB] mb-1">
          {t.logExtractionFeedback}
        </h3>
        <p className="text-xs text-[#9E9288] mb-4">
          {item.coffee.roaster} - {item.coffee.name}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Actual Extraction Numbers Grid */}
          <div className="grid grid-cols-2 gap-3 bg-[#12100E] p-3 rounded-2xl border border-[#2C2621]">
            <div>
              <label className="text-[11px] text-[#9E9288] block mb-1">
                {t.grindSetting}
              </label>
              <input
                type="number"
                step="0.5"
                value={grind}
                onChange={e => setGrind(parseFloat(e.target.value))}
                className="w-full bg-[#181512] border border-[#2C2621] rounded-lg p-2 text-sm font-metric font-bold text-[#F5EFEB]"
              />
            </div>
            <div>
              <label className="text-[11px] text-[#9E9288] block mb-1">
                {t.time} (s)
              </label>
              <input
                type="number"
                value={time}
                onChange={e => setTime(parseInt(e.target.value, 10))}
                className="w-full bg-[#181512] border border-[#2C2621] rounded-lg p-2 text-sm font-metric font-bold text-[#F5EFEB]"
              />
            </div>
            <div>
              <label className="text-[11px] text-[#9E9288] block mb-1">
                {t.dose} (g)
              </label>
              <input
                type="number"
                step="0.1"
                value={dose}
                onChange={e => setDose(parseFloat(e.target.value))}
                className="w-full bg-[#181512] border border-[#2C2621] rounded-lg p-2 text-sm font-metric font-bold text-[#F5EFEB]"
              />
            </div>
            <div>
              <label className="text-[11px] text-[#9E9288] block mb-1">
                {t.yield} (g)
              </label>
              <input
                type="number"
                step="0.5"
                value={actualYield}
                onChange={e => setActualYield(parseFloat(e.target.value))}
                className="w-full bg-[#181512] border border-[#2C2621] rounded-lg p-2 text-sm font-metric font-bold text-[#F5EFEB]"
              />
            </div>
          </div>

          {/* Taste Evaluation */}
          <div>
            <label className="text-xs font-semibold text-[#F5EFEB] block mb-2">
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
                      ? `bg-[#221E19] ${opt.tone} ring-1 ring-current`
                      : 'bg-[#12100E] border-[#2C2621] text-[#9E9288]'
                  }`}
                >
                  <span>{opt.label}</span>
                  {taste === opt.id && <Check className="w-4 h-4 flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#D96B27] hover:bg-[#E29D52] text-[#12100E] font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t.saveFeedback}
          </button>
        </form>
      </div>
    </div>
  );
};
