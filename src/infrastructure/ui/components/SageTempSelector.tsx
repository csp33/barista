'use client';

import React from 'react';
import {
  EspressoMachine,
  SAGE_TEMPERATURE_CELSIUS,
  SAGE_TEMPERATURE_SCALE,
  SageTemperatureSetting,
  normalizeTemperatureSetting,
} from '@/domain/equipment/EspressoMachine';
import { useTranslation } from '../i18n/LanguageContext';
import { Thermometer } from 'lucide-react';

interface SageTempSelectorProps {
  currentTemp: SageTemperatureSetting;
  machine?: EspressoMachine;
  onChange?: (temp: SageTemperatureSetting) => void;
  compact?: boolean;
}

const SHORT_LABELS: Record<SageTemperatureSetting, string> = {
  cold_4: 'F4',
  cold_3: 'F3',
  cold_2: 'F2',
  cold_1: 'F1',
  normal: 'N',
  hot_1: 'C1',
  hot_2: 'C2',
  hot_3: 'C3',
  hot_4: 'C4',
};

const SHORT_LABELS_EN: Record<SageTemperatureSetting, string> = {
  cold_4: 'C4',
  cold_3: 'C3',
  cold_2: 'C2',
  cold_1: 'C1',
  normal: 'N',
  hot_1: 'H1',
  hot_2: 'H2',
  hot_3: 'H3',
  hot_4: 'H4',
};

export const SageTempSelector: React.FC<SageTempSelectorProps> = ({
  currentTemp,
  machine,
  onChange,
  compact = false,
}) => {
  const { t, language } = useTranslation();
  const normalizedCurrent = normalizeTemperatureSetting(currentTemp);
  const shortMap = language === 'es' ? SHORT_LABELS : SHORT_LABELS_EN;

  const allPresets = SAGE_TEMPERATURE_SCALE.map(id => ({
    id,
    short: shortMap[id],
    label: t.temperaturePresets[id].split('(')[0].trim(),
    fullLabel: t.temperaturePresets[id],
    temp: `${SAGE_TEMPERATURE_CELSIUS[id]}°C`,
  }));

  const presets =
    machine && machine.availableTemperatures.length > 0
      ? allPresets.filter(p => machine.availableTemperatures.includes(p.id))
      : allPresets;

  const activePreset =
    allPresets.find(p => p.id === normalizedCurrent) ||
    allPresets.find(p => p.id === 'normal')!;

  const machineLabel = machine && !compact ? `${machine.brand} ${machine.model}` : '';

  return (
    <div className="bg-[#120F0D] border border-[#2F241C] rounded-2xl p-3.5 space-y-2.5">
      <div className="flex items-center justify-between gap-2 px-0.5">
        <span className="text-[11px] font-metric font-semibold uppercase tracking-wider text-[#E29D52] flex items-center gap-1.5">
          <Thermometer className="w-3.5 h-3.5 text-[#E29D52]" />
          {t.temperature}
          {machineLabel ? ` • ${machineLabel}` : ''}
        </span>
        <span className="text-[11px] font-metric font-bold px-2.5 py-0.5 rounded-full bg-[#241A13] border border-[#D96B27]/50 text-[#F7F2EB]">
          {activePreset.label} • <span className="text-[#E29D52]">{activePreset.temp}</span>
        </span>
      </div>

      {presets.length > 3 ? (
        <div className="space-y-1.5">
          <div className="grid grid-cols-9 gap-1">
            {presets.map(p => {
              const isActive = normalizedCurrent === p.id;
              const isCold = p.id.startsWith('cold_');
              const isHot = p.id.startsWith('hot_');
              return (
                <button
                  key={p.id}
                  type="button"
                  disabled={!onChange}
                  onClick={() => onChange?.(p.id)}
                  title={p.fullLabel}
                  className={`py-2 px-0.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                    onChange ? 'cursor-pointer' : 'cursor-default'
                  } ${
                    isActive
                      ? 'bg-gradient-to-b from-[#382318] to-[#22160F] border-[#D96B27] text-[#F7F2EB] shadow-md shadow-[#D96B27]/25 ring-1 ring-[#D96B27]'
                      : isCold
                        ? 'bg-[#15181B] border-[#262E36] text-[#9BB0C4] hover:border-[#3A4754]'
                        : isHot
                          ? 'bg-[#1B1411] border-[#33241B] text-[#CFA382] hover:border-[#4A3326]'
                          : 'bg-[#181411] border-[#30261E] text-[#C5B5A7] hover:border-[#443528]'
                  }`}
                >
                  <span className={`text-[11px] font-metric font-bold leading-tight ${isActive ? 'text-[#F7F2EB]' : ''}`}>
                    {p.short}
                  </span>
                  <span className={`text-[9px] font-metric leading-tight mt-0.5 ${isActive ? 'text-[#E29D52] font-semibold' : 'text-[#8C7B6E]'}`}>
                    {SAGE_TEMPERATURE_CELSIUS[p.id]}°
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between text-[10px] font-metric text-[#8C7B6E] px-1">
            <span>{language === 'es' ? '← Frío (4 a 1)' : '← Cold (4 to 1)'}</span>
            <span>{language === 'es' ? 'Normal (93°C)' : 'Normal (93°C)'}</span>
            <span>{language === 'es' ? 'Caliente (1 a 4) →' : 'Hot (1 to 4) →'}</span>
          </div>
        </div>
      ) : (
        <div className={`grid gap-2 ${presets.length === 1 ? 'grid-cols-1' : 'grid-cols-3'}`}>
          {presets.map(p => {
            const isActive = normalizedCurrent === p.id;
            return (
              <button
                key={p.id}
                type="button"
                disabled={!onChange}
                onClick={() => onChange?.(p.id)}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center gap-0.5 transition-all ${
                  onChange ? 'cursor-pointer' : 'cursor-default'
                } ${
                  isActive
                    ? 'bg-gradient-to-b from-[#382318] to-[#22160F] border-[#D96B27] text-[#F7F2EB] ring-1 ring-[#D96B27]'
                    : 'bg-[#181411] border-[#30261E] text-[#B0A093]'
                }`}
              >
                <span className="text-xs font-bold">{p.label}</span>
                <span className="text-[11px] font-metric text-[#E29D52]">{p.temp}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
