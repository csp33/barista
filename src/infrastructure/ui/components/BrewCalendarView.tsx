'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { StashItemDTO } from '@/application/usecases/GetCoffeeStashUseCase';
import { BrewCalendar } from '@/domain/recipe/BrewCalendar';
import { TasteProfile } from '@/domain/recipe/ExtractionFeedback';
import { BrewDayTimeline } from './BrewDayTimeline';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface BrewCalendarViewProps {
  items: StashItemDTO[];
  onSelectCoffee: (coffeeId: string) => void;
}

const DOT_COLORS: Record<TasteProfile, string> = {
  balanced: 'bg-[#71BC8E]',
  sour: 'bg-amber-400',
  bitter: 'bg-orange-400',
  astringent: 'bg-orange-300',
  weak: 'bg-[#C2B2A3]',
  channeled: 'bg-red-400',
};

export const BrewCalendarView: React.FC<BrewCalendarViewProps> = ({ items, onSelectCoffee }) => {
  const { t, language } = useTranslation();
  const todayKey = useMemo(() => BrewCalendar.toLocalDateKey(new Date()), []);

  const { byDate, latestActiveDateKey } = useMemo(() => {
    const allEntries = items.flatMap((item) =>
      (item.feedbackHistory || []).map((fb) => BrewCalendar.createEntry(fb, item.coffee))
    );
    const grouped = BrewCalendar.groupEntriesByDate(allEntries);
    const sortedKeys = Object.keys(grouped).sort();
    return {
      byDate: grouped,
      latestActiveDateKey: sortedKeys.length > 0 ? sortedKeys[sortedKeys.length - 1] : undefined,
    };
  }, [items]);

  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayKey);
  const [viewYear, setViewYear] = useState<number>(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(() => new Date().getMonth());

  useEffect(() => {
    if (!byDate[todayKey] && latestActiveDateKey) {
      setSelectedDateKey(latestActiveDateKey);
      const [y, m] = latestActiveDateKey.split('-').map(Number);
      if (y && m) {
        setViewYear(y);
        setViewMonth(m - 1);
      }
    }
  }, [byDate, todayKey, latestActiveDateKey]);

  const monthCells = useMemo(() => BrewCalendar.buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);
  const monthStats = useMemo(() => BrewCalendar.getMonthStats(viewYear, viewMonth, byDate), [viewYear, viewMonth, byDate]);
  const monthLabel = useMemo(() => {
    const name = new Date(viewYear, viewMonth, 1).toLocaleDateString(
      language === 'es' ? 'es-ES' : 'en-US',
      { month: 'long' }
    );
    const currentYear = new Date().getFullYear();
    return viewYear === currentYear ? name : `${name} ${viewYear}`;
  }, [viewYear, viewMonth, language]);

  const shiftMonth = (delta: number) => {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const handleSelectDate = (dateKey: string) => {
    setSelectedDateKey(dateKey);
    const [y, m] = dateKey.split('-').map(Number);
    if (y && m && (y !== viewYear || m - 1 !== viewMonth)) {
      setViewYear(y);
      setViewMonth(m - 1);
    }
  };

  return (
    <div className="space-y-5 px-4 py-4 pb-24">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-bold text-[#F7F2EB]">{t.calendar.title}</h2>
          <p className="text-xs text-[#A8988B] mt-0.5">{t.calendar.subtitle}</p>
        </div>
        <button
          onClick={() => handleSelectDate(todayKey)}
          className="inline-flex items-center gap-1.5 text-xs font-metric font-semibold text-[#E29D52] hover:text-[#F7F2EB] bg-[#1C1612] border border-[#3A2D23] px-3 py-1.5 rounded-xl transition-colors shrink-0"
        >
          <CalendarIcon className="w-3.5 h-3.5 text-[#D96B27]" />
          <span>{t.calendar.today}</span>
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 bg-[#181411] border border-[#30261E] rounded-2xl p-3.5 text-center shadow-lg">
        <div>
          <span className="text-[10px] uppercase font-metric text-[#8A7A6D] block">{t.calendar.monthlyShots}</span>
          <span className="text-base font-bold font-metric text-[#F7F2EB]">{monthStats.totalShots}</span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-metric text-[#8A7A6D] block">{t.calendar.godShotRate}</span>
          <span className="text-base font-bold font-metric text-[#71BC8E]">{monthStats.godShotRate}%</span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-metric text-[#8A7A6D] block">{t.calendar.activeDays}</span>
          <span className="text-base font-bold font-metric text-[#E29D52]">{monthStats.activeDaysCount}</span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-metric text-[#8A7A6D] block">{t.calendar.coffeeConsumed}</span>
          <span className="text-base font-bold font-metric text-[#F7F2EB]">{monthStats.totalDoseGrams}g</span>
        </div>
      </div>

      <div className="bg-[#181411] border border-[#32271F] rounded-3xl p-4 shadow-2xl space-y-3">
        <div className="flex items-center justify-between px-1">
          <button
            onClick={() => shiftMonth(-1)}
            aria-label="Previous month"
            className="p-2 rounded-xl bg-[#120F0D] border border-[#2D231B] text-[#C2B2A3] hover:text-[#F7F2EB] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-serif font-bold text-base text-[#F7F2EB] capitalize">
            {monthLabel}
          </span>
          <button
            onClick={() => shiftMonth(1)}
            aria-label="Next month"
            className="p-2 rounded-xl bg-[#120F0D] border border-[#2D231B] text-[#C2B2A3] hover:text-[#F7F2EB] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {t.calendar.weekdays.map((dayName, idx) => (
            <span key={idx} className="text-[10px] font-metric font-semibold uppercase text-[#8A7A6D] py-1">
              {dayName}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {monthCells.map((cell) => {
            const summary = byDate[cell.dateKey];
            const shotCount = summary?.shotCount || 0;
            const isSelected = cell.dateKey === selectedDateKey;
            const isToday = cell.dateKey === todayKey;

            return (
              <button
                key={cell.dateKey}
                onClick={() => handleSelectDate(cell.dateKey)}
                className={`relative h-14 rounded-xl border flex flex-col items-center justify-between p-1.5 transition-all ${
                  isSelected
                    ? 'bg-[#281E17] border-[#D96B27] ring-1 ring-[#D96B27] text-[#F7F2EB]'
                    : shotCount > 0
                    ? 'bg-[#1D1612] border-[#382C22] hover:border-[#523F31] text-[#F7F2EB]'
                    : 'bg-[#120F0D] border-[#221B15] hover:border-[#30261E] text-[#8C7B6E]'
                } ${!cell.isCurrentMonth ? 'opacity-40' : ''}`}
              >
                <div className="w-full flex items-center justify-between">
                  <span className={`text-[11px] font-metric leading-none ${isToday ? 'font-bold text-[#D96B27]' : ''}`}>
                    {cell.dayOfMonth}
                  </span>
                  {shotCount > 0 && (
                    <span className="text-[9px] font-metric font-bold px-1.5 py-0.5 rounded-md bg-[#D96B27]/20 text-[#E29D52] leading-none">
                      {shotCount}x
                    </span>
                  )}
                </div>

                {shotCount > 0 && (
                  <div className="flex items-center justify-center gap-1 pb-0.5">
                    {summary.entries.slice(0, 4).map((e) => (
                      <span key={e.id} className={`w-1.5 h-1.5 rounded-full ${DOT_COLORS[e.tasteProfile] || 'bg-[#71BC8E]'}`} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <BrewDayTimeline
        selectedDateKey={selectedDateKey}
        daySummary={byDate[selectedDateKey]}
        latestActiveDateKey={latestActiveDateKey}
        onJumpToDate={handleSelectDate}
        onSelectCoffee={onSelectCoffee}
      />
    </div>
  );
};
