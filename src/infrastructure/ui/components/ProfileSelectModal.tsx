'use client';

import React, { useState } from 'react';
import { useUserProfile } from '../context/UserProfileContext';
import { useTranslation } from '../i18n/LanguageContext';
import { User, Check, Plus, X, Trash2 } from 'lucide-react';

export const ProfileSelectModal: React.FC = () => {
  const {
    profiles,
    activeProfile,
    isProfileModalOpen,
    setIsProfileModalOpen,
    selectProfile,
    createProfile,
    deleteProfile,
  } = useUserProfile();
  const { t } = useTranslation();

  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isProfileModalOpen) return null;

  const handleSelect = async (id: string) => {
    await selectProfile(id);
    setIsProfileModalOpen(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      const created = await createProfile(newName.trim());
      if (created) {
        setNewName('');
        setIsCreating(false);
        setIsProfileModalOpen(false);
      }
    } catch {
      setError('Error creating profile');
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteProfile(id);
  };

  const isAdmin = activeProfile?.role === 'admin';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#181310] border border-[#3A2E24] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#2C2119] flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#2E1D13] text-[#D96B27]">
                <User className="w-4 h-4" />
              </span>
              <h2 className="text-base font-serif font-bold text-[#F7F2EB]">
                {t.profiles.selectProfile}
              </h2>
            </div>
            <p className="text-xs text-[#A8988B] leading-relaxed">
              {t.profiles.syncSubtitle}
            </p>
          </div>
          {activeProfile && (
            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="text-[#8C7B6E] hover:text-[#F7F2EB] p-1.5 rounded-full hover:bg-[#281F18] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Profiles List */}
        <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            {profiles.map((p) => {
              const isActive = activeProfile?.id === p.id;
              const canDelete = isAdmin && !isActive && p.role !== 'admin';

              return (
                <div
                  key={p.id}
                  onClick={() => handleSelect(p.id)}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all active:scale-[0.99] cursor-pointer ${
                    isActive
                      ? 'bg-[#2E1D13] border-[#D96B27] shadow-sm shadow-[#D96B27]/10'
                      : 'bg-[#1C1612] border-[#30261E] hover:border-[#4D3A2C]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                        isActive
                          ? 'bg-[#D96B27] text-[#141210]'
                          : 'bg-[#2A2019] text-[#A8988B]'
                      }`}
                    >
                      {p.avatar || p.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-[#F7F2EB] truncate">
                          {p.name}
                        </span>
                        <span
                          className={`text-[10px] font-metric px-2 py-0.5 rounded-full border whitespace-nowrap ${
                            p.role === 'admin'
                              ? 'bg-[#24170E] border-[#D96B27]/50 text-[#E29D52]'
                              : 'bg-[#181310] border-[#30261E] text-[#8C7B6E]'
                          }`}
                        >
                          {p.role === 'admin' ? t.profiles.adminRole : t.profiles.userRole}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isActive && (
                      <div className="flex items-center gap-1 text-xs text-[#D96B27] font-medium font-metric">
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>{t.profiles.activeOnDevice}</span>
                      </div>
                    )}
                    {canDelete && (
                      <button
                        onClick={(e) => handleDelete(e, p.id)}
                        title="Borrar perfil"
                        className="p-1.5 text-[#8C7B6E] hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* New Profile Section */}
          {isCreating ? (
            <form onSubmit={handleCreate} className="p-3 bg-[#1C1612] border border-[#3A2E24] rounded-2xl space-y-3">
              <label className="text-xs font-medium text-[#C5B5A7] block">
                {t.profiles.addProfile}
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t.profiles.namePlaceholder}
                autoFocus
                className="w-full bg-[#120F0D] border border-[#3A2E24] rounded-xl px-3 py-2 text-sm text-[#F7F2EB] focus:outline-none focus:border-[#D96B27]"
              />
              {error && <p className="text-xs text-red-400">{error}</p>}
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 text-xs text-[#8C7B6E] hover:text-[#F7F2EB]"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={!newName.trim()}
                  className="px-4 py-1.5 bg-[#D96B27] text-[#141210] font-bold text-xs rounded-xl disabled:opacity-50"
                >
                  {t.profiles.createButton}
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full py-2.5 px-3 border border-dashed border-[#3A2E24] hover:border-[#D96B27] rounded-2xl text-xs text-[#A8988B] hover:text-[#F7F2EB] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#D96B27]" />
              <span>{t.profiles.addProfile}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
