import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LanguageState {
  language: 'id' | 'en';
  isIndonesian: boolean;
  toggleLanguage: () => void;
  setLanguage: (lang: 'id' | 'en') => void;
}

export const useLanguage = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'id',
      isIndonesian: true,
      
      toggleLanguage: () => {
        const currentLang = get().language;
        const newLang = currentLang === 'id' ? 'en' : 'id';
        const newIsIndonesian = newLang === 'id';
        
        set({ 
          language: newLang, 
          isIndonesian: newIsIndonesian
        });
      },
      
      setLanguage: (lang: 'id' | 'en') => {
        set({ 
          language: lang, 
          isIndonesian: lang === 'id' 
        });
      },
    }),
    {
      name: 'language-storage',
      partialize: (state) => ({ 
        language: state.language, 
        isIndonesian: state.isIndonesian 
      }),
      // Ensure proper rehydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Sync isIndonesian with language after rehydration
          state.isIndonesian = state.language === 'id';
        }
      },
    }
  )
);