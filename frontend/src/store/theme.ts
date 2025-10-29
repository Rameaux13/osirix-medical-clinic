// Store pour gérer le thème (clair/sombre)
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light', // Mode CLAIR par défaut

      toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        console.log('📦 Store - Theme actuel:', currentTheme);
        console.log('📦 Store - Nouveau theme:', newTheme);

        set({ theme: newTheme });

        // Appliquer immédiatement au DOM
        if (typeof document !== 'undefined') {
          if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
            console.log('✅ DOM - Classe dark AJOUTÉE');
          } else {
            document.documentElement.classList.remove('dark');
            console.log('✅ DOM - Classe dark RETIRÉE');
          }

          // Vérification
          const hasClass = document.documentElement.classList.contains('dark');
          console.log('🔍 Vérification - Classe dark présente:', hasClass);
        }
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);

// Fonction pour initialiser le thème au chargement
export const initTheme = () => {
  if (typeof window === 'undefined') return;

  const stored = localStorage.getItem('theme-storage');
  let theme: Theme = 'light'; // Par défaut : clair

  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      theme = parsed.state?.theme || 'light';
    } catch {
      theme = 'light';
    }
  }

  // Appliquer au DOM
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};
