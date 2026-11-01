export type SageTemperatureSetting = 'low' | 'normal' | 'high' | 'very_high';

export interface EspressoMachine {
  readonly id: string;
  readonly brand: string;
  readonly model: string;
  readonly portafilterSizeMm: number;
  readonly standardDoseGrams: number;
  readonly availableTemperatures: SageTemperatureSetting[];
}
