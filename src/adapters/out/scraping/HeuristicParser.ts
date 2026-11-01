import { ScrapedCoffeeData } from '@/core/application/ports/out/RoasterScraperPort';
import { CoffeeProps } from '@/core/domain/coffee/Coffee';

export class HeuristicParser {
  static parse(html: string, url: string, domain: string): ScrapedCoffeeData {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const rawTitle = titleMatch ? titleMatch[1].trim() : '';

    const ogDescMatch = html.match(
      /<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i
    );
    const description = ogDescMatch ? ogDescMatch[1] : '';

    const roaster = this.detectRoaster(domain, rawTitle);
    const name = this.cleanCoffeeName(rawTitle, roaster);
    const fullText = `${rawTitle} ${description} ${html.substring(0, 6000)}`.toLowerCase();

    return {
      roaster,
      name,
      originCountry: this.detectCountry(fullText),
      altitudeMasl: this.detectAltitude(fullText),
      variety: this.detectVariety(fullText),
      process: this.detectProcess(fullText),
      roastLevel: this.detectRoastLevel(fullText),
      tastingNotes: this.detectTastingNotes(fullText),
      sourceUrl: url,
    };
  }

  static isComplete(data: ScrapedCoffeeData): boolean {
    return (
      data.name.length > 2 &&
      data.originCountry !== 'Specialty Origin' &&
      data.variety !== 'Arabica Microlot' &&
      data.tastingNotes.length >= 2 &&
      data.altitudeMasl !== undefined
    );
  }

  private static detectRoaster(domain: string, title: string): string {
    if (domain.includes('nomadcoffee')) return 'Nomad Coffee';
    if (domain.includes('sanjorge')) return 'San Jorge Coffee';
    if (domain.includes('holacoffee')) return 'Hola Coffee';
    if (domain.includes('rightside')) return 'Right Side Coffee';
    if (domain.includes('syra')) return 'Syra Coffee';

    const parts = title.split(/[-–|]/);
    if (parts.length > 1) return parts[parts.length - 1].trim();

    return domain.split('.')[0].toUpperCase();
  }

  private static cleanCoffeeName(title: string, roaster: string): string {
    return (
      title
        .replace(new RegExp(roaster, 'gi'), '')
        .replace(/[-–|].*$/, '')
        .replace(/café de especialidad|specialty coffee/gi, '')
        .trim() || 'Single Origin Espresso'
    );
  }

  private static detectCountry(text: string): string {
    const countries = [
      'ethiopia', 'colombia', 'kenya', 'guatemala', 'brazil',
      'costa rica', 'panama', 'rwanda', 'el salvador', 'honduras', 'peru'
    ];
    for (const c of countries) {
      if (text.includes(c)) {
        return c.charAt(0).toUpperCase() + c.slice(1);
      }
    }
    return 'Specialty Origin';
  }

  private static detectAltitude(text: string): number | undefined {
    const match = text.match(/(\d{3,4})\s*(?:m\.?s\.?n\.?m|masl|m\b)/i);
    if (match) {
      const val = parseInt(match[1], 10);
      if (val >= 800 && val <= 2600) return val;
    }
    return undefined;
  }

  private static detectVariety(text: string): string {
    const varieties = [
      'geisha', 'gesha', 'bourbon', 'caturra', 'castillo',
      'pacamara', 'sl28', 'sl34', 'typica', 'heirloom', 'catuai', 'sidra'
    ];
    for (const v of varieties) {
      if (text.includes(v)) return v.charAt(0).toUpperCase() + v.slice(1);
    }
    return 'Arabica Microlot';
  }

  private static detectProcess(text: string): CoffeeProps['process'] {
    if (text.includes('anaerobic') || text.includes('anaerobico')) return 'anaerobic';
    if (text.includes('natural')) return 'natural';
    if (text.includes('honey')) return 'honey';
    if (text.includes('experimental')) return 'experimental';
    return 'washed';
  }

  private static detectRoastLevel(text: string): CoffeeProps['roastLevel'] {
    if (text.includes('dark roast') || text.includes('tueste oscuro')) return 'dark';
    if (text.includes('medium dark') || text.includes('medio oscuro')) return 'medium_dark';
    if (text.includes('medium roast') || text.includes('tueste medio')) return 'medium';
    if (text.includes('omni') || text.includes('espresso')) return 'medium_light';
    return 'light';
  }

  private static detectTastingNotes(text: string): string[] {
    const candidates = [
      'peach', 'jasmine', 'bergamot', 'chocolate', 'caramel', 'floral',
      'hazelnut', 'red berries', 'apricot', 'citrus', 'black tea', 'orange'
    ];
    const found = candidates.filter(c => text.includes(c));
    return found.length > 0 ? found.slice(0, 4) : [];
  }
}
