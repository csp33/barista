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
  userId: string;
  actualGrindSetting: number;
  actualDoseGrams: number;
  actualYieldGrams: number;
  actualTimeSeconds: number;
  tasteProfile: TasteProfile;
  userNotes?: string;
  aiDiagnosis?: string;
  createdAt?: Date;
}

export class ExtractionFeedback {
  readonly id: string;
  readonly recipeId: string;
  readonly userId: string;
  readonly actualGrindSetting: number;
  readonly actualDoseGrams: number;
  readonly actualYieldGrams: number;
  readonly actualTimeSeconds: number;
  readonly tasteProfile: TasteProfile;
  readonly userNotes?: string;
  readonly aiDiagnosis?: string;
  readonly createdAt: Date;

  constructor(props: ExtractionFeedbackProps) {
    if (!props.userId || props.userId.trim().length === 0) {
      throw new Error('ExtractionFeedback userId is required');
    }

    this.id = props.id;
    this.recipeId = props.recipeId;
    this.userId = props.userId.trim();
    this.actualGrindSetting = props.actualGrindSetting;
    this.actualDoseGrams = props.actualDoseGrams;
    this.actualYieldGrams = props.actualYieldGrams;
    this.actualTimeSeconds = props.actualTimeSeconds;
    this.tasteProfile = props.tasteProfile;
    this.userNotes = props.userNotes?.trim();
    this.aiDiagnosis = props.aiDiagnosis?.trim();
    this.createdAt = props.createdAt ?? new Date();
  }
}
