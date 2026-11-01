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

  it('decodes HTML entities like &#039; into clean quotes and clean coffee names', () => {
    const mockHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Comprar Café de especialidad Honduras &#039;La Paz&#039;</title>
          <meta property="og:site_name" content="Cafés el Criollo" />
          <meta property="og:description" content="Café de Honduras &#039;La Paz&#039; con notas de chocolate y avellana" />
        </head>
        <body>
          <table>
            <tr><th>País</th><td>Honduras</td></tr>
            <tr><th>Altitud</th><td>1535 msnm</td></tr>
            <tr><th>Variedad</th><td>Caturra</td></tr>
            <tr><th>Proceso</th><td>Lavado</td></tr>
            <tr><th>Perfil sensorial</th><td>chocolate, avellana</td></tr>
          </table>
        </body>
      </html>
    `;

    const data = HeuristicParser.parse(mockHtml, 'https://cafeselcriollo.com/producto/cafe-especialidad-honduras', 'cafeselcriollo.com');

    expect(data.name).toBe("Honduras 'La Paz'");
    expect(data.name).not.toContain('&#039;');
    expect(data.name).not.toContain('&');
    expect(data.originCountry).toBe('Honduras');
    expect(data.altitudeMasl).toBe(1535);
    expect(data.variety).toBe('Caturra');
  });
});
