'use client';

import React from 'react';

interface Df64DialGaugeProps {
  setting: number;
}

export const Df64DialGauge: React.FC<Df64DialGaugeProps> = ({ setting }) => {
  // DF64 scale is 0 to 90. Map setting to angle (-120deg to +120deg)
  const clampedSetting = Math.max(0, Math.min(90, setting));
  const angle = -120 + (clampedSetting / 90) * 240;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* Outer machined aluminum ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#3D352E] via-[#211C18] to-[#12100E] border-2 border-[#54483E] shadow-2xl flex items-center justify-center">
          {/* Subtle knurled collar texture */}
          <div className="absolute inset-1 rounded-full border border-[#382F28] opacity-60" />
        </div>

        {/* Dial Scale Tick Marks */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 144 144">
          {[0, 15, 30, 45, 60, 75, 90].map(val => {
            const tickAngle = -120 + (val / 90) * 240;
            const rad = ((tickAngle - 90) * Math.PI) / 180;
            const x1 = 72 + 54 * Math.cos(rad);
            const y1 = 72 + 54 * Math.sin(rad);
            const x2 = 72 + 62 * Math.cos(rad);
            const y2 = 72 + 62 * Math.sin(rad);

            return (
              <g key={val}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={val === 15 ? '#D96B27' : '#8A7A6D'}
                  strokeWidth={val % 30 === 0 ? '2' : '1'}
                />
              </g>
            );
          })}
        </svg>

        {/* Inner Hub with Setting Value */}
        <div className="relative z-10 w-24 h-24 rounded-full bg-[#161311] border border-[#42372E] shadow-inner flex flex-col items-center justify-center text-center">
          <span className="text-[10px] tracking-widest uppercase font-metric text-[#D96B27]">
            DF64 II
          </span>
          <span className="text-2xl font-black font-metric tracking-tight text-[#F7F2EB]">
            #{setting.toFixed(1)}
          </span>
          <span className="text-[9px] text-[#A8988B] uppercase tracking-wider">
            Micrometric
          </span>
        </div>

        {/* Rotating Needle indicator */}
        <div
          className="absolute w-full h-full pointer-events-none transition-transform duration-700 ease-out"
          style={{ transform: `rotate(${angle}deg)` }}
        >
          <div className="w-1.5 h-4 bg-[#D96B27] rounded-full mx-auto mt-1 shadow-sm shadow-[#D96B27]" />
        </div>
      </div>
    </div>
  );
};
