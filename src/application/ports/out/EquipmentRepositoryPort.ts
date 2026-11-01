import { Grinder } from '@/domain/equipment/Grinder';
import { EspressoMachine } from '@/domain/equipment/EspressoMachine';

export interface EquipmentRepositoryPort {
  findAllGrinders(): Promise<Grinder[]>;
  findGrinderById(id: string): Promise<Grinder | null>;
  findAllMachines(): Promise<EspressoMachine[]>;
  findMachineById(id: string): Promise<EspressoMachine | null>;
  saveGrinder(grinder: Grinder): Promise<void>;
  saveMachine(machine: EspressoMachine): Promise<void>;
}
