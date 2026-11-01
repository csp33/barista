import { describe, it, expect } from 'vitest';
import { HeuristicParser } from '../../src/adapters/out/scraping/HeuristicParser';

describe('HeuristicParser', () => {
  it('extracts altitude and full specs from table structure (e.g. India Malabar)', () => {
    const mockHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Comprar Café India Malabar Monsooned - Arábica 100% | Cafés el Criollo</title>
          <meta property="og:site_name" content="Cafés el Criollo" />
          <meta property="og:image" content="https://cafeselcriollo.com/india.webp" />
        </head>
        <body>
          <table>
            <tr><th>País</th><td>India</td></tr>
            <tr><th>Altitud</th><td>600 – 2.000 msnm</td></tr>
            <tr><th>Variedades</th><td>Kent, Catimor, Selection 9</td></tr>
            <tr><th>Proceso</th><td>Monsonado</td></tr>
            <tr><th>Tipo de tueste</th><td>Natural</td></tr>
            <tr><th>Perfil sensorial</th><td>Aromas a cereal y pimienta, notas de cedro y tabaco</td></tr>
          </table>
        </body>
      </html>
    `;

    const data = HeuristicParser.parse(mockHtml, 'https://cafeselcriollo.com/producto/cafe-india/', 'cafeselcriollo.com');

    expect(data.roaster).toBe('Cafés el Criollo');
    expect(data.name).toBe('Café India Malabar Monsooned');
    expect(data.originCountry).toBe('India');
    expect(data.altitudeMasl).toBe(2000);
    expect(data.variety).toBe('Kent, Catimor, Selection 9');
    expect(data.tastingNotes).toEqual(['cereal', 'pimienta', 'cedro', 'tabaco']);
    expect(data.imageUrl).toBe('https://cafeselcriollo.com/india.webp');
  });

  it('preserves multi-part names like Doble Label without truncating after dash', () => {
    const mockHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Comprar Café Ecológico en Grano – Doble Label Orgánico</title>
          <meta property="og:site_name" content="Cafés el Criollo" />
          <meta property="og:description" content="Café ecológico doble label en grano 100% arábica" />
        </head>
        <body>
          <p>Centroamérica 100% Arábica con notas de chocolate, caramelo y flores.</p>
        </body>
      </html>
    `;

    const data = HeuristicParser.parse(mockHtml, 'https://cafeselcriollo.com/producto/cafe-ecologico/', 'cafeselcriollo.com');

    expect(data.name).toContain('Doble Label Orgánico');
    expect(data.originCountry).toBe('Centroamérica');
    expect(data.variety).toBe('100% Arábica');
    expect(data.tastingNotes).toContain('chocolate');
    expect(data.tastingNotes).toContain('caramelo');
  });
});
