'use client';

import React from 'react';
import { SageTemperatureSetting } from '@/core/domain/equipment/EspressoMachine';
import { useTranslation } from '../i18n/LanguageContext';
import { Thermometer } from 'lucide-react';

interface SageTempSelectorProps {
  currentTemp: SageTemperatureSetting;
}

export const SageTempSelector: React.FC<SageTempSelectorProps> = ({ currentTemp }) => {
  const { t } = useTranslation();

  const presets: { id: SageTemperatureSetting; label: string; temp: string }[] = [
    { id: 'low', label: t.temperaturePresets.low.split('(')[0].trim(), temp: '90°C' },
    { id: 'normal', label: t.temperaturePresets.normal.split('(')[0].trim(), temp: '93°C' },
    { id: 'high', label: t.temperaturePresets.high.split('(')[0].trim(), temp: '95°C' },
    { id: 'very_high', label: t.temperaturePresets.very_high.split('(')[0].trim(), temp: '96°C' },
  ];

  return (
    <div className="bg-[#120F0D] border border-[#2F241C] rounded-2xl p-3.5 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium tracking-wide uppercase text-[#A8988B] flex items-center gap-1.5 font-metric">
          <Thermometer className="w-3.5 h-3.5 text-[#E29D52]" />
          {t.temperature}
        </span>
        <span className="text-[10px] text-[#D96B27] font-metric bg-[#241A14] px-2 py-0.5 rounded-full border border-[#3D2B20]">
          ThermoJet PID
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {presets.map(p => {
          const isActive = currentTemp === p.id;
          return (
            <div
              key={p.id}
              className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-[#382318] to-[#22160F] border-[#D96B27] text-[#F7F2EB] shadow-md shadow-[#D96B27]/25 ring-1 ring-[#D96B27]'
                  : 'bg-[#181411] border-[#30261E] text-[#B0A093]'
              }`}
            >
              <div className="flex items-center gap-1.5">
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#D96B27]" />}
                <span className={`text-xs font-bold capitalize ${isActive ? 'text-[#F7F2EB]' : 'text-[#C5B5A7]'}`}>
                  {p.label}
                </span>
              </div>
              <span className={`text-xs font-metric font-semibold ${isActive ? 'text-[#E29D52]' : 'text-[#8C7B6E]'}`}>
                {p.temp}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
