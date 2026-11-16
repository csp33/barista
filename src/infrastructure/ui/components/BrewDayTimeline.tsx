'use client';

import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { BrewDaySummary } from '@/domain/recipe/BrewCalendar';
import { TasteProfile } from '@/domain/recipe/ExtractionFeedback';
import { Clock, Coffee, Sparkles, ArrowUpRight, Flame, CalendarSearch } from 'lucide-react';

interface BrewDayTimelineProps {
  selectedDateKey: string;
  daySummary?: BrewDaySummary;
  latestActiveDateKey?: string;
  onJumpToDate: (dateKey: string) => void;
  onSelectCoffee: (coffeeId: string) => void;
}

const TASTE_STYLES: Record<TasteProfile, { badge: string; dot: string }> = {
  balanced: { badge: 'bg-[#16291E] text-[#71BC8E] border-[#244733]', dot: 'bg-[#71BC8E]' },
  sour: { badge: 'bg-[#2B2111] text-amber-400 border-amber-700/50', dot: 'bg-amber-400' },
  bitter: { badge: 'bg-[#2A1912] text-orange-400 border-orange-700/50', dot: 'bg-orange-400' },
  astringent: { badge: 'bg-[#2A1912] text-orange-300 border-orange-800/50', dot: 'bg-orange-300' },
  weak: { badge: 'bg-[#1E1C1A] text-[#C2B2A3] border-[#3A3027]', dot: 'bg-[#C2B2A3]' },
  channeled: { badge: 'bg-red-950/50 text-red-300 border-red-800/60', dot: 'bg-red-400' },
};

export const BrewDayTimeline: React.FC<BrewDayTimelineProps> = ({
  selectedDateKey,
  daySummary,
  latestActiveDateKey,
  onJumpToDate,
  onSelectCoffee,
}) => {
  const { t, language } = useTranslation();

  const formattedDate = React.useMemo(() => {
    const [y, m, d] = selectedDateKey.split('-').map(Number);
    const dateObj = new Date(y, (m || 1) - 1, d || 1);
    const loc = language === 'es' ? 'es-ES' : 'en-US';
    const weekday = dateObj.toLocaleDateString(loc, { weekday: 'long' });
    const month = dateObj.toLocaleDateString(loc, { month: 'long' });
    return `${weekday} ${d}, ${month}`;
  }, [selectedDateKey, language]);

  const entries = daySummary?.entries || [];

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="font-serif text-base font-bold text-[#F7F2EB] capitalize">
            {formattedDate}
          </h3>
          <p className="text-[11px] font-metric text-[#A8988B]">
            {entries.length === 1
              ? t.calendar.singleShotLabel
              : t.calendar.shotsCountLabel.replace('{count}', String(entries.length))}
            {daySummary && daySummary.totalDoseGrams > 0 ? ` • ${daySummary.totalDoseGrams}g` : ''}
          </p>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="bg-[#181411] border border-[#30261E] rounded-2xl p-6 text-center space-y-3">
          <CalendarSearch className="w-7 h-7 text-[#D96B27]/80 mx-auto" />
          <div>
            <p className="font-serif font-semibold text-sm text-[#F7F2EB]">
              {t.calendar.noShotsOnDay}
            </p>
            <p className="text-xs text-[#A8988B] mt-1">{t.calendar.noShotsHint}</p>
          </div>
          {latestActiveDateKey && latestActiveDateKey !== selectedDateKey && (
            <button
              onClick={() => onJumpToDate(latestActiveDateKey)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E29D52] hover:text-[#F7F2EB] bg-[#241C16] border border-[#3D3025] px-3.5 py-2 rounded-xl transition-colors"
            >
              <span>{t.calendar.jumpToLatest}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : (
        <div className="relative pl-4 space-y-3 before:content-[''] before:absolute before:left-[7px] before:top-3 before:bottom-3 before:w-[1.5px] before:bg-[#30261E]">
          {entries.map((entry) => {
            const style = TASTE_STYLES[entry.tasteProfile] || TASTE_STYLES.balanced;
            const tasteLabel =
              t.calendar.tasteBadges[entry.tasteProfile] || entry.tasteProfile;
            const tempLabel = entry.actualTemperature
              ? t.temperaturePresets[entry.actualTemperature] || entry.actualTemperature
              : null;

            return (
              <article
                key={entry.id}
                className="relative bg-[#181411] border border-[#32271F] rounded-2xl p-4 shadow-lg space-y-3"
              >
                <span className={`absolute -left-[13px] top-5 w-2.5 h-2.5 rounded-full ring-4 ring-[#14100D] ${style.dot}`} />

                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-xs font-metric font-bold text-[#E29D52] bg-[#120F0D] border border-[#2D231B] px-2 py-0.5 rounded-lg">
                        <Clock className="w-3 h-3 text-[#D96B27]" />
                        {entry.timeFormatted}
                      </span>
                      <span className={`text-[10px] font-metric font-semibold px-2.5 py-0.5 rounded-full border ${style.badge}`}>
                        {tasteLabel}
                      </span>
                    </div>
                    <h4 className="font-serif font-bold text-sm text-[#F7F2EB] mt-1.5">{entry.coffeeName}</h4>
                    <p className="text-[11px] text-[#A8988B]">{entry.coffeeRoaster} • {entry.coffeeOrigin}</p>
                  </div>

                  <button
                    onClick={() => onSelectCoffee(entry.coffeeId)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-[#C2B2A3] hover:text-[#E29D52] bg-[#120F0D] border border-[#2D231B] px-2.5 py-1.5 rounded-xl transition-colors shrink-0"
                  >
                    <Coffee className="w-3 h-3 text-[#D96B27]" />
                    <span>{t.calendar.openInBar}</span>
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-1.5 bg-[#120F0D] border border-[#2A211A] rounded-xl p-2.5 text-center font-metric">
                  <div>
                    <span className="text-[9px] uppercase text-[#8A7A6D] block">{t.grindSetting}</span>
                    <span className="text-xs font-bold text-[#D96B27]">#{entry.actualGrindSetting}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-[#8A7A6D] block">{t.dose} → {t.yield}</span>
                    <span className="text-xs font-bold text-[#F7F2EB]">{entry.actualDoseGrams}g → {entry.actualYieldGrams}g</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-[#8A7A6D] block">{t.ratio}</span>
                    <span className="text-xs font-bold text-[#E29D52]">{entry.ratioFormatted}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-[#8A7A6D] block">{t.time}</span>
                    <span className="text-xs font-bold text-[#F7F2EB]">{entry.actualTimeSeconds}s</span>
                  </div>
                </div>

                {(tempLabel || entry.userNotes || entry.aiDiagnosis) && (
                  <div className="space-y-1.5 pt-0.5 text-xs">
                    {tempLabel && (
                      <div className="flex items-center gap-1.5 text-[11px] font-metric text-[#A8988B]">
                        <Flame className="w-3 h-3 text-[#D96B27]" />
                        <span>{t.temperature}: {tempLabel}</span>
                      </div>
                    )}
                    {entry.userNotes && (
                      <p className="text-xs italic font-serif text-[#F7F2EB]/90 bg-[#14100D] border border-[#281F19] rounded-xl px-3 py-2">
                        &ldquo;{entry.userNotes}&rdquo;
                      </p>
                    )}
                    {entry.aiDiagnosis && (
                      <div className="bg-[#1E1712] border border-[#3A2C22] rounded-xl px-3 py-2 text-[11px] text-[#D8C7B8]">
                        <span className="font-metric font-semibold text-[#E29D52] flex items-center gap-1 mb-0.5">
                          <Sparkles className="w-3 h-3 text-[#D96B27]" />
                          {t.calendar.aiDiagnosisLabel}
                        </span>
                        <p>{entry.aiDiagnosis}</p>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
