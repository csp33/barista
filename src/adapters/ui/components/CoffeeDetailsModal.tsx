'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { Coffee, CoffeeProps } from '@/core/domain/coffee/Coffee';
import { CoffeeFormFields, CoffeeFormData } from './CoffeeFormFields';
import { X, Save, Edit3, Loader2, Sparkles } from 'lucide-react';

interface CoffeeDetailsModalProps {
  isOpen: boolean;
  coffee: Coffee | Partial<CoffeeProps>;
  isNew?: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CoffeeDetailsModal: React.FC<CoffeeDetailsModalProps> = ({
  isOpen,
  coffee,
  isNew = false,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState<CoffeeFormData>({
    roaster: coffee.roaster || '',
    name: coffee.name || '',
    country: coffee.originCountry || '',
    region: coffee.region || '',
    producer: coffee.producer || '',
    altitude: coffee.altitudeMasl?.toString() || '',
    variety: coffee.variety || '',
    process: coffee.process || 'washed',
    roastLevel: coffee.roastLevel || 'medium_light',
    notesStr: coffee.tastingNotes ? coffee.tastingNotes.join(', ') : '',
    restDays: coffee.recommendedRestDays ? coffee.recommendedRestDays.toString() : '14',
    imageUrl: coffee.imageUrl || '',
    status: coffee.status || 'active',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state whenever coffee changes
  useEffect(() => {
    setFormData({
      roaster: coffee.roaster || '',
      name: coffee.name || '',
      country: coffee.originCountry || '',
      region: coffee.region || '',
      producer: coffee.producer || '',
      altitude: coffee.altitudeMasl?.toString() || '',
      variety: coffee.variety || '',
      process: coffee.process || 'washed',
      roastLevel: coffee.roastLevel || 'medium_light',
      notesStr: coffee.tastingNotes ? coffee.tastingNotes.join(', ') : '',
      restDays: coffee.recommendedRestDays ? coffee.recommendedRestDays.toString() : '14',
      imageUrl: coffee.imageUrl || '',
      status: coffee.status || 'active',
    });
  }, [coffee]);

  if (!isOpen) return null;

  const handleChange = (fields: Partial<CoffeeFormData>) => {
    setFormData(prev => ({ ...prev, ...fields }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const coffeeProps = coffee as CoffeeProps & { aiRationale?: unknown };
    const payload = {
      roaster: formData.roaster,
      name: formData.name,
      originCountry: formData.country,
      region: formData.region || undefined,
      producer: formData.producer || undefined,
      altitudeMasl: formData.altitude ? parseInt(formData.altitude, 10) : undefined,
      variety: formData.variety,
      process: formData.process,
      roastLevel: formData.roastLevel,
      tastingNotes: formData.notesStr.split(',').map(s => s.trim()).filter(Boolean),
      recommendedRestDays: formData.restDays ? parseInt(formData.restDays, 10) : undefined,
      imageUrl: formData.imageUrl || undefined,
      status: formData.status,
      sourceUrl: coffeeProps.sourceUrl || undefined,
      sommelierStory: coffeeProps.sommelierStory || undefined,
      aiRationale: coffeeProps.aiRationale || undefined,
    };

    try {
      if (isNew) {
        const res = await fetch('/api/coffees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ manualData: payload }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || t.coffeeAlreadyExists);
        }
      } else {
        const res = await fetch(`/api/coffees/${(coffee as Coffee).id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || 'Update failed');
        }
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar datos del café');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#1C1815] border border-[#3D332A] w-full max-w-lg rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-[#A8988B] hover:text-[#F7F2EB] rounded-full bg-[#141210] border border-[#3D332A]"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-xl bg-[#D96B27]/20 text-[#D96B27]">
            {isNew ? <Sparkles className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-[#F7F2EB]">
              {isNew ? 'Revisar Datos Extraídos' : t.editCoffeeSpecs}
            </h3>
            <p className="text-xs text-[#A8988B]">
              {isNew ? 'Revisa y ajusta antes de guardar en tu barra' : t.editCoffee}
            </p>
          </div>
        </div>

        {(coffee as CoffeeProps).sommelierStory && (
          <div className="mb-4 bg-[#130F0D] border border-[#2E241D] border-l-2 border-l-[#D96B27] rounded-xl p-3 text-xs text-[#D8C7B9] leading-relaxed italic">
            <span className="font-serif not-italic font-bold text-[#E29D52] block text-[10px] uppercase tracking-wider mb-0.5 font-metric">
              Notas de Sommelier & Terroir (IA)
            </span>
            &ldquo;{(coffee as CoffeeProps).sommelierStory}&rdquo;
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <CoffeeFormFields formData={formData} onChange={handleChange} />

          {error && (
            <p className="text-xs text-red-400 bg-red-950/40 border border-red-800 p-2.5 rounded-xl">
              {error}
            </p>
          )}

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 bg-[#141210] hover:bg-[#26211C] border border-[#3D332A] text-[#A8988B] font-medium py-2.5 rounded-xl transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="w-2/3 bg-[#D96B27] hover:bg-[#E29D52] text-[#141210] font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-[#D96B27]/20"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isNew ? 'Confirmar y Guardar' : t.saveChanges}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
