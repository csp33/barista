'use client';

import React, { useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { X, Link2, Sparkles, Loader2 } from 'lucide-react';

interface AddCoffeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SAMPLE_URLS = [
  { label: 'Nomad Worka Sakaro', url: 'https://nomadcoffee.es/products/worka-sakaro' },
  { label: 'San Jorge Peña Blanca', url: 'https://sanjorge.coffee/products/guatemala-pena-blanca' },
  { label: 'Right Side El Paraiso', url: 'https://rightsidecoffee.com/products/el-paraiso-92' },
];

export const AddCoffeeModal: React.FC<AddCoffeeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
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
      const res = await fetch('/api/coffees', {
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
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scraping failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#181512] border border-[#2C2621] w-full max-w-md rounded-3xl p-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#9E9288] hover:text-[#F5EFEB] rounded-full bg-[#12100E] border border-[#2C2621]"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-xl bg-[#D96B27]/20 text-[#D96B27]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#F5EFEB]">{t.addCoffee}</h3>
            <p className="text-xs text-[#9E9288]">
              Autonomous extractor & recipe generator
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
            <Link2 className="w-4 h-4 text-[#9E9288] absolute left-3 top-3.5" />
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder={t.addCoffeeUrlPlaceholder}
              disabled={loading}
              className="w-full bg-[#12100E] border border-[#2C2621] focus:border-[#D96B27] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#F5EFEB] outline-none placeholder:text-[#9E9288]/60 transition-colors"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-950/30 border border-red-800/40 p-2.5 rounded-lg">
              {error}
            </p>
          )}

          {step && (
            <div className="flex items-center gap-2 text-xs text-[#E29D52] bg-[#E29D52]/10 p-2.5 rounded-lg border border-[#E29D52]/20">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{step}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="w-full bg-[#D96B27] hover:bg-[#E29D52] disabled:opacity-50 text-[#12100E] font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t.addCoffeeSubmit}
          </button>
        </form>

        {/* Quick Sample URLs */}
        <div className="mt-5 border-t border-[#2C2621]/60 pt-4">
          <p className="text-[11px] font-medium text-[#9E9288] mb-2">
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
                className="w-full text-left text-xs bg-[#12100E] hover:bg-[#201C18] border border-[#2C2621] p-2 rounded-lg flex items-center justify-between text-[#F5EFEB]/90 group transition-colors"
              >
                <span>{sample.label}</span>
                <span className="text-[10px] text-[#D96B27] group-hover:underline">
                  Auto-scrape
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
