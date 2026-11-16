import { describe, it, expect } from 'vitest';
import { BrewCalendar } from '@/domain/recipe/BrewCalendar';
import { ExtractionFeedback } from '@/domain/recipe/ExtractionFeedback';

describe('BrewCalendar Domain Logic', () => {
  const sampleCoffee = {
    id: 'coffee-nomad-worka',
    name: 'Worka Sakaro',
    roaster: 'Nomad Coffee',
    originCountry: 'Ethiopia',
  };

  it('creates a BrewLogEntry with formatted local date, HH:mm time, and brew ratio', () => {
    const fb = new ExtractionFeedback({
      id: 'fb-1',
      recipeId: 'recipe-1',
      userId: 'carlos',
      actualGrindSetting: 11.5,
      actualDoseGrams: 18,
      actualYieldGrams: 39,
      actualTimeSeconds: 29,
      actualTemperature: 'hot_1',
      tasteProfile: 'balanced',
      userNotes: 'Floral and sweet',
      aiDiagnosis: 'Optimal extraction',
      createdAt: new Date(2026, 10, 16, 8, 5, 0), // Nov 16, 2026 08:05 local
    });

    const entry = BrewCalendar.createEntry(fb, sampleCoffee);

    expect(entry.dateKey).toBe('2026-11-16');
    expect(entry.timeFormatted).toBe('08:05');
    expect(entry.ratioFormatted).toBe('1:2.2');
    expect(entry.coffeeName).toBe('Worka Sakaro');
    expect(entry.tasteProfile).toBe('balanced');
    expect(entry.actualTemperature).toBe('hot_1');
  });

  it('groups entries by date in chronological order and calculates daily & monthly stats', () => {
    const fbMorning = new ExtractionFeedback({
      id: 'fb-morning',
      recipeId: 'recipe-1',
      userId: 'carlos',
      actualGrindSetting: 12,
      actualDoseGrams: 18,
      actualYieldGrams: 36,
      actualTimeSeconds: 25,
      tasteProfile: 'sour',
      createdAt: new Date(2026, 10, 16, 8, 15, 0),
    });

    const fbAfternoon = new ExtractionFeedback({
      id: 'fb-afternoon',
      recipeId: 'recipe-1',
      userId: 'carlos',
      actualGrindSetting: 11,
      actualDoseGrams: 18.5,
      actualYieldGrams: 37,
      actualTimeSeconds: 29,
      tasteProfile: 'balanced',
      createdAt: new Date(2026, 10, 16, 15, 40, 0),
    });

    const fbPrevDay = new ExtractionFeedback({
      id: 'fb-prev',
      recipeId: 'recipe-1',
      userId: 'carlos',
      actualGrindSetting: 11,
      actualDoseGrams: 18,
      actualYieldGrams: 36,
      actualTimeSeconds: 28,
      tasteProfile: 'balanced',
      createdAt: new Date(2026, 10, 15, 9, 30, 0),
    });

    // Pass out-of-order to verify chronological sorting inside each day
    const entries = [
      BrewCalendar.createEntry(fbAfternoon, sampleCoffee),
      BrewCalendar.createEntry(fbMorning, sampleCoffee),
      BrewCalendar.createEntry(fbPrevDay, sampleCoffee),
    ];

    const grouped = BrewCalendar.groupEntriesByDate(entries);

    expect(Object.keys(grouped).sort()).toEqual(['2026-11-15', '2026-11-16']);
    expect(grouped['2026-11-16'].shotCount).toBe(2);
    expect(grouped['2026-11-16'].godShotCount).toBe(1);
    expect(grouped['2026-11-16'].totalDoseGrams).toBe(36.5);
    expect(grouped['2026-11-16'].entries[0].id).toBe('fb-morning');
    expect(grouped['2026-11-16'].entries[1].id).toBe('fb-afternoon');

    const monthStats = BrewCalendar.getMonthStats(2026, 10, grouped);
    expect(monthStats.totalShots).toBe(3);
    expect(monthStats.godShotCount).toBe(2);
    expect(monthStats.godShotRate).toBe(67);
    expect(monthStats.activeDaysCount).toBe(2);
    expect(monthStats.totalDoseGrams).toBe(54.5);
  });

  it('builds a Monday-aligned 7-column calendar grid for a given month', () => {
    const grid = BrewCalendar.buildMonthGrid(2026, 10); // November 2026
    expect(grid.length % 7).toBe(0);
    const currentMonthCells = grid.filter((c) => c.isCurrentMonth);
    expect(currentMonthCells.length).toBe(30);
    expect(currentMonthCells[0].dateKey).toBe('2026-11-01');
    expect(currentMonthCells[29].dateKey).toBe('2026-11-30');
  });
});
