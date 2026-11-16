import { ExtractionFeedback, TasteProfile } from './ExtractionFeedback';
import { SageTemperatureSetting } from '../equipment/EspressoMachine';

export interface BrewLogEntry {
  id: string;
  coffeeId: string;
  coffeeName: string;
  coffeeRoaster: string;
  coffeeOrigin: string;
  actualGrindSetting: number;
  actualDoseGrams: number;
  actualYieldGrams: number;
  actualTimeSeconds: number;
  actualTemperature?: SageTemperatureSetting;
  tasteProfile: TasteProfile;
  userNotes?: string;
  aiDiagnosis?: string;
  createdAt: Date;
  dateKey: string;
  timeFormatted: string;
  ratioFormatted: string;
}

export interface BrewDaySummary {
  dateKey: string;
  entries: BrewLogEntry[];
  shotCount: number;
  godShotCount: number;
  totalDoseGrams: number;
}

export interface MonthCalendarStats {
  totalShots: number;
  godShotCount: number;
  godShotRate: number;
  activeDaysCount: number;
  totalDoseGrams: number;
}

export interface CalendarGridCell {
  dateKey: string;
  dayOfMonth: number;
  isCurrentMonth: boolean;
}

export class BrewCalendar {
  static toLocalDateKey(input: Date | string): string {
    const d = input instanceof Date ? input : new Date(input);
    if (Number.isNaN(d.getTime())) {
      return '1970-01-01';
    }
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  static formatTimeHHMM(input: Date | string): string {
    const d = input instanceof Date ? input : new Date(input);
    if (Number.isNaN(d.getTime())) {
      return '00:00';
    }
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  static createEntry(
    feedback: ExtractionFeedback,
    coffee: { id: string; name: string; roaster: string; originCountry: string }
  ): BrewLogEntry {
    const createdAt =
      feedback.createdAt instanceof Date
        ? feedback.createdAt
        : new Date(feedback.createdAt);
    const ratio =
      feedback.actualDoseGrams > 0
        ? (feedback.actualYieldGrams / feedback.actualDoseGrams).toFixed(1)
        : '0.0';

    return {
      id: feedback.id,
      coffeeId: coffee.id,
      coffeeName: coffee.name,
      coffeeRoaster: coffee.roaster,
      coffeeOrigin: coffee.originCountry,
      actualGrindSetting: feedback.actualGrindSetting,
      actualDoseGrams: feedback.actualDoseGrams,
      actualYieldGrams: feedback.actualYieldGrams,
      actualTimeSeconds: feedback.actualTimeSeconds,
      actualTemperature: feedback.actualTemperature,
      tasteProfile: feedback.tasteProfile,
      userNotes: feedback.userNotes,
      aiDiagnosis: feedback.aiDiagnosis,
      createdAt,
      dateKey: BrewCalendar.toLocalDateKey(createdAt),
      timeFormatted: BrewCalendar.formatTimeHHMM(createdAt),
      ratioFormatted: `1:${ratio}`,
    };
  }

  static groupEntriesByDate(entries: BrewLogEntry[]): Record<string, BrewDaySummary> {
    const sorted = [...entries].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
    const map: Record<string, BrewDaySummary> = {};

    for (const entry of sorted) {
      if (!map[entry.dateKey]) {
        map[entry.dateKey] = {
          dateKey: entry.dateKey,
          entries: [],
          shotCount: 0,
          godShotCount: 0,
          totalDoseGrams: 0,
        };
      }
      const group = map[entry.dateKey];
      group.entries.push(entry);
      group.shotCount += 1;
      if (entry.tasteProfile === 'balanced') {
        group.godShotCount += 1;
      }
      group.totalDoseGrams = Math.round((group.totalDoseGrams + entry.actualDoseGrams) * 10) / 10;
    }

    return map;
  }

  static getMonthStats(
    year: number,
    monthIndex: number,
    byDate: Record<string, BrewDaySummary>
  ): MonthCalendarStats {
    const prefix = `${year}-${String(monthIndex + 1).padStart(2, '0')}-`;
    let totalShots = 0;
    let godShotCount = 0;
    let activeDaysCount = 0;
    let totalDoseGrams = 0;

    for (const [dateKey, day] of Object.entries(byDate)) {
      if (dateKey.startsWith(prefix) && day.shotCount > 0) {
        activeDaysCount += 1;
        totalShots += day.shotCount;
        godShotCount += day.godShotCount;
        totalDoseGrams += day.totalDoseGrams;
      }
    }

    return {
      totalShots,
      godShotCount,
      godShotRate: totalShots > 0 ? Math.round((godShotCount / totalShots) * 100) : 0,
      activeDaysCount,
      totalDoseGrams: Math.round(totalDoseGrams * 10) / 10,
    };
  }

  static buildMonthGrid(year: number, monthIndex: number): CalendarGridCell[] {
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    // Convert Sunday (0) .. Saturday (6) to Monday (0) .. Sunday (6)
    const startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = lastDay.getDate();

    const cells: CalendarGridCell[] = [];

    for (let i = startOffset - 1; i >= 0; i--) {
      const d = new Date(year, monthIndex, -i);
      cells.push({
        dateKey: BrewCalendar.toLocalDateKey(d),
        dayOfMonth: d.getDate(),
        isCurrentMonth: false,
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, monthIndex, day);
      cells.push({
        dateKey: BrewCalendar.toLocalDateKey(d),
        dayOfMonth: day,
        isCurrentMonth: true,
      });
    }

    const trailing = (7 - (cells.length % 7)) % 7;
    for (let i = 1; i <= trailing; i++) {
      const d = new Date(year, monthIndex + 1, i);
      cells.push({
        dateKey: BrewCalendar.toLocalDateKey(d),
        dayOfMonth: d.getDate(),
        isCurrentMonth: false,
      });
    }

    return cells;
  }
}
