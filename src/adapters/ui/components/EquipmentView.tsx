'use client';

import React from 'react';
import { Compass, Thermometer, ShieldCheck, Zap } from 'lucide-react';

export const EquipmentView: React.FC = () => {
  return (
    <div className="space-y-5 px-4 py-4 pb-24 max-w-md mx-auto">
      <div>
        <h2 className="font-serif text-xl font-bold text-[#F7F2EB]">
          Mi Configuración
        </h2>
        <p className="text-xs text-[#A8988B]">
          DF64 Gen II y Sage Barista Touch Impress
        </p>
      </div>

      {/* Grinder Card */}
      <div className="bg-[#1A1512] border border-[#332820] rounded-2xl p-4 space-y-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D96B27]/20 text-[#D96B27] flex items-center justify-center">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-metric uppercase text-[#E29D52]">Molino Monodosis</span>
            <h3 className="font-serif font-bold text-base text-[#F7F2EB]">DF64 Gen II</h3>
          </div>
        </div>

        <p className="text-xs text-[#C8B8AB] leading-relaxed">
          Muelas planas de 64mm con collarín micrométrico stepless (0–90). Retención cercana a cero con fuelle.
        </p>

        <div className="bg-[#120F0D] border border-[#2B211A] rounded-xl p-3 text-xs space-y-1.5 font-metric">
          <div className="flex justify-between">
            <span className="text-[#8C7B6E]">Rango Espresso Típico:</span>
            <span className="font-bold text-[#F7F2EB]">#5.0 – #15.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8C7B6E]">Monsooned Malabar:</span>
            <span className="font-bold text-[#D96B27]">#5.0 – #6.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8C7B6E]">Brasil Natural:</span>
            <span className="font-bold text-[#D96B27]">#11.0 – #14.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8C7B6E]">Etiopía / Lavado Claro:</span>
            <span className="font-bold text-[#D96B27]">#8.5 – #10.0</span>
          </div>
        </div>
      </div>

      {/* Machine Card */}
      <div className="bg-[#1A1512] border border-[#332820] rounded-2xl p-4 space-y-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E29D52]/20 text-[#E29D52] flex items-center justify-center">
            <Thermometer className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-metric uppercase text-[#E29D52]">Cafetera Espresso</span>
            <h3 className="font-serif font-bold text-base text-[#F7F2EB]">Sage Barista Touch Impress</h3>
          </div>
        </div>

        <p className="text-xs text-[#C8B8AB] leading-relaxed">
          Portafiltro de 54mm, sistema ThermoJet de calentamiento instantáneo (3s) y apisonado asistido Impress Puck System (10kg + giro 7°).
        </p>

        <div className="grid grid-cols-2 gap-2 text-xs font-metric">
          <div className="bg-[#120F0D] border border-[#2B211A] rounded-xl p-2.5">
            <span className="text-[10px] text-[#8C7B6E] block">Dosis Cesta Doble</span>
            <span className="font-bold text-[#F7F2EB]">18.0 gramos</span>
          </div>
          <div className="bg-[#120F0D] border border-[#2B211A] rounded-xl p-2.5">
            <span className="text-[10px] text-[#8C7B6E] block">Tiempo Objetivo</span>
            <span className="font-bold text-[#F7F2EB]">25 – 30 segundos</span>
          </div>
        </div>
      </div>

      {/* Pro Tips */}
      <div className="bg-[#16120F] border border-[#291F18] rounded-2xl p-4 space-y-2">
        <h4 className="font-serif font-bold text-sm text-[#F7F2EB] flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-[#D96B27]" />
          Consejo de Barista para Sage 54mm
        </h4>
        <p className="text-xs text-[#A8988B] leading-relaxed">
          Al usar el DF64 II para moler directamente en el portafiltro de 54mm, utiliza siempre una aguja WDT para desapelmazar y nivelar antes de activar la palanca de prensado asistido Impress.
        </p>
      </div>
    </div>
  );
};
