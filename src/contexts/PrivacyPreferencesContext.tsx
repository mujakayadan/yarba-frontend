import React, {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const STORAGE_KEY = 'yarba_privacy_preferences';
const STORAGE_VERSION = 1;

interface StoredPrivacyPreferences {
  version: number;
  analytics_enabled: boolean;
}

interface PrivacyPreferencesContextValue {
  analyticsEnabled: boolean;
  setAnalyticsEnabled: (enabled: boolean) => void;
}

const getStorageKey = (subjectId?: string): string => `${STORAGE_KEY}:${subjectId ?? 'anonymous'}`;

const readPreferences = (storageKey: string): StoredPrivacyPreferences => {
  try {
    const value = window.localStorage.getItem(storageKey);
    if (!value) {
      return { version: STORAGE_VERSION, analytics_enabled: false };
    }
    const parsed = JSON.parse(value) as Partial<StoredPrivacyPreferences>;
    if (parsed.version !== STORAGE_VERSION || typeof parsed.analytics_enabled !== 'boolean') {
      return { version: STORAGE_VERSION, analytics_enabled: false };
    }
    return parsed as StoredPrivacyPreferences;
  } catch {
    return { version: STORAGE_VERSION, analytics_enabled: false };
  }
};

const PrivacyPreferencesContext = createContext<PrivacyPreferencesContextValue | null>(null);

interface PrivacyPreferencesProviderProps {
  children: ReactNode;
  subjectId?: string;
}

export const PrivacyPreferencesProvider: React.FC<PrivacyPreferencesProviderProps> = ({
  children,
  subjectId,
}) => {
  const storageKey = getStorageKey(subjectId);
  const [preferences, setPreferences] = useState<StoredPrivacyPreferences>(() =>
    readPreferences(storageKey)
  );

  useEffect(() => {
    setPreferences(readPreferences(storageKey));
  }, [storageKey]);

  const value = useMemo<PrivacyPreferencesContextValue>(
    () => ({
      analyticsEnabled: preferences.analytics_enabled,
      setAnalyticsEnabled: (enabled) => {
        const next = { version: STORAGE_VERSION, analytics_enabled: enabled };
        window.localStorage.setItem(storageKey, JSON.stringify(next));
        setPreferences(next);
      },
    }),
    [preferences.analytics_enabled, storageKey]
  );

  return (
    <PrivacyPreferencesContext.Provider value={value}>
      {children}
    </PrivacyPreferencesContext.Provider>
  );
};

export const usePrivacyPreferences = (): PrivacyPreferencesContextValue => {
  const context = useContext(PrivacyPreferencesContext);
  if (!context) {
    throw new Error('usePrivacyPreferences must be used within PrivacyPreferencesProvider');
  }
  return context;
};
