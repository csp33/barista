import { describe, it, expect } from 'vitest';
import { en } from '@/infrastructure/ui/i18n/en';
import { es } from '@/infrastructure/ui/i18n/es';

describe('i18n Tab Title & Localization', () => {
  it('defines distinct, localized tab titles for English and Spanish', () => {
    expect(en.tabTitle).toBe('Barista • Specialty Coffee & Dial-in');
    expect(es.tabTitle).toBe('Barista • Café de Especialidad & Calibración');
    expect(en.tabTitle).not.toBe(es.tabTitle);
  });

  it('defines distinct, localized descriptions for English and Spanish', () => {
    expect(en.tabDescription).toBe('Specialty coffee stash and espresso recipe dial-in for home baristas');
    expect(es.tabDescription).toBe('Colección de café de especialidad y calibración precisa de espresso para baristas en casa');
    expect(en.tabDescription).not.toBe(es.tabDescription);
  });

  it('maintains structural key symmetry between English and Spanish dictionaries', () => {
    const enKeys = Object.keys(en).sort();
    const esKeys = Object.keys(es).sort();
    expect(enKeys).toEqual(esKeys);
  });
});
