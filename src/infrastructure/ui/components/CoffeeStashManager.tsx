'use client';

import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { StashItemDTO } from '@/core/application/usecases/GetCoffeeStashUseCase';
import { Coffee } from '@/core/domain/coffee/Coffee';
import { CoffeeCardItem } from './CoffeeCardItem';
import { Plus, Archive, Sparkles, Edit, Trash2 } from 'lucide-react';

interface CoffeeStashManagerProps {
  items: StashItemDTO[];
  onSelectForBrew: (coffeeId: string) => void;
  onEditCoffee: (coffee: Coffee) => void;
  onToggleStatus: (coffeeId: string, currentStatus: string) => void;
  onDeleteCoffee?: (coffeeId: string) => void;
  onOpenAddModal: () => void;
}

export const CoffeeStashManager: React.FC<CoffeeStashManagerProps> = ({
  items,
  onSelectForBrew,
  onEditCoffee,
  onToggleStatus,
  onDeleteCoffee,
  onOpenAddModal,
}) => {
  const { t, language, isAdmin } = useTranslation();
  const activeItems = items.filter(i => i.coffee.status !== 'history');
  const historyItems = items.filter(i => i.coffee.status === 'history');

  const handleDelete = (id: string, name: string) => {
    const msg = language === 'es'
      ? `¿Eliminar permanentemente "${name}" del historial?`
      : `Permanently delete "${name}" from history?`;
    if (window.confirm(msg)) {
      onDeleteCoffee?.(id);
    }
  };

  return (
    <div className="space-y-6 px-4 py-4 pb-24">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-xl font-bold text-[#F7F2EB]">
            {t.stashCollection}
          </h2>
          <p className="text-xs text-[#A8988B]">
            {activeItems.length} {t.stashActive.toLowerCase()} • {historyItems.length} {t.history.toLowerCase()}
          </p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 bg-[#D96B27] hover:bg-[#E29D52] text-[#141210] font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{t.addCoffee}</span>
        </button>
      </div>

      {/* Section 1: Cafés en Uso */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#E29D52] flex items-center gap-1.5 mb-3 font-metric">
          <Sparkles className="w-3.5 h-3.5" />
          {t.stashActive} ({activeItems.length})
        </h3>

        {activeItems.length === 0 ? (
          <div className="bg-[#181411] border border-[#30261E] rounded-2xl p-6 text-center text-xs text-[#A8988B]">
            {t.emptyStash}
          </div>
        ) : (
          <div className="space-y-3">
            {activeItems.map(item => (
              <CoffeeCardItem
                key={item.coffee.id}
                item={item}
                onSelectForBrew={onSelectForBrew}
                onEditCoffee={onEditCoffee}
                onToggleStatus={onToggleStatus}
              />
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Historial / Bodega */}
      {historyItems.length > 0 && (
        <div className="pt-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A8988B] flex items-center gap-1.5 mb-3 font-metric">
            <Archive className="w-3.5 h-3.5" />
            {t.stashHistory} ({historyItems.length})
          </h3>

          <div className="space-y-2">
            {historyItems.map(item => {
              const c = item.coffee;
              return (
                <div
                  key={c.id}
                  className="bg-[#14100D] border border-[#261E18] rounded-xl p-3 flex items-center justify-between text-xs opacity-75 hover:opacity-100 transition-opacity"
                >
                  <div>
                    <span className="text-[10px] text-[#E29D52] font-metric uppercase block">
                      {c.roaster}
                    </span>
                    <h5 className="font-serif font-bold text-sm text-[#F7F2EB]">{c.name}</h5>
                    <span className="text-[10px] text-[#A8988B]">{c.originCountry}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditCoffee(c)}
                      className="p-1.5 text-[#A8988B] hover:text-[#F7F2EB] transition-colors"
                      title={t.editCoffee}
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onToggleStatus(c.id, c.status)}
                      className="text-[11px] text-[#A8988B] hover:text-[#E29D52] hover:bg-[#201813] border border-[#2F241C] px-2.5 py-1 rounded-lg transition-colors"
                    >
                      {t.moveToActive}
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(c.id, c.name)}
                        className="p-1.5 text-red-500 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition-colors"
                        title={language === 'es' ? 'Eliminar café (Admin)' : 'Delete coffee (Admin)'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
