'use client';

import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';

interface Df64DialGaugeProps {
  setting: number;
}

export const Df64DialGauge: React.FC<Df64DialGaugeProps> = ({ setting }) => {
  const { language } = useTranslation();
  const clampedSetting = Math.max(0, Math.min(90, setting));
  const angle = -120 + (clampedSetting / 90) * 240;

  return (
    <div className="flex flex-col items-center py-2">
      <div className="relative w-44 h-44 flex items-center justify-center">
        {/* Outer machined aluminum ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#443B33] via-[#241F1A] to-[#12100E] border-2 border-[#5C4F44] shadow-2xl flex items-center justify-center">
          <div className="absolute inset-1.5 rounded-full border border-[#3E342B] opacity-70" />
        </div>

        {/* Dial Scale Tick Marks */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 176 176">
          {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90].map(val => {
            const tickAngle = -120 + (val / 90) * 240;
            const rad = ((tickAngle - 90) * Math.PI) / 180;
            const x1 = 88 + 66 * Math.cos(rad);
            const y1 = 88 + 66 * Math.sin(rad);
            const x2 = 88 + 76 * Math.cos(rad);
            const y2 = 88 + 76 * Math.sin(rad);

            return (
              <g key={val}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={val <= 20 ? '#D96B27' : '#8A7A6D'}
                  strokeWidth={val % 30 === 0 ? '2.5' : '1.5'}
                />
              </g>
            );
          })}
        </svg>

        {/* Inner Hub with Setting Value */}
        <div className="relative z-10 w-28 h-28 rounded-full bg-gradient-to-b from-[#1C1713] to-[#120F0D] border border-[#483B31] shadow-2xl flex flex-col items-center justify-center text-center">
          <span className="text-[10px] tracking-widest uppercase font-metric text-[#D96B27] font-semibold">
            DF64 II
          </span>
          <span className="text-3xl font-black font-metric tracking-tight text-[#F7F2EB] my-0.5">
            #{setting.toFixed(1)}
          </span>
          <span className="text-[9px] text-[#A8988B] uppercase tracking-wider font-metric">
            Stepless 0–90
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
