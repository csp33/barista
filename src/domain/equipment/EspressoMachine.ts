export type SageTemperatureSetting =
  | 'cold_4'
  | 'cold_3'
  | 'cold_2'
  | 'cold_1'
  | 'normal'
  | 'hot_1'
  | 'hot_2'
  | 'hot_3'
  | 'hot_4';

export const SAGE_TEMPERATURE_SCALE: SageTemperatureSetting[] = [
  'cold_4',
  'cold_3',
  'cold_2',
  'cold_1',
  'normal',
  'hot_1',
  'hot_2',
  'hot_3',
  'hot_4',
];

export const SAGE_TEMPERATURE_CELSIUS: Record<SageTemperatureSetting, number> = {
  cold_4: 89,
  cold_3: 90,
  cold_2: 91,
  cold_1: 92,
  normal: 93,
  hot_1: 94,
  hot_2: 95,
  hot_3: 96,
  hot_4: 97,
};

const LEGACY_TEMP_MAP: Record<string, SageTemperatureSetting> = {
  low: 'cold_2',
  normal: 'normal',
  high: 'hot_2',
  very_high: 'hot_3',
};

export function normalizeTemperatureSetting(value?: string): SageTemperatureSetting {
  if (!value) return 'normal';
  if ((SAGE_TEMPERATURE_SCALE as string[]).includes(value)) {
    return value as SageTemperatureSetting;
  }
  return LEGACY_TEMP_MAP[value] ?? 'normal';
}

export function stepTemperature(
  current: SageTemperatureSetting,
  delta: number,
  available: SageTemperatureSetting[] = SAGE_TEMPERATURE_SCALE
): SageTemperatureSetting {
  const scale = available.length > 0 ? available : SAGE_TEMPERATURE_SCALE;
  const normalized = normalizeTemperatureSetting(current);
  const idx = scale.indexOf(normalized);
  if (idx === -1) {
    const fullIdx = SAGE_TEMPERATURE_SCALE.indexOf(normalized);
    const nextFullIdx = Math.max(0, Math.min(SAGE_TEMPERATURE_SCALE.length - 1, fullIdx + delta));
    return SAGE_TEMPERATURE_SCALE[nextFullIdx];
  }
  const nextIdx = Math.max(0, Math.min(scale.length - 1, idx + delta));
  return scale[nextIdx];
}

export interface EspressoMachine {
  readonly id: string;
  readonly brand: string;
  readonly model: string;
  readonly portafilterSizeMm: number;
  readonly standardDoseGrams: number;
  readonly availableTemperatures: SageTemperatureSetting[];
}
