import { Grinder } from '@/domain/equipment/Grinder';
import { EspressoMachine, SAGE_TEMPERATURE_SCALE } from '@/domain/equipment/EspressoMachine';
import { EquipmentRepositoryPort } from '@/application/ports/out/EquipmentRepositoryPort';

export const PRESET_GRINDERS: Grinder[] = [
  { id: 'df64-gen-2', brand: 'DF64', model: 'Gen 2', burrSizeMm: 64, burrType: 'flat', minDial: 0, maxDial: 90, defaultEspressoBaseline: 12.0 },
  { id: 'kingrinder-k6', brand: 'KINGrinder', model: 'K6', burrSizeMm: 48, burrType: 'conical', minDial: 0, maxDial: 180, defaultEspressoBaseline: 35.0 },
  { id: 'comandante-c40', brand: 'Comandante', model: 'C40 MK4', burrSizeMm: 39, burrType: 'conical', minDial: 0, maxDial: 40, defaultEspressoBaseline: 11.0 },
  { id: 'niche-zero', brand: 'Niche', model: 'Zero', burrSizeMm: 63, burrType: 'conical', minDial: 0, maxDial: 50, defaultEspressoBaseline: 15.0 },
  { id: 'eureka-mignon', brand: 'Eureka', model: 'Mignon Specialità', burrSizeMm: 55, burrType: 'flat', minDial: 0, maxDial: 6, defaultEspressoBaseline: 1.5 },
  { id: 'baratza-encore-esp', brand: 'Baratza', model: 'Encore ESP', burrSizeMm: 40, burrType: 'conical', minDial: 1, maxDial: 40, defaultEspressoBaseline: 15.0 },
];

export const PRESET_MACHINES: EspressoMachine[] = [
  { id: 'sage-barista-touch-impress', brand: 'Sage', model: 'Barista Touch Impress', portafilterSizeMm: 54, standardDoseGrams: 18.0, availableTemperatures: SAGE_TEMPERATURE_SCALE },
  { id: 'casabrews-cm5418', brand: 'Casabrews', model: 'CM5418', portafilterSizeMm: 51, standardDoseGrams: 14.5, availableTemperatures: ['normal'] },
  { id: 'gaggia-classic-pro', brand: 'Gaggia', model: 'Classic Pro', portafilterSizeMm: 58, standardDoseGrams: 18.0, availableTemperatures: ['normal'] },
  { id: 'sage-bambino-plus', brand: 'Sage', model: 'Bambino Plus', portafilterSizeMm: 54, standardDoseGrams: 18.0, availableTemperatures: ['normal'] },
  { id: 'la-marzocco-micra', brand: 'La Marzocco', model: 'Linea Micra', portafilterSizeMm: 58, standardDoseGrams: 18.0, availableTemperatures: SAGE_TEMPERATURE_SCALE },
  { id: 'delonghi-dedica', brand: 'DeLonghi', model: 'Dedica EC685', portafilterSizeMm: 51, standardDoseGrams: 14.5, availableTemperatures: ['cold_2', 'normal', 'hot_2'] },
];

export class EquipmentCatalogRepository implements EquipmentRepositoryPort {
  private grinders: Map<string, Grinder> = new Map();
  private machines: Map<string, EspressoMachine> = new Map();

  constructor(grinders: Grinder[] = PRESET_GRINDERS, machines: EspressoMachine[] = PRESET_MACHINES) {
    for (const g of grinders) this.grinders.set(g.id, g);
    for (const m of machines) this.machines.set(m.id, m);
  }

  async findAllGrinders(): Promise<Grinder[]> {
    return Array.from(this.grinders.values());
  }

  async findGrinderById(id: string): Promise<Grinder | null> {
    return this.grinders.get(id) || null;
  }

  async findAllMachines(): Promise<EspressoMachine[]> {
    return Array.from(this.machines.values());
  }

  async findMachineById(id: string): Promise<EspressoMachine | null> {
    return this.machines.get(id) || null;
  }

  async saveGrinder(grinder: Grinder): Promise<void> {
    this.grinders.set(grinder.id, grinder);
  }

  async saveMachine(machine: EspressoMachine): Promise<void> {
    this.machines.set(machine.id, machine);
  }
}

export function findPresetGrinderById(id?: string): Grinder {
  return PRESET_GRINDERS.find((g) => g.id === id) || PRESET_GRINDERS[0];
}

export function findPresetMachineById(id?: string): EspressoMachine {
  return PRESET_MACHINES.find((m) => m.id === id) || PRESET_MACHINES[0];
}
