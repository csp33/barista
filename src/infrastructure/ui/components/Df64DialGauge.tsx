'use client';

import React from 'react';
import { Grinder } from '@/core/domain/equipment/Grinder';
import { useTranslation } from '../i18n/LanguageContext';

interface Df64DialGaugeProps {
  setting: number;
  grinder?: Grinder;
}

export const Df64DialGauge: React.FC<Df64DialGaugeProps> = ({ setting, grinder }) => {
  const { language } = useTranslation();
  const minDial = grinder?.minDial ?? 0;
  const maxDial = grinder?.maxDial ?? 90;
  const range = maxDial - minDial || 1;
  const clampedSetting = Math.max(minDial, Math.min(maxDial, setting));
  const angle = -120 + ((clampedSetting - minDial) / range) * 240;
  const baseline = grinder?.defaultEspressoBaseline ?? 15;

  const ticks = Array.from({ length: 11 }, (_, i) => minDial + (i * range) / 10);

  return (
    <div className="flex flex-col items-center py-2">
      <div className="relative w-44 h-44 flex items-center justify-center">
        {/* Outer machined aluminum ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#443B33] via-[#241F1A] to-[#12100E] border-2 border-[#5C4F44] shadow-2xl flex items-center justify-center">
          <div className="absolute inset-1.5 rounded-full border border-[#3E342B] opacity-70" />
        </div>

        {/* Dial Scale Tick Marks */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 176 176">
          {ticks.map((val, idx) => {
            const tickAngle = -120 + ((val - minDial) / range) * 240;
            const rad = ((tickAngle - 90) * Math.PI) / 180;
            const x1 = 88 + 66 * Math.cos(rad);
            const y1 = 88 + 66 * Math.sin(rad);
            const x2 = 88 + 76 * Math.cos(rad);
            const y2 = 88 + 76 * Math.sin(rad);

            return (
              <g key={idx}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={val <= baseline * 1.25 ? '#D96B27' : '#8A7A6D'}
                  strokeWidth={idx % 2 === 0 ? '2.5' : '1.5'}
                />
              </g>
            );
          })}
        </svg>

        {/* Inner Hub with Setting Value */}
        <div className="relative z-10 w-28 h-28 rounded-full bg-gradient-to-b from-[#1C1713] to-[#120F0D] border border-[#483B31] shadow-2xl flex flex-col items-center justify-center text-center">
          <span className="text-[10px] tracking-widest uppercase font-metric text-[#8C7B6E] font-semibold">
            {language === 'es' ? 'PUNTO' : 'SETTING'}
          </span>
          <span className="text-3xl font-black font-metric tracking-tight text-[#F7F2EB] my-0.5">
            #{setting.toFixed(1)}
          </span>
          <span className="text-[9px] text-[#E29D52] uppercase tracking-wider font-metric">
            Espresso
          </span>
        </div>

        {/* Rotating Needle indicator */}
        <div
          className="absolute w-full h-full pointer-events-none transition-transform duration-700 ease-out"
          style={{ transform: `rotate(${angle}deg)` }}
        >
          <div className="w-2 h-5 bg-[#D96B27] rounded-full mx-auto mt-1 shadow-md shadow-[#D96B27]/80 ring-1 ring-[#F7F2EB]/30" />
        </div>
      </div>
    </div>
  );
};
