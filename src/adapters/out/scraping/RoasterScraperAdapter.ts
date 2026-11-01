import {
  RoasterScraperPort,
  ScrapedCoffeeData,
} from '@/core/application/ports/out/RoasterScraperPort';
import { HeuristicParser } from './HeuristicParser';
import { LlmParserAdapter } from './LlmParserAdapter';

export class RoasterScraperAdapter implements RoasterScraperPort {
  private llmParser = new LlmParserAdapter();

  async scrapeCoffeeUrl(url: string): Promise<ScrapedCoffeeData> {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname.replace('www.', '');

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 BaristaBot/1.0',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(6000),
      });

      if (!response.ok) {
        return this.fallbackFromUrl(url, domain);
      }

      const html = await response.text();

      // Step 1: Deterministic extraction (Fast, Free, 0 token cost)
      const deterministicData = HeuristicParser.parse(html, url, domain);

      // If deterministic data is rich & complete, return immediately
      if (HeuristicParser.isComplete(deterministicData)) {
        return deterministicData;
      }

      // Step 2: Fallback to LLM agent if fields are missing or generic
      return await this.llmParser.parse(html, url, deterministicData);
    } catch {
      return this.fallbackFromUrl(url, domain);
    }
  }

  private fallbackFromUrl(url: string, domain: string): ScrapedCoffeeData {
    const roaster = domain.split('.')[0].toUpperCase();
    return {
      roaster,
      name: 'Specialty Selection',
      originCountry: 'Ethiopia',
      altitudeMasl: 1950,
      variety: 'Heirloom',
      process: 'washed',
      roastLevel: 'light',
      tastingNotes: ['floral', 'citrus', 'peach'],
      sourceUrl: url,
    };
  }
}
