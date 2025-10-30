'use client'

import { useEffect, useState } from 'react'

export default function SplashScreen({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if running as PWA (standalone mode)
    const checkPWAMode = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isIOSStandalone = (window.navigator as any).standalone === true
      return isStandalone || isIOSStandalone
    }

    // Show splash screen for PWA or first visit
    const shouldShowSplash = checkPWAMode() || !sessionStorage.getItem('visited')
    
    if (shouldShowSplash) {
      setIsInstalled(checkPWAMode())
      
      // Show splash for minimum 2 seconds
      const timer = setTimeout(() => {
        setIsLoading(false)
        sessionStorage.setItem('visited', 'true')
      }, 2000)

      return () => clearTimeout(timer)
    } else {
      setIsLoading(false)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-bg-primary flex flex-col items-center justify-center z-50">
        {/* Character Image */}
        <div className="relative mb-8 animate-bounce-slow">
          <img 
            src="/icon-512x512.png" 
            alt="Coban Character" 
            className="w-40 h-40 object-contain drop-shadow-2xl"
          />
          
          {/* Glow effect around character */}
          <div className="absolute inset-0 w-40 h-40 bg-accent-primary/20 rounded-full blur-xl animate-pulse"></div>
        </div>
        
        {/* Simple Loading Dots */}
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-text-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-3 h-3 bg-text-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-3 h-3 bg-text-primary rounded-full animate-bounce"></div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}