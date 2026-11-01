export type TasteProfile =
  | 'balanced'
  | 'sour'
  | 'bitter'
  | 'astringent'
  | 'weak'
  | 'channeled';

export interface ExtractionFeedbackProps {
  id: string;
  recipeId: string;
  actualGrindSetting: number;
  actualDoseGrams: number;
  actualYieldGrams: number;
  actualTimeSeconds: number;
  tasteProfile: TasteProfile;
  userNotes?: string;
  createdAt?: Date;
}

export class ExtractionFeedback {
  readonly id: string;
  readonly recipeId: string;
  readonly actualGrindSetting: number;
  readonly actualDoseGrams: number;
  readonly actualYieldGrams: number;
  readonly actualTimeSeconds: number;
  readonly tasteProfile: TasteProfile;
  readonly userNotes?: string;
  readonly createdAt: Date;

  constructor(props: ExtractionFeedbackProps) {
    this.id = props.id;
    this.recipeId = props.recipeId;
    this.actualGrindSetting = props.actualGrindSetting;
    this.actualDoseGrams = props.actualDoseGrams;
    this.actualYieldGrams = props.actualYieldGrams;
    this.actualTimeSeconds = props.actualTimeSeconds;
    this.tasteProfile = props.tasteProfile;
    this.userNotes = props.userNotes?.trim();
    this.createdAt = props.createdAt ?? new Date();
  }
}
