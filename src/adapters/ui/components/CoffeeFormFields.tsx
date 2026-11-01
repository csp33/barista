'use client';

import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { CoffeeProcess, RoastLevel } from '@/core/domain/coffee/Coffee';

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
          <select
            value={formData.process}
            onChange={e => onChange({ process: e.target.value as CoffeeProcess })}
            className="w-full bg-[#141210] border border-[#3D332A] rounded-xl px-3 py-2 text-[#F7F2EB] outline-none focus:border-[#D96B27]"
          >
            {Object.entries(t.processes).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-medium text-[#A8988B] block mb-1">
            {t.roastLevel}
          </label>
          <select
            value={formData.roastLevel}
            onChange={e => onChange({ roastLevel: e.target.value as RoastLevel })}
            className="w-full bg-[#141210] border border-[#3D332A] rounded-xl px-3 py-2 text-[#F7F2EB] outline-none focus:border-[#D96B27]"
          >
            {Object.entries(t.roasts).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
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
