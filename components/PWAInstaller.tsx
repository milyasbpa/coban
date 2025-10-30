'use client'

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallButton, setShowInstallButton] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        })
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration)
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error)
        })
    }

    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isIOSStandalone = (window.navigator as any).standalone === true
    
    if (isStandalone || isIOSStandalone) {
      setIsInstalled(true)
      return
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event fired')
      e.preventDefault()
      const event = e as BeforeInstallPromptEvent
      setDeferredPrompt(event)
      setShowInstallButton(true)
    }

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      console.log('App was installed')
      setIsInstalled(true)
      setShowInstallButton(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt')
        setShowInstallButton(false)
        setIsInstalled(true)
      } else {
        console.log('User dismissed the install prompt')
      }
      
      setDeferredPrompt(null)
    } catch (error) {
      console.error('Error during installation:', error)
    }
  }

  // Show install status for installed apps
  if (isInstalled) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm">
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <polyline points="20,6 9,17 4,12"/>
          </svg>
          App Installed
        </div>
      </div>
    )
  }

  if (!showInstallButton) return null

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={handleInstallClick}
        className="bg-black text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm animate-pulse"
      >
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7,10 12,15 17,10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Install App
      </button>
    </div>
  )
}