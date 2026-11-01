'use client';

import React from 'react';
import { SageTemperatureSetting } from '@/core/domain/equipment/EspressoMachine';
import { useTranslation } from '../i18n/LanguageContext';
import { Flame } from 'lucide-react';

interface SageTempSelectorProps {
  currentTemp: SageTemperatureSetting;
}

export const SageTempSelector: React.FC<SageTempSelectorProps> = ({ currentTemp }) => {
  const { t } = useTranslation();

  const presets: { id: SageTemperatureSetting; temp: string; level: number }[] = [
    { id: 'low', temp: '90°C', level: 1 },
    { id: 'normal', temp: '93°C', level: 2 },
    { id: 'high', temp: '95°C', level: 3 },
    { id: 'very_high', temp: '96°C', level: 4 },
  ];

  return (
    <div className="bg-[#161311] border border-[#382F28] rounded-2xl p-3.5">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[11px] font-medium tracking-wide uppercase text-[#A8988B] flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-[#E29D52]" />
          {t.temperature}
        </span>
        <span className="text-[10px] text-[#A8988B] font-metric">
          ThermoJet PID
        </span>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {presets.map(p => {
          const isActive = currentTemp === p.id;
          return (
            <div
              key={p.id}
              className={`p-2 rounded-xl text-center border transition-all ${
                isActive
                  ? 'bg-gradient-to-b from-[#2B1F17] to-[#1C140F] border-[#D96B27] text-[#F7F2EB] shadow-md shadow-[#D96B27]/20 ring-1 ring-[#D96B27]/60'
                  : 'bg-[#12100E] border-[#2C241E] text-[#8A7A6D] opacity-60'
              }`}
            >
              <span className="text-[10px] font-bold block truncate capitalize">
                {t.temperaturePresets[p.id].split(' ')[0]}
              </span>
              <span className="text-[11px] font-metric font-semibold text-[#E29D52] block mt-0.5">
                {p.temp}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
