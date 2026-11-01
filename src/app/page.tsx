'use client';

import React, { useState, useEffect } from 'react';
import { LanguageProvider } from '@/adapters/ui/i18n/LanguageContext';
import { Header } from '@/adapters/ui/components/Header';
import { ActiveShelf } from '@/adapters/ui/components/ActiveShelf';
import { DialInCard } from '@/adapters/ui/components/DialInCard';
import { StashHistory } from '@/adapters/ui/components/StashHistory';
import { AddCoffeeModal } from '@/adapters/ui/components/AddCoffeeModal';
import { FeedbackModal } from '@/adapters/ui/components/FeedbackModal';
import { CoffeeDetailsModal } from '@/adapters/ui/components/CoffeeDetailsModal';
import { StashItemDTO } from '@/core/application/usecases/GetCoffeeStashUseCase';
import { Loader2 } from 'lucide-react';

function BaristaDashboard() {
  const [items, setItems] = useState<StashItemDTO[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
    <div className="min-h-screen bg-[#100D0B] text-[#F7F2EB] pb-12">
      <Header />

      <main className="max-w-md mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-[#D96B27]" />
            <span className="text-xs text-[#A8988B] font-metric">
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
              onOpenEditCoffee={(idx) => {
                setSelectedIndex(idx);
                setIsEditModalOpen(true);
              }}
            />

            {activeItem && (
              <div className="px-4 mt-5">
                <DialInCard
                  item={activeItem}
                  onOpenFeedback={() => setIsFeedbackModalOpen(true)}
                  onOpenEditCoffee={() => setIsEditModalOpen(true)}
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

      {activeItem && (
        <CoffeeDetailsModal
          isOpen={isEditModalOpen}
          coffee={activeItem.coffee}
          onClose={() => setIsEditModalOpen(false)}
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
