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
