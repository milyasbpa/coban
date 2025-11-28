import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/pwa/core/config/firebase';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface LoginState {
  // Authentication state
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  isInitialized: boolean; // Track if auth state is loaded

  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setUser: (user: User | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  loginSuccess: (user: User) => void;
  logout: () => void;
  clearError: () => void;
  initializeAuthListener: () => void;
}

export const useLoginStore = create<LoginState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,
      isInitialized: false,

      // Actions
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setUser: (user) => set({ user }),
      setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),
      setInitialized: (initialized) => set({ isInitialized: initialized }),

      loginSuccess: (user) => set({
        isAuthenticated: true,
        user,
        loading: false,
        error: null,
      }),

      logout: () => set({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      }),

      clearError: () => set({ error: null }),

      // Initialize auth state listener
      initializeAuthListener: () => {
        const { loginSuccess, logout, setInitialized } = get();
        
        onAuthStateChanged(auth, (firebaseUser) => {
          if (firebaseUser) {
            // User is signed in
            loginSuccess({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
            });
          } else {
            // User is signed out
            logout();
          }
          setInitialized(true);
        });
      },
    }),
    {
      name: 'login-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);