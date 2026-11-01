export interface Grinder {
  readonly id: string;
  readonly brand: string;
  readonly model: string;
  readonly burrSizeMm: number;
  readonly burrType: 'flat' | 'conical';
  readonly minDial: number;
  readonly maxDial: number;
  readonly defaultEspressoBaseline: number;
}

export const DF64_GEN_2: Grinder = {
  id: 'df64-gen-2',
  brand: 'DF64',
  model: 'Gen 2',
  burrSizeMm: 64,
  burrType: 'flat',
  minDial: 0,
  maxDial: 90,
  defaultEspressoBaseline: 16.0,
};
