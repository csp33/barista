import { ScrapedCoffeeData } from '@/application/ports/out/RoasterScraperPort';

export class LlmParserAdapter {
  private openaiKey = process.env.OPENAI_API_KEY;

  async parse(html: string, url: string, fallback: ScrapedCoffeeData): Promise<ScrapedCoffeeData> {
    if (!this.openaiKey) {
      return fallback;
    }

    try {
      // Strip noisy script and style tags to minimize token payload
      const cleanText = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .substring(0, 4000);

      const prompt = `Extract specialty coffee specifications from this webpage text.
URL: ${url}
Text:
${cleanText}

Respond ONLY with a JSON object conforming to this schema:
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

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          temperature: 0.1,
        }),
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) return fallback;

      const data = await response.json();
      const parsed = JSON.parse(data.choices[0].message.content);

      return {
        roaster: parsed.roaster || fallback.roaster,
        name: parsed.name || fallback.name,
        originCountry: parsed.originCountry || fallback.originCountry,
        altitudeMasl: parsed.altitudeMasl ?? fallback.altitudeMasl,
        variety: parsed.variety || fallback.variety,
        process: parsed.process || fallback.process,
        roastLevel: parsed.roastLevel || fallback.roastLevel,
        tastingNotes: Array.isArray(parsed.tastingNotes) && parsed.tastingNotes.length > 0
          ? parsed.tastingNotes
          : fallback.tastingNotes,
        sourceUrl: url,
        imageUrl: fallback.imageUrl,
      };
    } catch {
      return fallback;
    }
  }
}
