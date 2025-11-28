import { useEffect } from 'react';
import { useLoginStore } from '../store/login.store';

/**
 * Simple hook to initialize Firebase auth state listener
 * Call this once in your root component or layout
 */
export function useAuthInitialize() {
  const { initializeAuthListener, isInitialized } = useLoginStore();

  useEffect(() => {
    if (!isInitialized) {
      initializeAuthListener();
    }
  }, [initializeAuthListener, isInitialized]);

  return { isInitialized };
}