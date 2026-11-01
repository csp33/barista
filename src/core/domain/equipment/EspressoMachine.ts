export type SageTemperatureSetting = 'low' | 'normal' | 'high' | 'very_high';

export interface EspressoMachine {
  readonly id: string;
  readonly brand: string;
  readonly model: string;
  readonly portafilterSizeMm: number;
  readonly standardDoseGrams: number;
  readonly availableTemperatures: SageTemperatureSetting[];
  readonly hasAssistedTamping: boolean;
}

export const SAGE_BARISTA_TOUCH_IMPRESS: EspressoMachine = {
  id: 'sage-barista-touch-impress',
  brand: 'Sage',
  model: 'Barista Touch Impress',
  portafilterSizeMm: 54,
  standardDoseGrams: 18.0,
  availableTemperatures: ['low', 'normal', 'high', 'very_high'],
  hasAssistedTamping: true,
};
