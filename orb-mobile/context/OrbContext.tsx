import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type OrbTheme = 'light' | 'dark' | 'automatic';
export type OrbLanguage = 'pt-BR' | 'en';

export type OrbProfile = {
  fullName: string;
  preferredName: string;
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  birthHour: string;
  birthMinute: string;
  noExactTime: boolean;
  birthCountry: string;
  birthState: string;
  birthCity: string;
  timezone: string;
  theme: OrbTheme;
  language: OrbLanguage;
  dailySynthesis: boolean;
  synthesisHour: string;
};

type OrbContextValue = {
  profile: OrbProfile | null;
  preferences: OrbPreferences;
  hydrated: boolean;
  saveProfile: (profile: OrbProfile) => Promise<void>;
  savePreferences: (preferences: Partial<OrbPreferences>) => Promise<void>;
  clearProfile: () => Promise<void>;
};

const STORAGE_KEY = '@orb/profile';
const PREFERENCES_KEY = '@orb/preferences';
export const DEFAULT_PREFERENCES: OrbPreferences = { theme: 'light', language: 'pt-BR' };
const OrbContext = createContext<OrbContextValue | null>(null);

export type OrbPreferences = {
  theme: OrbTheme;
  language: OrbLanguage;
};

export function OrbProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<OrbProfile | null>(null);
  const [preferences, setPreferences] = useState<OrbPreferences>(DEFAULT_PREFERENCES);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(STORAGE_KEY), AsyncStorage.getItem(PREFERENCES_KEY)])
      .then(([profileValue, preferencesValue]) => {
        const savedProfile = profileValue
          ? ({ birthCountry: '', birthState: '', ...JSON.parse(profileValue) } as OrbProfile)
          : null;
        const savedPreferences = preferencesValue ? (JSON.parse(preferencesValue) as OrbPreferences) : null;
        setProfile(savedProfile);
        setPreferences(savedPreferences ?? (savedProfile ? { theme: savedProfile.theme, language: savedProfile.language } : DEFAULT_PREFERENCES));
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  const value = useMemo<OrbContextValue>(
    () => ({
      profile,
      preferences,
      hydrated,
      saveProfile: async (nextProfile) => {
        setProfile(nextProfile);
        const nextPreferences = { theme: nextProfile.theme, language: nextProfile.language };
        setPreferences(nextPreferences);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextProfile));
        await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(nextPreferences));
      },
      savePreferences: async (patch) => {
        const nextPreferences = { ...preferences, ...patch };
        setPreferences(nextPreferences);
        await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(nextPreferences));
        if (profile) {
          const nextProfile = { ...profile, ...patch };
          setProfile(nextProfile);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextProfile));
        }
      },
      clearProfile: async () => {
        setProfile(null);
        await AsyncStorage.removeItem(STORAGE_KEY);
      },
    }),
    [hydrated, preferences, profile],
  );

  return <OrbContext.Provider value={value}>{children}</OrbContext.Provider>;
}

export function useOrb() {
  const context = useContext(OrbContext);
  if (!context) throw new Error('useOrb must be used inside OrbProvider');
  return context;
}