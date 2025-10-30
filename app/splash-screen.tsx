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
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 transition-all duration-500">
        {/* App Icon with animation */}
        <div className="relative mb-8">
          <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center shadow-2xl transform transition-transform duration-1000 hover:scale-110">
            <span className="text-6xl font-bold text-black select-none">C</span>
          </div>
          
          {/* Animated ring */}
          <div className="absolute inset-0 w-32 h-32 border-4 border-white/20 rounded-3xl animate-pulse"></div>
          <div className="absolute inset-2 w-28 h-28 border-2 border-white/10 rounded-2xl animate-ping"></div>
        </div>
        
        {/* App Name with slide-in animation */}
        <div className="text-center mb-8 transform transition-all duration-1000 delay-300">
          <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">Coban Bas</h1>
          <p className="text-gray-300 text-xl font-medium">Japanese Learning App</p>
          {isInstalled && (
            <p className="text-green-400 text-sm mt-2 flex items-center justify-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
              App Installed
            </p>
          )}
        </div>
        
        {/* Loading Animation */}
        <div className="flex space-x-3 mb-8">
          <div className="w-4 h-4 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-4 h-4 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-4 h-4 bg-white rounded-full animate-bounce"></div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-72 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-white progress-bar rounded-full"></div>
        </div>
        
        {/* Loading text */}
        <p className="text-gray-400 text-sm mt-6 animate-pulse">Loading your Japanese journey...</p>
      </div>
    )
  }

  return <>{children}</>
}