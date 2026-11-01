import { CoffeeProps } from '@/core/domain/coffee/Coffee';

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
  sourceUrl: string;
  imageUrl?: string;
}

export interface RoasterScraperPort {
  scrapeCoffeeUrl(url: string): Promise<ScrapedCoffeeData>;
}
