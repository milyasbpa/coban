'use client'

import { useEffect, useState } from 'react'
import { Badge } from "@/pwa/core/components/badge"

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
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50">
        {/* Character Image */}
        <div className="relative mb-8 animate-bounce-slow">
          <img 
            src="/icon-512x512.png" 
            alt="Coban Character" 
            className="w-40 h-40 object-contain drop-shadow-2xl"
          />
          
          {/* Glow effect around character */}
          <div className="absolute inset-0 w-40 h-40 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
        </div>
        
        {/* App Info */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Coban</h1>
          <Badge variant="secondary" className="text-sm">
            Japanese Learning App
          </Badge>
          {isInstalled && (
            <Badge variant="outline" className="mt-2 text-xs flex items-center gap-1 mx-auto w-fit">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
              App Installed
            </Badge>
          )}
        </div>
        
        {/* Simple Loading Dots */}
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-3 h-3 bg-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-3 h-3 bg-foreground rounded-full animate-bounce"></div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}