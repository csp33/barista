import { CoffeeVisionScannerPort } from '@/application/ports/out/CoffeeVisionScannerPort';
import { ScrapedCoffeeData } from '@/application/ports/out/RoasterScraperPort';
import { Logger } from '../logger/Logger';

export class OpenAiVisionScannerAdapter implements CoffeeVisionScannerPort {
  private apiKey = process.env.OPENAI_API_KEY;

  async scanCoffeeBagImage(base64Image: string, mimeType: string = 'image/jpeg'): Promise<ScrapedCoffeeData> {
    Logger.info('AI_VISION', 'Scanning coffee bag image');

    if (!this.apiKey) {
      Logger.warn('AI_VISION', 'No OPENAI_API_KEY found, using local simulated OCR vision');
      return {
        roaster: 'Nomad Coffee',
        name: 'Kenya Nyeri Peaberry',
        originCountry: 'Kenya',
        altitudeMasl: 1850,
        variety: 'SL28, SL34',
        process: 'washed',
        roastLevel: 'light',
        tastingNotes: ['grosella negra', 'pomelo', 'ruibarbo'],
      };
    }

    try {
      const imageUrl = base64Image.startsWith('data:')
        ? base64Image
        : `data:${mimeType};base64,${base64Image}`;

      const prompt = `Extract specialty coffee details from this coffee bag label photo.
Respond ONLY with a JSON object:
{
  "roaster": string,
  "name": string,
  "originCountry": string,
  "altitudeMasl": number or null,
  "variety": string,
  "process": "washed" | "natural" | "honey" | "anaerobic" | "experimental" | "other",
  "roastLevel": "light" | "medium_light" | "medium" | "medium_dark" | "dark",
  "tastingNotes": string[]
}`;

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: imageUrl, detail: 'low' } },
              ],
            },
          ],
          response_format: { type: 'json_object' },
          max_tokens: 400,
        }),
        signal: AbortSignal.timeout(12000),
      });

      if (!res.ok) {
        throw new Error(`OpenAI API error ${res.status}`);
      }

      const json = await res.json();
      const parsed = JSON.parse(json.choices[0].message.content);
      return {
        roaster: parsed.roaster || 'Specialty Roaster',
        name: parsed.name || 'Single Origin Espresso',
        originCountry: parsed.originCountry || 'Specialty Origin',
        altitudeMasl: parsed.altitudeMasl || undefined,
        variety: parsed.variety || 'Arabica Microlot',
        process: parsed.process || 'washed',
        roastLevel: parsed.roastLevel || 'light',
        tastingNotes: Array.isArray(parsed.tastingNotes) ? parsed.tastingNotes : [],
      };
    } catch (err) {
      Logger.error('AI_VISION', 'Failed to scan image with OpenAI', err);
      throw err;
    }
  }
}
