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
        set({ 
          language: newLang, 
          isIndonesian: newLang === 'id' 
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
      partialize: (state) => ({ language: state.language }),
    }
  )
);