export type Language = 'en' | 'es';

export interface Translations {
  appName: string;
  tagline: string;
  gearSetup: string;
  activeBeans: string;
  addCoffee: string;
  addCoffeeUrlPlaceholder: string;
  addCoffeeSubmit: string;
  analyzingRoaster: string;
  activeStash: string;
  history: string;
  markFinished: string;
  grindSetting: string;
  temperature: string;
  dose: string;
  yield: string;
  ratio: string;
  time: string;
  restDays: string;
  daysRestOptimal: string;
  readyToBrew: string;
  restingRemaining: string;
  pullShotAndDialIn: string;
  logExtractionFeedback: string;
  tasteEvaluation: string;
  balancedGodShot: string;
  sourUnderExtracted: string;
  bitterOverExtracted: string;
  channeled: string;
  saveFeedback: string;
  feedbackSaved: string;
  origin: string;
  variety: string;
  process: string;
  roastLevel: string;
  tastingNotes: string[];
  temperaturePresets: {
    low: string;
    normal: string;
    high: string;
    very_high: string;
  };
  sampleUrlsLabel: string;
}
