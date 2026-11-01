import { ScrapedCoffeeData } from '@/core/application/ports/out/RoasterScraperPort';
import { CoffeeProps } from '@/core/domain/coffee/Coffee';

export class HeuristicParser {
  static parse(html: string, url: string, domain: string): ScrapedCoffeeData {
    const decoded = this.decodeHtmlEntities(html);
    const rawTitle = (decoded.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || '').trim();
    const ogSite = decoded.match(/<meta\s+(?:property|name)=["']og:site_name["']\s+content=["']([^"']+)["']/i)?.[1]?.trim();
    const ogImage = decoded.match(/<meta\s+(?:property|name)=["']og:image["']\s+content=["']([^"']+)["']/i)?.[1]?.trim();
    const ogDesc = decoded.match(/<meta\s+(?:property|name)=["']og:description["']\s+content=["']([^"']+)["']/i)?.[1]?.trim() || '';

    const roaster = ogSite || this.detectRoaster(domain, rawTitle);
    const name = this.cleanCoffeeName(rawTitle, roaster);
    const tableSpecs = this.extractTableSpecs(decoded);
    const cleanText = this.extractCleanText(decoded);
    const summaryText = `${rawTitle} ${ogDesc} ${cleanText.substring(0, 3000)}`.toLowerCase();

    return {
      roaster,
      name,
      originCountry: this.detectCountry(tableSpecs, summaryText),
      altitudeMasl: this.detectAltitude(tableSpecs, cleanText),
      variety: this.detectVariety(tableSpecs, summaryText),
      process: this.detectProcess(tableSpecs, summaryText),
      roastLevel: this.detectRoastLevel(tableSpecs, summaryText),
      tastingNotes: this.detectTastingNotes(tableSpecs, cleanText),
      sourceUrl: url,
      imageUrl: ogImage,
    };
  }

  static decodeHtmlEntities(str: string): string {
    return str
      .replace(/&quot;/gi, '"')
      .replace(/&apos;/gi, "'")
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&ndash;/gi, '–')
      .replace(/&mdash;/gi, '—')
      .replace(/&#0*39;?/gi, "'")
      .replace(/&#(\d+);?/g, (_, dec) => {
        const c = parseInt(dec, 10);
        return c >= 32 && c <= 65535 ? String.fromCharCode(c) : '';
      })
      .replace(/&#x([0-9a-f]+);?/gi, (_, hex) => {
        const c = parseInt(hex, 16);
        return c >= 32 && c <= 65535 ? String.fromCharCode(c) : '';
      });
  }

  static isComplete(data: ScrapedCoffeeData): boolean {
    return (
      data.name.length > 2 &&
      data.originCountry !== 'Specialty Origin' &&
      data.variety !== 'Arabica Microlot' &&
      data.tastingNotes.length >= 2
    );
  }

  private static extractTableSpecs(html: string): Record<string, string> {
    const tableMap: Record<string, string> = {};
    const regex = /<(?:th|td)[^>]*>([^<:]+)[:]?<\/(?:th|td)>\s*<td[^>]*>([^<]+)<\/td>/gi;
    let match;
    while ((match = regex.exec(html)) !== null) {
      tableMap[match[1].trim().toLowerCase()] = match[2].trim();
    }
    return tableMap;
  }

  private static extractCleanText(html: string): string {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ');
  }

  private static detectRoaster(domain: string, title: string): string {
    if (domain.includes('cafeselcriollo') || domain.includes('elcriollo')) return 'Cafés el Criollo';
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
    let name = this.decodeHtmlEntities(title)
      .replace(/^comprar\s+/gi, '')
      .replace(new RegExp(roaster, 'gi'), '')
      .replace(/cafés?\s+el\s+criollo/gi, '')
      .replace(/nomad\s+coffee/gi, '')
      .replace(/\|\s*[^|]+$/g, '')
      .replace(/100%\s*arábica/gi, '')
      .replace(/arábica\s+100%/gi, '')
      .replace(/specialty\s+coffee/gi, '')
      .replace(/café\s+de\s+especialidad/gi, '')
      .replace(/^(?:cafés?|cafe)\s+/gi, '')
      .trim();

    name = name.replace(/[-–]\s*(?:tienda|shop|comprar|online).*$/gi, '').trim();
    name = name.replace(/[-–|]+$/, '').replace(/^(?:cafés?|cafe)\s+/gi, '').trim();
    return name || 'Single Origin Espresso';
  }

  private static detectCountry(table: Record<string, string>, text: string): string {
    const raw = table['país'] || table['pais'] || table['origen'];
    if (raw && raw.length > 2) return raw.trim();

    const countries = [
      'india', 'ethiopia', 'colombia', 'kenya', 'guatemala', 'brazil', 'brasil',
      'costa rica', 'panama', 'rwanda', 'el salvador', 'honduras', 'peru', 'perú',
      'centroamérica', 'centroamerica', 'mexico', 'méxico'
    ];
    for (const c of countries) {
      if (text.includes(c)) return c.charAt(0).toUpperCase() + c.slice(1);
    }
    return 'Specialty Origin';
  }

  private static detectAltitude(table: Record<string, string>, cleanText: string): number | undefined {
    const raw = table['altitud'] || cleanText;
    const match = raw.match(
      /(?:altitud|msnm|masl)?[^0-9]{0,25}(\b\d{1,2}\.\d{3}\b|\b\d{3,4}\b)(?:\s*[–\-a]\s*(\b\d{1,2}\.\d{3}\b|\b\d{3,4}\b))?\s*(?:msnm|m\.s\.n\.m|masl|m\b|metros)?/i
    );
    if (match && (table['altitud'] || /(?:altitud|msnm|masl|m\.s\.n\.m)/i.test(match[0]))) {
      const val1 = parseInt(match[1].replace('.', ''), 10);
      const val2 = match[2] ? parseInt(match[2].replace('.', ''), 10) : undefined;
      const maxVal = val2 ? Math.max(val1, val2) : val1;
      if (maxVal >= 600 && maxVal <= 3000) return maxVal;
    }
    return undefined;
  }

  private static detectVariety(table: Record<string, string>, text: string): string {
    const raw = table['variedades'] || table['variedad'] || table['varietal'];
    if (raw && raw.length > 2) return raw.trim();

    const varieties = [
      'geisha', 'gesha', 'bourbon', 'caturra', 'castillo',
      'pacamara', 'sl28', 'sl34', 'typica', 'heirloom', 'catuai', 'kent', 'catimor'
    ];
    for (const v of varieties) {
      if (new RegExp(`\\b${v}\\b`, 'i').test(text)) return v.charAt(0).toUpperCase() + v.slice(1);
    }
    if (text.includes('arábica') || text.includes('arabica')) return '100% Arábica';
    return 'Arabica Microlot';
  }

  private static detectProcess(table: Record<string, string>, text: string): CoffeeProps['process'] {
    const raw = (table['proceso'] || text).toLowerCase();
    if (raw.includes('monsonado') || raw.includes('monsooned')) return 'washed';
    if (raw.includes('anaerobic') || raw.includes('anaeróbico')) return 'anaerobic';
    if (raw.includes('natural')) return 'natural';
    if (raw.includes('honey')) return 'honey';
    if (raw.includes('experimental')) return 'experimental';
    return 'washed';
  }

  private static detectRoastLevel(table: Record<string, string>, text: string): CoffeeProps['roastLevel'] {
    const raw = (table['tipo de tueste'] || table['tueste'] || text).toLowerCase();
    if (raw.includes('oscuro') || raw.includes('dark')) return 'dark';
    if (raw.includes('medio oscuro') || raw.includes('medium dark')) return 'medium_dark';
    if (raw.includes('tueste natural') || raw.includes('medio') || raw.includes('medium')) return 'medium';
    if (raw.includes('espresso') || raw.includes('omni')) return 'medium_light';
    return 'light';
  }

  private static detectTastingNotes(table: Record<string, string>, text: string): string[] {
    const rawNotes = table['perfil sensorial'] || table['notas de cata'] || table['notas'];
    if (rawNotes) {
      const candidates = [
        'cereal', 'pimienta', 'cedro', 'tabaco', 'peach', 'melocotón', 'jasmine', 'jazmín',
        'bergamota', 'chocolate', 'caramelo', 'floral', 'avellana', 'frutos secos', 'frutos rojos'
      ];
      const found = candidates.filter(c => rawNotes.toLowerCase().includes(c));
      if (found.length > 0) return found.slice(0, 4);
    }

    const candidates = [
      'cereal', 'pimienta', 'cedro', 'tabaco', 'peach', 'jasmine', 'bergamot',
      'chocolate', 'caramelo', 'caramel', 'floral', 'flores', 'hazelnut', 'red berries', 'cacao', 'cítricos'
    ];
    const found = candidates.filter(c => text.toLowerCase().includes(c));
    return found.length > 0 ? found.slice(0, 4) : [];
  }
}
