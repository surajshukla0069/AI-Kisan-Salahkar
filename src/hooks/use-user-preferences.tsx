import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Language = 'hi' | 'en' | 'pa' | 'mr';
export type UserPreferences = {
  language: Language;
  location: string;
  latitude?: number;
  longitude?: number;
  state?: string;
  district?: string;
  crops?: string[];
};

interface PreferencesContextType {
  preferences: UserPreferences | null;
  setPreferences: (prefs: UserPreferences) => Promise<void>;
  isLoading: boolean;
}

const PreferencesContext = createContext<PreferencesContextType>({
  preferences: null,
  setPreferences: async () => {},
  isLoading: true,
});

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferencesState] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      // Get user ID from localStorage
      const userId = localStorage.getItem('kisan_user_id');
      if (userId) {
        const stored = localStorage.getItem(`user_prefs_${userId}`);
        if (stored) {
          setPreferencesState(JSON.parse(stored));
        }
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setPreferences = async (prefs: UserPreferences) => {
    try {
      const userId = localStorage.getItem('kisan_user_id');
      if (userId) {
        localStorage.setItem(`user_prefs_${userId}`, JSON.stringify(prefs));
        setPreferencesState(prefs);
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
      throw error;
    }
  };

  return (
    <PreferencesContext.Provider value={{ preferences, setPreferences, isLoading }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('useUserPreferences must be used within UserPreferencesProvider');
  }
  return context;
}
