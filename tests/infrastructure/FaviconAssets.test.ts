import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const appDir = path.resolve(__dirname, '../../src/app');

describe('Website Favicon & App Icons', () => {
  it('provides a custom multi-size favicon.ico instead of the stock Next.js icon', () => {
    const faviconPath = path.join(appDir, 'favicon.ico');
    expect(fs.existsSync(faviconPath)).toBe(true);

    const buffer = fs.readFileSync(faviconPath);
    // Valid ICO header: Reserved = 0, Type = 1 (ICO), Count >= 1
    expect(buffer.readUInt16LE(0)).toBe(0);
    expect(buffer.readUInt16LE(2)).toBe(1);
    expect(buffer.readUInt16LE(4)).toBeGreaterThanOrEqual(3);

    // Ensure it is not the default create-next-app triangle favicon
    const sha1 = crypto.createHash('sha1').update(buffer).digest('hex');
    expect(sha1).not.toBe('9bd95591db1b6ee579ed9485a4d4a957e7a90354');
  });

  it('provides vector icon.svg with Barista crema gradient and coffee cup glyph', () => {
    const svgPath = path.join(appDir, 'icon.svg');
    expect(fs.existsSync(svgPath)).toBe(true);

    const svg = fs.readFileSync(svgPath, 'utf8');
    expect(svg).toContain('<svg');
    expect(svg).toContain('#D96B27');
  });

  it('provides a 180x180 apple-icon.png for Apple touch icon support', () => {
    const appleIconPath = path.join(appDir, 'apple-icon.png');
    expect(fs.existsSync(appleIconPath)).toBe(true);

    const buffer = fs.readFileSync(appleIconPath);
    // PNG signature: 89 50 4E 47 0D 0A 1A 0A
    expect(buffer.subarray(0, 4).toString('hex')).toBe('89504e47');
    // IHDR width and height at bytes 16..24
    expect(buffer.readUInt32BE(16)).toBe(180);
    expect(buffer.readUInt32BE(20)).toBe(180);
  });

  it('does not shadow Next.js file-convention icon metadata in layout.tsx', () => {
    const layoutPath = path.join(appDir, 'layout.tsx');
    const layoutSource = fs.readFileSync(layoutPath, 'utf8');
    expect(layoutSource).not.toContain('icon: "/icon.svg"');
  });
});
