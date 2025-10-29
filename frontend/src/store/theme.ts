// src/store/theme.ts - Store Zustand pour gérer le thème Dark/Light

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light', // Mode clair par défaut

      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: newTheme });

        // Appliquer la classe au document
        if (typeof window !== 'undefined') {
          if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },

      setTheme: (theme: Theme) => {
        set({ theme });

        // Appliquer la classe au document
        if (typeof window !== 'undefined') {
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },
    }),
    {
      name: 'osirix-theme-store',
      onRehydrateStorage: () => (state) => {
        // Appliquer le thème au chargement
        if (typeof window !== 'undefined') {
          if (state && state.theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            // S'assurer que le mode clair est bien appliqué par défaut
            document.documentElement.classList.remove('dark');
          }
        }
      },
    }
  )
);
