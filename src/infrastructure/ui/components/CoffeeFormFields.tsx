'use client';

import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { CoffeeProcess, RoastLevel, CoffeeStatus } from '@/domain/coffee/Coffee';
import { ChevronDown } from 'lucide-react';

export interface CoffeeFormData {
  roaster: string;
  name: string;
  country: string;
  region: string;
  producer: string;
  altitude: string;
  variety: string;
  process: CoffeeProcess;
  roastLevel: RoastLevel;
  notesStr: string;
  restDays: string;
  imageUrl?: string;
  status: CoffeeStatus;
}

interface CoffeeFormFieldsProps {
  formData: CoffeeFormData;
  onChange: (fields: Partial<CoffeeFormData>) => void;
}

export const CoffeeFormFields: React.FC<CoffeeFormFieldsProps> = ({
  formData,
  onChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-3.5 text-xs">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-medium text-[#A8988B] block mb-1">
            {t.roaster}
          </label>
          <input
            type="text"
            value={formData.roaster}
            onChange={e => onChange({ roaster: e.target.value })}
            className="w-full bg-[#141210] border border-[#3D332A] rounded-xl px-3 py-2 text-[#F7F2EB] outline-none focus:border-[#D96B27]"
            required
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-[#A8988B] block mb-1">
            Café
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={e => onChange({ name: e.target.value })}
            className="w-full bg-[#141210] border border-[#3D332A] rounded-xl px-3 py-2 text-[#F7F2EB] outline-none focus:border-[#D96B27]"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-medium text-[#A8988B] block mb-1">
            {t.origin}
          </label>
          <input
            type="text"
            value={formData.country}
            onChange={e => onChange({ country: e.target.value })}
            className="w-full bg-[#141210] border border-[#3D332A] rounded-xl px-3 py-2 text-[#F7F2EB] outline-none focus:border-[#D96B27]"
            required
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-[#A8988B] block mb-1">
            {t.altitude}
          </label>
          <input
            type="number"
            value={formData.altitude}
            onChange={e => onChange({ altitude: e.target.value })}
            className="w-full bg-[#141210] border border-[#3D332A] rounded-xl px-3 py-2 text-[#F7F2EB] outline-none focus:border-[#D96B27]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-medium text-[#A8988B] block mb-1">
            {t.variety}
          </label>
          <input
            type="text"
            value={formData.variety}
            onChange={e => onChange({ variety: e.target.value })}
            className="w-full bg-[#141210] border border-[#3D332A] rounded-xl px-3 py-2 text-[#F7F2EB] outline-none focus:border-[#D96B27]"
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-[#A8988B] block mb-1">
            {t.process}
          </label>
          <div className="relative">
            <select
              value={formData.process}
              onChange={e => onChange({ process: e.target.value as CoffeeProcess })}
              className="w-full appearance-none bg-[#141210] border border-[#3D332A] rounded-xl pl-3 pr-8 py-2 text-[#F7F2EB] outline-none focus:border-[#D96B27] cursor-pointer"
            >
              {Object.entries(t.processes).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#A8988B] pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-medium text-[#A8988B] block mb-1">
            {t.roastLevel}
          </label>
          <div className="relative">
            <select
              value={formData.roastLevel}
              onChange={e => onChange({ roastLevel: e.target.value as RoastLevel })}
              className="w-full appearance-none bg-[#141210] border border-[#3D332A] rounded-xl pl-3 pr-8 py-2 text-[#F7F2EB] outline-none focus:border-[#D96B27] cursor-pointer"
            >
              {Object.entries(t.roasts).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#A8988B] pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>
        <div>
          <label className="text-[11px] font-medium text-[#A8988B] block mb-1">
            {t.restDays}
          </label>
          <input
            type="number"
            value={formData.restDays}
            onChange={e => onChange({ restDays: e.target.value })}
            className="w-full bg-[#141210] border border-[#3D332A] rounded-xl px-3 py-2 text-[#F7F2EB] outline-none focus:border-[#D96B27]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-medium text-[#A8988B] block mb-1">
            Estado
          </label>
          <div className="relative">
            <select
              value={formData.status}
              onChange={e => onChange({ status: e.target.value as CoffeeStatus })}
              className="w-full appearance-none bg-[#141210] border border-[#3D332A] rounded-xl pl-3 pr-8 py-2 text-[#F7F2EB] outline-none focus:border-[#D96B27] cursor-pointer"
            >
              <option value="active">En Uso (En Barra)</option>
              <option value="history">Historial (Bodega)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#A8988B] pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>
        <div>
          <label className="text-[11px] font-medium text-[#A8988B] block mb-1">
            Foto del Grano / Bolsa (URL)
          </label>
          <input
            type="url"
            value={formData.imageUrl || ''}
            onChange={e => onChange({ imageUrl: e.target.value })}
            placeholder="https://..."
            className="w-full bg-[#141210] border border-[#3D332A] rounded-xl px-3 py-2 text-[#F7F2EB] outline-none focus:border-[#D96B27]"
          />
        </div>
      </div>

      <div>
        <label className="text-[11px] font-medium text-[#A8988B] block mb-1">
          {t.tastingNotes} ({t.tastingNotesHint})
        </label>
        <input
          type="text"
          value={formData.notesStr}
          onChange={e => onChange({ notesStr: e.target.value })}
          className="w-full bg-[#141210] border border-[#3D332A] rounded-xl px-3 py-2 text-[#F7F2EB] outline-none focus:border-[#D96B27]"
        />
      </div>
    </div>
  );
};
