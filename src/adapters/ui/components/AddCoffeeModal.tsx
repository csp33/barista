'use client';

import React, { useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { CoffeeProps } from '@/core/domain/coffee/Coffee';
import { X, Link2, Sparkles, Loader2 } from 'lucide-react';

interface AddCoffeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScraped: (scraped: Partial<CoffeeProps>) => void;
}

const SAMPLE_URLS = [
  { label: 'Cafés El Criollo - India Malabar', url: 'https://cafeselcriollo.com/producto/cafe-india/' },
  { label: 'Nomad Worka Sakaro', url: 'https://nomadcoffee.es/products/worka-sakaro' },
  { label: 'San Jorge Peña Blanca', url: 'https://sanjorge.coffee/products/guatemala-pena-blanca' },
];

export const AddCoffeeModal: React.FC<AddCoffeeModalProps> = ({
  isOpen,
  onClose,
  onScraped,
}) => {
  const { t } = useTranslation();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (targetUrl: string) => {
    if (!targetUrl.trim()) return;
    setLoading(true);
    setError(null);
    setStep(t.analyzingRoaster);

    try {
      const res = await fetch('/api/coffees/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl.trim() }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to extract coffee');
      }

      setStep(null);
      setUrl('');
      onClose();
      onScraped(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scraping failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#1C1815] border border-[#3D332A] w-full max-w-md rounded-3xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-[#A8988B] hover:text-[#F7F2EB] rounded-full bg-[#141210] border border-[#3D332A]"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-3">
          <div className="p-2 rounded-xl bg-[#D96B27]/20 text-[#D96B27]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-[#F7F2EB]">{t.addCoffee}</h3>
            <p className="text-xs text-[#A8988B]">
              El agente extraerá los datos y te permitirá revisarlos
            </p>
          </div>
        </div>

        <form
          onSubmit={e => {
            e.preventDefault();
            handleSubmit(url);
          }}
          className="space-y-3 mt-4"
        >
          <div className="relative">
            <Link2 className="w-4 h-4 text-[#A8988B] absolute left-3.5 top-3.5" />
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder={t.addCoffeeUrlPlaceholder}
              disabled={loading}
              className="w-full bg-[#141210] border border-[#3D332A] focus:border-[#D96B27] rounded-xl pl-10 pr-3 py-3 text-xs text-[#F7F2EB] outline-none placeholder:text-[#A8988B]/60"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-950/30 border border-red-800/40 p-2.5 rounded-lg">
              {error}
            </p>
          )}

          {step && (
            <div className="flex items-center gap-2 text-xs text-[#E29D52] bg-[#E29D52]/10 p-3 rounded-xl border border-[#E29D52]/20">
              <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
              <span>{step}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="w-full bg-[#D96B27] hover:bg-[#E29D52] disabled:opacity-50 text-[#141210] font-bold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#D96B27]/20 transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t.addCoffeeSubmit}
          </button>
        </form>

        <div className="mt-5 border-t border-[#30261E] pt-4">
          <p className="text-[11px] font-medium text-[#A8988B] mb-2 font-serif">
            {t.sampleUrlsLabel}
          </p>
          <div className="space-y-1.5">
            {SAMPLE_URLS.map((sample, i) => (
              <button
                key={i}
                type="button"
                disabled={loading}
                onClick={() => {
                  setUrl(sample.url);
                  handleSubmit(sample.url);
                }}
                className="w-full text-left text-xs bg-[#141210] hover:bg-[#251F1A] border border-[#30261E] p-2.5 rounded-xl flex items-center justify-between text-[#F7F2EB]/90 transition-colors"
              >
                <span>{sample.label}</span>
                <span className="text-[10px] text-[#D96B27] font-medium">Extraer</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
