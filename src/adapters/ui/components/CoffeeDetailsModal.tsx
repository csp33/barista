'use client';

import React, { useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { Coffee } from '@/core/domain/coffee/Coffee';
import { CoffeeFormFields, CoffeeFormData } from './CoffeeFormFields';
import { X, Save, Edit3, Loader2 } from 'lucide-react';

interface CoffeeDetailsModalProps {
  isOpen: boolean;
  coffee: Coffee;
  onClose: () => void;
  onSuccess: () => void;
}

export const CoffeeDetailsModal: React.FC<CoffeeDetailsModalProps> = ({
  isOpen,
  coffee,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState<CoffeeFormData>({
    roaster: coffee.roaster,
    name: coffee.name,
    country: coffee.originCountry,
    region: coffee.region || '',
    producer: coffee.producer || '',
    altitude: coffee.altitudeMasl?.toString() || '',
    variety: coffee.variety,
    process: coffee.process,
    roastLevel: coffee.roastLevel,
    notesStr: coffee.tastingNotes.join(', '),
    restDays: coffee.recommendedRestDays.toString(),
  });

  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleChange = (fields: Partial<CoffeeFormData>) => {
    setFormData(prev => ({ ...prev, ...fields }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/coffees/${coffee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        }),
      });

      if (!res.ok) throw new Error('Update failed');
      onSuccess();
      onClose();
    } catch {
      alert('Error updating coffee');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1C1815] border border-[#3D332A] w-full max-w-lg rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-[#A8988B] hover:text-[#F7F2EB] rounded-full bg-[#141210] border border-[#3D332A]"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-xl bg-[#D96B27]/20 text-[#D96B27]">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-[#F7F2EB]">
              {t.editCoffeeSpecs}
            </h3>
            <p className="text-xs text-[#A8988B]">{t.editCoffee}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <CoffeeFormFields formData={formData} onChange={handleChange} />

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
              <span>{t.saveChanges}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
