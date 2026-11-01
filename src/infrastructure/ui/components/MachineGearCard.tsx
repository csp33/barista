'use client';

import React from 'react';
import { EspressoMachine } from '@/domain/equipment/EspressoMachine';
import { PRESET_MACHINES } from '@/infrastructure/equipment/EquipmentCatalogRepository';
import { Thermometer } from 'lucide-react';

interface MachineGearCardProps {
  machine: EspressoMachine;
  selectedMachineId: string;
  selectedDoseGrams: number;
  isEs: boolean;
  onMachineChange: (id: string) => void;
  onDoseChange: (dose: number) => void;
}

export const MachineGearCard: React.FC<MachineGearCardProps> = ({
  machine,
  selectedMachineId,
  selectedDoseGrams,
  isEs,
  onMachineChange,
  onDoseChange,
}) => {
  return (
    <div className="bg-[#1A1512] border border-[#332820] rounded-2xl p-4 space-y-3 shadow-lg">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-[#E29D52]/20 text-[#E29D52] flex items-center justify-center shrink-0">
          <Thermometer className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[10px] font-metric uppercase text-[#E29D52]">
            {isEs ? 'Cafetera Espresso' : 'Espresso Machine'}
          </span>
          <h3 className="font-serif font-bold text-sm text-[#F7F2EB]">
            {machine.brand} {machine.model}
          </h3>
        </div>
      </div>

      <div>
        <label className="text-[11px] text-[#8C7B6E] font-metric block mb-1">
          {isEs ? 'Seleccionar cafetera:' : 'Select machine:'}
        </label>
        <select
          value={selectedMachineId}
          onChange={(e) => onMachineChange(e.target.value)}
          className="w-full bg-[#120F0D] border border-[#332820] rounded-xl px-3 py-2 text-xs text-[#F7F2EB] focus:outline-none focus:border-[#D96B27]"
        >
          {PRESET_MACHINES.map((m) => (
            <option key={m.id} value={m.id}>
              {m.brand} {m.model} ({m.portafilterSizeMm}mm)
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs font-metric">
        <div className="bg-[#120F0D] border border-[#2B211A] rounded-xl p-2.5">
          <span className="text-[10px] text-[#8C7B6E] block">{isEs ? 'Portafiltro' : 'Portafilter'}</span>
          <span className="font-bold text-[#F7F2EB]">{machine.portafilterSizeMm} mm</span>
        </div>
        <div className="bg-[#120F0D] border border-[#2B211A] rounded-xl p-2.5">
          <span className="text-[10px] text-[#8C7B6E] block">{isEs ? 'Cesta de Serie' : 'Stock Basket'}</span>
          <span className="font-bold text-[#8C7B6E]">{machine.standardDoseGrams} g</span>
        </div>
      </div>

      <div className="bg-[#120F0D] border border-[#2B211A] rounded-xl p-3 flex items-center justify-between font-metric">
        <div>
          <span className="text-[10px] uppercase text-[#E29D52] block font-bold">
            {isEs ? 'Capacidad de tu Cesta' : 'Your Basket Dose'}
          </span>
          <span className="text-[10px] text-[#8C7B6E]">
            {isEs ? 'Personaliza tus gramos exactos' : 'Custom dose for your basket'}
          </span>
        </div>
        <div className="flex items-center gap-2 bg-[#1A1512] border border-[#332820] rounded-lg px-2.5 py-1">
          <button
            type="button"
            onClick={() => onDoseChange(Math.max(12, Math.round((selectedDoseGrams - 0.5) * 10) / 10))}
            className="text-[#D96B27] hover:text-[#F7F2EB] text-sm font-bold px-1 transition-colors cursor-pointer"
            aria-label="Decrease dose"
          >
            –
          </button>
          <span className="font-bold text-sm text-[#F7F2EB] min-w-[3rem] text-center">
            {selectedDoseGrams.toFixed(1)}g
          </span>
          <button
            type="button"
            onClick={() => onDoseChange(Math.min(24, Math.round((selectedDoseGrams + 0.5) * 10) / 10))}
            className="text-[#D96B27] hover:text-[#F7F2EB] text-sm font-bold px-1 transition-colors cursor-pointer"
            aria-label="Increase dose"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};
