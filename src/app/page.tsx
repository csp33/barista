'use client';

import React, { useState, useEffect } from 'react';
import { UserProfileProvider, useUserProfile } from '@/infrastructure/ui/context/UserProfileContext';
import { LanguageProvider, useTranslation } from '@/infrastructure/ui/i18n/LanguageContext';
import { Header } from '@/infrastructure/ui/components/Header';
import { DialInCard } from '@/infrastructure/ui/components/DialInCard';
import { AddCoffeeModal } from '@/infrastructure/ui/components/AddCoffeeModal';
import { FeedbackModal } from '@/infrastructure/ui/components/FeedbackModal';
import { CoffeeDetailsModal } from '@/infrastructure/ui/components/CoffeeDetailsModal';
import { ProfileSelectModal } from '@/infrastructure/ui/components/ProfileSelectModal';
import { BottomNav, NavTab } from '@/infrastructure/ui/components/BottomNav';
import { CoffeeStashManager } from '@/infrastructure/ui/components/CoffeeStashManager';
import { EquipmentView } from '@/infrastructure/ui/components/EquipmentView';
import { StashItemDTO } from '@/core/application/usecases/GetCoffeeStashUseCase';
import {
  findPresetGrinderById,
  findPresetMachineById,
} from '@/infrastructure/equipment/EquipmentCatalogRepository';
import { Coffee, CoffeeProps } from '@/core/domain/coffee/Coffee';
import { Loader2, Sparkles, ArrowLeft } from 'lucide-react';

function BaristaDashboard() {
  const { t, isAdmin } = useTranslation();
  const { activeProfile, updateActiveCoffee } = useUserProfile();
  const [activeTab, setActiveTab] = useState<NavTab>('stash');
  const [items, setItems] = useState<StashItemDTO[]>([]);
  const [activeCoffeeId, setActiveCoffeeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [editingCoffee, setEditingCoffee] = useState<Coffee | Partial<CoffeeProps> | null>(null);
  const [isNewCoffeeReview, setIsNewCoffeeReview] = useState(false);

  const fetchStash = async () => {
    try {
      const uid = activeProfile?.id;
      if (!uid) {
        setItems([]);
        setLoading(false);
        return;
      }
      const res = await fetch(`/api/coffees?userId=${uid}`);
      const data = await res.json();
      if (data.success && data.data) {
        setItems(data.data);
        if (!activeCoffeeId && data.data.length > 0) {
          const profileChoice = activeProfile?.activeCoffeeId;
          const matched = profileChoice ? data.data.find((i: StashItemDTO) => i.coffee.id === profileChoice) : null;
          const firstActive = data.data.find((i: StashItemDTO) => i.coffee.status !== 'history');
          setActiveCoffeeId(matched ? matched.coffee.id : firstActive ? firstActive.coffee.id : data.data[0].coffee.id);
        }
      }
    } catch (e) {
      console.error('Failed to load stash', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStash();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProfile?.id]);

  useEffect(() => {
    if (activeProfile?.activeCoffeeId) {
      setActiveCoffeeId(activeProfile.activeCoffeeId);
    }
  }, [activeProfile?.activeCoffeeId]);

  const activeItem = items.find((i) => i.coffee.id === activeCoffeeId) || items[0] || null;
  const activeCount = items.filter((i) => i.coffee.status !== 'history').length;

  const handleToggleStatus = async (coffeeId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'history' ? 'active' : 'history';
    try {
      await fetch(`/api/coffees/${coffeeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      fetchStash();
    } catch { alert('Error updating status'); }
  };

  const handleScraped = (s: Partial<CoffeeProps>) => { setEditingCoffee(s); setIsNewCoffeeReview(true); };
  const handleOpenEdit = (c: Coffee) => { setEditingCoffee(c); setIsNewCoffeeReview(false); };
  const handleSelectBrew = (id: string) => {
    setActiveCoffeeId(id);
    setActiveTab('bar');
    updateActiveCoffee(id);
  };
  const handleDeleteCoffee = async (id: string) => {
    try {
      const res = await fetch(`/api/coffees/${id}`, { method: 'DELETE', headers: { 'x-user-role': isAdmin ? 'admin' : 'user' } });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to delete');
      fetchStash();
    } catch (e) { alert(e instanceof Error ? e.message : 'Error deleting'); }
  };

  return (
    <div className="min-h-screen bg-[#14100D] text-[#F7F2EB] flex flex-col">
      <Header onGoHome={() => setActiveTab('stash')} />
      <main className="flex-1 max-w-2xl mx-auto w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#D96B27]" />
            <span className="text-xs text-[#A8988B] font-metric">Cargando estación barista...</span>
          </div>
        ) : (
          <>
            {activeTab === 'bar' && (
              <div className="px-4 py-3 pb-24 space-y-3">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setActiveTab('stash')}
                    className="flex items-center gap-1.5 text-xs text-[#E29D52] hover:text-[#F7F2EB] font-medium transition-colors py-1.5 px-3 rounded-xl bg-[#1C1612] border border-[#3A2D23] active:scale-95"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-[#D96B27]" />
                    <span>{t.backToStash}</span>
                  </button>
                  {activeItem?.recipe && (
                    <span className="text-[10px] font-metric text-[#8C7B6E] bg-[#14100D] px-2.5 py-1 rounded-full border border-[#2B211A] uppercase">
                      {findPresetMachineById(activeItem.recipe.machineId).brand} {findPresetMachineById(activeItem.recipe.machineId).portafilterSizeMm}mm • {findPresetGrinderById(activeItem.recipe.grinderId).brand}
                    </span>
                  )}
                </div>
                {activeItem ? (
                  <DialInCard item={activeItem} onOpenFeedback={() => setIsFeedbackModalOpen(true)} onOpenEditCoffee={() => handleOpenEdit(activeItem.coffee)} />
                ) : (
                  <div className="bg-[#1A1512] border border-[#332820] rounded-3xl p-8 text-center space-y-4 my-8">
                    <Sparkles className="w-10 h-10 text-[#D96B27] mx-auto opacity-70" />
                    <h3 className="font-serif font-bold text-lg text-[#F7F2EB]">No hay café seleccionado en la barra</h3>
                    <p className="text-xs text-[#A8988B] mt-1">{t.emptyStash}</p>
                    <button onClick={() => setActiveTab('stash')} className="bg-[#D96B27] text-[#141210] font-bold text-xs px-5 py-3 rounded-xl inline-block">Ir a Mi Colección</button>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'stash' && (
              <CoffeeStashManager items={items} onSelectForBrew={handleSelectBrew} onEditCoffee={handleOpenEdit} onToggleStatus={handleToggleStatus} onDeleteCoffee={handleDeleteCoffee} onOpenAddModal={() => setIsAddModalOpen(true)} />
            )}
            {activeTab === 'gear' && <EquipmentView onEquipmentSaved={fetchStash} />}
          </>
        )}
      </main>
      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} activeCount={activeCount} />
      <AddCoffeeModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onScraped={handleScraped} />
      {editingCoffee && (
        <CoffeeDetailsModal key={(editingCoffee as Coffee).id || 'new-scraped'} isOpen={Boolean(editingCoffee)} coffee={editingCoffee} isNew={isNewCoffeeReview} onClose={() => { setEditingCoffee(null); setIsNewCoffeeReview(false); }} onSuccess={fetchStash} />
      )}
      {activeItem && (
        <FeedbackModal key={`${activeItem.coffee.id}-${activeItem.recipe?.id}-${activeItem.recipe?.grindSetting}`} isOpen={isFeedbackModalOpen} item={activeItem} onClose={() => setIsFeedbackModalOpen(false)} onSuccess={fetchStash} />
      )}
      <ProfileSelectModal />
    </div>
  );
}

export default function Home() {
  return (
    <UserProfileProvider>
      <LanguageProvider>
        <BaristaDashboard />
      </LanguageProvider>
    </UserProfileProvider>
  );
}
