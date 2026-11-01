export type CoffeeProcess =
  | 'washed'
  | 'natural'
  | 'honey'
  | 'anaerobic'
  | 'experimental'
  | 'other';

export type RoastLevel =
  | 'light'
  | 'medium_light'
  | 'medium'
  | 'medium_dark'
  | 'dark';

export type CoffeeStatus = 'active' | 'history';

export interface CoffeeProps {
  id: string;
  roaster: string;
  name: string;
  originCountry: string;
  region?: string;
  producer?: string;
  altitudeMasl?: number;
  variety: string;
  process: CoffeeProcess;
  roastLevel: RoastLevel;
  tastingNotes: string[];
  recommendedRestDays?: number;
  sourceUrl?: string;
  imageUrl?: string;
  status?: CoffeeStatus;
  sommelierStory?: string;
  createdAt?: Date;
}

export class Coffee {
  readonly id: string;
  readonly roaster: string;
  readonly name: string;
  readonly originCountry: string;
  readonly region?: string;
  readonly producer?: string;
  readonly altitudeMasl?: number;
  readonly variety: string;
  readonly process: CoffeeProcess;
  readonly roastLevel: RoastLevel;
  readonly tastingNotes: string[];
  readonly recommendedRestDays: number;
  readonly sourceUrl?: string;
  readonly imageUrl?: string;
  readonly status: CoffeeStatus;
  readonly sommelierStory?: string;
  readonly createdAt: Date;

  constructor(props: CoffeeProps) {
    if (!props.roaster || props.roaster.trim().length === 0) {
      throw new Error('Roaster name is required');
    }
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('Coffee name is required');
    }

    this.id = props.id;
    this.roaster = props.roaster.trim();
    this.name = props.name.trim();
    this.originCountry = props.originCountry.trim();
    this.region = props.region?.trim();
    this.producer = props.producer?.trim();
    this.altitudeMasl = props.altitudeMasl;
    this.variety = props.variety?.trim();
    this.process = props.process;
    this.roastLevel = props.roastLevel;
    this.tastingNotes = props.tastingNotes || [];
    this.recommendedRestDays =
      props.recommendedRestDays ?? this.calculateDefaultRestDays(props.roastLevel, props.process);
    this.sourceUrl = props.sourceUrl?.trim();
    this.imageUrl = props.imageUrl?.trim();
    this.status = props.status ?? 'active';
    this.sommelierStory = props.sommelierStory?.trim();
    this.createdAt = props.createdAt ?? new Date();
  }

  private calculateDefaultRestDays(roast: RoastLevel, process: CoffeeProcess): number {
    if (roast === 'light') return process === 'washed' ? 18 : 14;
    if (roast === 'medium_light') return 12;
    if (roast === 'medium') return 8;
    return 6;
  }
}
