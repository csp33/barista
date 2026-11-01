import { ScrapedCoffeeData } from './RoasterScraperPort';

export interface CoffeeVisionScannerPort {
  scanCoffeeBagImage(base64Image: string, mimeType: string): Promise<ScrapedCoffeeData>;
}
