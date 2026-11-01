import { CoffeeProps } from '@/domain/coffee/Coffee';
import { AiRationale } from '@/domain/recipe/Recipe';

export interface ScrapedCoffeeData {
  roaster: string;
  name: string;
  originCountry: string;
  region?: string;
  producer?: string;
  altitudeMasl?: number;
  variety: string;
  process: CoffeeProps['process'];
  roastLevel: CoffeeProps['roastLevel'];
  tastingNotes: string[];
  recommendedRestDays?: number;
  sourceUrl?: string;
  imageUrl?: string;
  sommelierStory?: string;
  aiRationale?: AiRationale;
}

export interface RoasterScraperPort {
  scrapeCoffeeUrl(url: string): Promise<ScrapedCoffeeData>;
}
