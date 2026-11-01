'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, UserProfileProps, UserRole } from '@/domain/user/UserProfile';

interface UserProfileContextType {
  profiles: UserProfile[];
  activeProfile: UserProfile | null;
  isLoading: boolean;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  selectProfile: (id: string) => Promise<void>;
  updateActiveCoffee: (coffeeId: string | null) => Promise<void>;
  updateSettings: (patch: { role?: UserRole; language?: 'es' | 'en' }) => Promise<void>;
  updateEquipment: (grinderId: string, machineId: string, basketDoseGrams?: number) => Promise<void>;
  createProfile: (name: string, role?: UserRole) => Promise<UserProfile | null>;
  deleteProfile: (id: string) => Promise<boolean>;
  refreshProfiles: () => Promise<void>;
}

const STORAGE_KEY = 'barista_active_profile_id';

const UserProfileContext = createContext<UserProfileContextType>({
  profiles: [],
  activeProfile: null,
  isLoading: true,
  isProfileModalOpen: false,
  setIsProfileModalOpen: () => {},
  selectProfile: async () => {},
  updateActiveCoffee: async () => {},
  updateSettings: async () => {},
  updateEquipment: async () => {},
  createProfile: async () => null,
  deleteProfile: async () => false,
  refreshProfiles: async () => {},
});

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const fetchProfiles = useCallback(async () => {
    try {
      const res = await fetch('/api/profiles');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const mapped = data.data.map((p: UserProfileProps) => new UserProfile(p));
        setProfiles(mapped);

        const savedId = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
        const current = savedId ? mapped.find((p: UserProfile) => p.id === savedId) : null;

        if (current) {
          setActiveProfile(current);
        } else {
          setActiveProfile(null);
          setIsProfileModalOpen(true);
        }
      }
    } catch (e) {
      console.error('Failed to fetch user profiles', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const selectProfile = async (id: string) => {
    const target = profiles.find((p: UserProfile) => p.id === id);
    if (target) {
      setActiveProfile(target);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, target.id);
      }
      setIsProfileModalOpen(false);
    }
  };

  const updateActiveCoffee = async (coffeeId: string | null) => {
    if (!activeProfile) return;
    const updated = activeProfile.withActiveCoffee(coffeeId);
    setActiveProfile(updated);
    try {
      await fetch(`/api/profiles/${activeProfile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeCoffeeId: coffeeId }),
      });
    } catch (e) {
      console.error('Failed to sync active coffee', e);
    }
  };

  const updateSettings = async (patch: { role?: UserRole; language?: 'es' | 'en' }) => {
    if (!activeProfile) return;
    const updated = activeProfile.update(patch);
    setActiveProfile(updated);
    setProfiles((prev: UserProfile[]) => prev.map((p: UserProfile) => (p.id === updated.id ? updated : p)));
    try {
      await fetch(`/api/profiles/${activeProfile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
    } catch (e) {
      console.error('Failed to sync profile settings', e);
    }
  };

  const updateEquipment = async (grinderId: string, machineId: string, basketDoseGrams?: number) => {
    if (!activeProfile) return;
    const updated = activeProfile.withEquipment(grinderId, machineId, basketDoseGrams);
    setActiveProfile(updated);
    setProfiles((prev: UserProfile[]) =>
      prev.map((p: UserProfile) => (p.id === updated.id ? updated : p))
    );
    try {
      await fetch(`/api/profiles/${activeProfile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grinderId, machineId, basketDoseGrams }),
      });
    } catch (e) {
      console.error('Failed to sync equipment', e);
    }
  };

  const createProfile = async (name: string, role?: UserRole) => {
    try {
      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, role: role ?? 'user' }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        const newProf = new UserProfile(data.data);
        setProfiles((prev) => [...prev, newProf]);
        setActiveProfile(newProf);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, newProf.id);
        }
        return newProf;
      }
    } catch (e) {
      console.error('Failed to create profile', e);
    }
    return null;
  };

  const deleteProfile = async (id: string): Promise<boolean> => {
    if (!activeProfile || activeProfile.role !== 'admin') return false;
    try {
      const res = await fetch(`/api/profiles/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-role': activeProfile.role,
          'x-user-id': activeProfile.id,
        },
      });
      const data = await res.json();
      if (data.success) {
        setProfiles((prev) => prev.filter((p) => p.id !== id));
        return true;
      }
    } catch (e) {
      console.error('Failed to delete profile', e);
    }
    return false;
  };

  return (
    <UserProfileContext.Provider
      value={{
        profiles, activeProfile, isLoading, isProfileModalOpen, setIsProfileModalOpen,
        selectProfile, updateActiveCoffee, updateSettings, updateEquipment,
        createProfile, deleteProfile, refreshProfiles: fetchProfiles,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => useContext(UserProfileContext);
