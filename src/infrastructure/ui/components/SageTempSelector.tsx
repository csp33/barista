'use client';

import React from 'react';
import { EspressoMachine, SageTemperatureSetting } from '@/core/domain/equipment/EspressoMachine';
import { useTranslation } from '../i18n/LanguageContext';
import { Thermometer } from 'lucide-react';

interface SageTempSelectorProps {
  currentTemp: SageTemperatureSetting;
  machine?: EspressoMachine;
}

export const SageTempSelector: React.FC<SageTempSelectorProps> = ({ currentTemp, machine }) => {
  const { t } = useTranslation();

  const allPresets: { id: SageTemperatureSetting; label: string; temp: string }[] = [
    { id: 'low', label: t.temperaturePresets.low.split('(')[0].trim(), temp: '90°C' },
    { id: 'normal', label: t.temperaturePresets.normal.split('(')[0].trim(), temp: '93°C' },
    { id: 'high', label: t.temperaturePresets.high.split('(')[0].trim(), temp: '95°C' },
    { id: 'very_high', label: t.temperaturePresets.very_high.split('(')[0].trim(), temp: '96°C' },
  ];

  const presets = machine
    ? allPresets.filter(p => machine.availableTemperatures.includes(p.id))
    : allPresets;

  const machineLabel = machine ? `${machine.brand} ${machine.model}` : '';

  return (
    <div className="bg-[#120F0D] border border-[#2F241C] rounded-2xl p-3.5 space-y-2.5">
      <div className="w-full mb-1 px-1">
        <span className="text-[11px] font-metric font-semibold uppercase tracking-wider text-[#E29D52] flex items-center gap-1.5">
          <Thermometer className="w-3.5 h-3.5 text-[#E29D52]" />
          {t.temperature}{machineLabel ? ` • ${machineLabel}` : ''}
        </span>
      </div>

      <div className={`grid gap-2.5 ${presets.length <= 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {presets.map(p => {
          const isActive = currentTemp === p.id;
          return (
            <div
              key={p.id}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-1 transition-all ${
                isActive
                  ? 'bg-gradient-to-b from-[#382318] to-[#22160F] border-[#D96B27] text-[#F7F2EB] shadow-md shadow-[#D96B27]/25 ring-1 ring-[#D96B27]'
                  : 'bg-[#181411] border-[#30261E] text-[#B0A093] hover:border-[#443528]'
              }`}
            >
              <div className="flex items-center gap-1.5">
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#D96B27]" />}
                <span className={`text-xs font-bold ${isActive ? 'text-[#F7F2EB]' : 'text-[#C5B5A7]'}`}>
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
