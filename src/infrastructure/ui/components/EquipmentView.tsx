'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useUserProfile } from '../context/UserProfileContext';
import {
  PRESET_GRINDERS,
  findPresetGrinderById,
  findPresetMachineById,
} from '@/infrastructure/equipment/EquipmentCatalogRepository';
import { Compass, Check, RefreshCw } from 'lucide-react';
import { MachineGearCard } from './MachineGearCard';

interface EquipmentViewProps {
  onEquipmentSaved?: () => void;
}

export const EquipmentView: React.FC<EquipmentViewProps> = ({ onEquipmentSaved }) => {
  const { language } = useTranslation();
  const { activeProfile, updateEquipment } = useUserProfile();
  const isEs = language === 'es';

  const [selectedGrinderId, setSelectedGrinderId] = useState(
    activeProfile?.grinderId || 'df64-gen-2'
  );
  const [selectedMachineId, setSelectedMachineId] = useState(
    activeProfile?.machineId || 'sage-barista-touch-impress'
  );
  const [selectedDoseGrams, setSelectedDoseGrams] = useState(
    activeProfile?.basketDoseGrams ?? findPresetMachineById(activeProfile?.machineId).standardDoseGrams
  );
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (activeProfile) {
      setSelectedGrinderId(activeProfile.grinderId);
      setSelectedMachineId(activeProfile.machineId);
      const m = findPresetMachineById(activeProfile.machineId);
      setSelectedDoseGrams(activeProfile.basketDoseGrams ?? m.standardDoseGrams);
    }
  }, [activeProfile]);

  const currentGrinder = findPresetGrinderById(selectedGrinderId);
  const currentMachine = findPresetMachineById(selectedMachineId);

  const handleMachineChange = (id: string) => {
    setSelectedMachineId(id);
    const m = findPresetMachineById(id);
    setSelectedDoseGrams(m.standardDoseGrams);
  };

  const handleSave = async () => {
    await updateEquipment(selectedGrinderId, selectedMachineId, selectedDoseGrams);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
    if (onEquipmentSaved) onEquipmentSaved();
  };

  const isChanged =
    selectedGrinderId !== activeProfile?.grinderId ||
    selectedMachineId !== activeProfile?.machineId ||
    selectedDoseGrams !== (activeProfile?.basketDoseGrams ?? currentMachine.standardDoseGrams);

  return (
    <div className="space-y-4 px-4 py-3 pb-24 max-w-md mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-serif text-xl font-bold text-[#F7F2EB]">
            {isEs ? `Setup de ${activeProfile?.name || 'Barista'}` : `${activeProfile?.name || 'Barista'}'s Gear`}
          </h2>
          <p className="text-xs text-[#A8988B] mt-0.5">
            {isEs
              ? 'Tus recetas y dial-in se calibran para tu combinación exacta.'
              : 'Your recipes and dial-in adapt to your exact hardware setup.'}
          </p>
        </div>
        {savedNotice && (
          <span className="flex items-center gap-1 text-[11px] font-metric text-[#71BC8E] bg-[#16291E] border border-[#244733] px-2.5 py-1 rounded-full">
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{isEs ? 'Guardado' : 'Saved'}</span>
          </span>
        )}
      </div>

      {/* Grinder Card */}
      <div className="bg-[#1A1512] border border-[#332820] rounded-2xl p-4 space-y-3 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#D96B27]/20 text-[#D96B27] flex items-center justify-center shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-metric uppercase text-[#E29D52]">
              {isEs ? 'Molinillo' : 'Grinder'}
            </span>
            <h3 className="font-serif font-bold text-sm text-[#F7F2EB]">
              {currentGrinder.brand} {currentGrinder.model}
            </h3>
          </div>
        </div>

        <div>
          <label className="text-[11px] text-[#8C7B6E] font-metric block mb-1">
            {isEs ? 'Seleccionar molinillo:' : 'Select grinder:'}
          </label>
          <select
            value={selectedGrinderId}
            onChange={(e) => setSelectedGrinderId(e.target.value)}
            className="w-full bg-[#120F0D] border border-[#332820] rounded-xl px-3 py-2 text-xs text-[#F7F2EB] focus:outline-none focus:border-[#D96B27]"
          >
            {PRESET_GRINDERS.map((g) => (
              <option key={g.id} value={g.id}>
                {g.brand} {g.model} ({g.burrSizeMm}mm {g.burrType})
              </option>
            ))}
          </select>
        </div>

        <div className="bg-[#120F0D] border border-[#2B211A] rounded-xl p-3 text-xs space-y-1.5 font-metric">
          <div className="flex justify-between">
            <span className="text-[#8C7B6E]">{isEs ? 'Tipo de Muelas:' : 'Burr Specs:'}</span>
            <span className="font-bold text-[#F7F2EB]">
              {currentGrinder.burrSizeMm}mm ({currentGrinder.burrType === 'flat' ? 'Planas' : 'Cónicas'})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8C7B6E]">{isEs ? 'Rango del Dial:' : 'Dial Scale:'}</span>
            <span className="font-bold text-[#D96B27]">{currentGrinder.minDial} – {currentGrinder.maxDial}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8C7B6E]">{isEs ? 'Punto de Partida Espresso:' : 'Espresso Baseline:'}</span>
            <span className="font-bold text-[#F7F2EB]">#{currentGrinder.defaultEspressoBaseline.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Machine Card with Custom Basket Dose */}
      <MachineGearCard
        machine={currentMachine}
        selectedMachineId={selectedMachineId}
        selectedDoseGrams={selectedDoseGrams}
        isEs={isEs}
        onMachineChange={handleMachineChange}
        onDoseChange={setSelectedDoseGrams}
      />

      {isChanged && (
        <button
          onClick={handleSave}
          className="w-full py-3 px-4 bg-[#D96B27] hover:bg-[#B35216] text-[#141210] font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-98 shadow-md shadow-[#D96B27]/20 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{isEs ? 'Guardar mi Setup y recalibrar' : 'Save My Setup & Recalibrate'}</span>
        </button>
      )}
    </div>
  );
};
