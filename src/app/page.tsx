'use client';

import React, { useState, useEffect } from 'react';
import { LanguageProvider } from '@/adapters/ui/i18n/LanguageContext';
import { Header } from '@/adapters/ui/components/Header';
import { ActiveShelf } from '@/adapters/ui/components/ActiveShelf';
import { DialInCard } from '@/adapters/ui/components/DialInCard';
import { StashHistory } from '@/adapters/ui/components/StashHistory';
import { AddCoffeeModal } from '@/adapters/ui/components/AddCoffeeModal';
import { FeedbackModal } from '@/adapters/ui/components/FeedbackModal';
import { StashItemDTO } from '@/core/application/usecases/GetCoffeeStashUseCase';
import { Loader2 } from 'lucide-react';

function BaristaDashboard() {
  const [items, setItems] = useState<StashItemDTO[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  const fetchStash = async () => {
    try {
      const res = await fetch('/api/coffees');
      const data = await res.json();
      if (data.success && data.data) {
        setItems(data.data);
      }
    } catch (e) {
      console.error('Failed to load stash', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStash();
  }, []);

  const activeItem = items[selectedIndex] || null;

  return (
    <div className="min-h-screen bg-[#12100E] text-[#F5EFEB] pb-10">
      <Header />

      <main className="max-w-md mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-[#D96B27]" />
            <span className="text-xs text-[#9E9288] font-metric">
              Loading specialty stash...
            </span>
          </div>
        ) : (
          <>
            <ActiveShelf
              items={items}
              selectedIndex={selectedIndex}
              onSelectIndex={setSelectedIndex}
              onOpenAddModal={() => setIsAddModalOpen(true)}
            />

            {activeItem && (
              <div className="px-4 mt-4">
                <DialInCard
                  item={activeItem}
                  onOpenFeedback={() => setIsFeedbackModalOpen(true)}
                />
              </div>
            )}

            <StashHistory
              items={items}
              selectedIndex={selectedIndex}
              onSelectIndex={setSelectedIndex}
            />
          </>
        )}
      </main>

      <AddCoffeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchStash}
      />

      {activeItem && (
        <FeedbackModal
          isOpen={isFeedbackModalOpen}
          item={activeItem}
          onClose={() => setIsFeedbackModalOpen(false)}
          onSuccess={fetchStash}
        />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <LanguageProvider>
      <BaristaDashboard />
    </LanguageProvider>
  );
}
