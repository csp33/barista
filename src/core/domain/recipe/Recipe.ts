import { SageTemperatureSetting } from '../equipment/EspressoMachine';

export interface AiRationale {
  grindWhy: string;
  tempWhy: string;
  ratioWhy: string;
  restWhy: string;
}

export interface RecipeProps {
  id: string;
  coffeeId: string;
  userId: string;
  grinderId: string;
  machineId: string;
  doseGrams: number;
  yieldGrams: number;
  ratio: string;
  grindSetting: number;
  machineTemperature: SageTemperatureSetting;
  targetTimeSeconds: number;
  recommendedRestDays: number;
  notes: string[];
  aiRationale?: AiRationale;
}

export class Recipe {
  readonly id: string;
  readonly coffeeId: string;
  readonly userId: string;
  readonly grinderId: string;
  readonly machineId: string;
  readonly doseGrams: number;
  readonly yieldGrams: number;
  readonly ratio: string;
  readonly grindSetting: number;
  readonly machineTemperature: SageTemperatureSetting;
  readonly targetTimeSeconds: number;
  readonly recommendedRestDays: number;
  readonly notes: string[];
  readonly aiRationale?: AiRationale;

  constructor(props: RecipeProps) {
    if (!props.userId || props.userId.trim().length === 0) {
      throw new Error('Recipe userId is required');
    }
    if (props.doseGrams <= 0) throw new Error('Dose must be greater than 0');
    if (props.yieldGrams <= 0) throw new Error('Yield must be greater than 0');

    this.id = props.id;
    this.coffeeId = props.coffeeId;
    this.userId = props.userId.trim();
    this.grinderId = props.grinderId;
    this.machineId = props.machineId;
    this.doseGrams = props.doseGrams;
    this.yieldGrams = props.yieldGrams;
    this.ratio = props.ratio;
    this.grindSetting = props.grindSetting;
    this.machineTemperature = props.machineTemperature;
    this.targetTimeSeconds = props.targetTimeSeconds;
    this.recommendedRestDays = props.recommendedRestDays;
    this.notes = props.notes;
    this.aiRationale = props.aiRationale;
  }
}
