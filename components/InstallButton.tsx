'use client'

import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [canInstall, setCanInstall] = useState(false)

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isIOSStandalone = (window.navigator as any).standalone === true
    
    if (isStandalone || isIOSStandalone) {
      setIsInstalled(true)
      return
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event caught by InstallButton')
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setCanInstall(true)
    }

    const handleAppInstalled = () => {
      console.log('App installed event caught by InstallButton')
      setIsInstalled(true)
      setCanInstall(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // For testing, show button after 3 seconds if no prompt
    const timer = setTimeout(() => {
      if (!isStandalone && !isIOSStandalone && !deferredPrompt) {
        setCanInstall(true)
      }
    }, 3000)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // Fallback for browsers without beforeinstallprompt
      alert('To install this app:\n\nChrome: Look for install icon in address bar\niOS Safari: Tap Share > Add to Home Screen\nAndroid: Tap menu > Add to Home Screen')
      return
    }

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setIsInstalled(true)
        setCanInstall(false)
      }
      
      setDeferredPrompt(null)
    } catch (error) {
      console.error('Install prompt failed:', error)
    }
  }

  if (isInstalled) {
    return (
      <button
        disabled
        className="w-full bg-green-100 text-green-800 px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 cursor-not-allowed dark:bg-green-900 dark:text-green-200"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="20,6 9,17 4,12"/>
        </svg>
        App Installed
      </button>
    )
  }

  return (
    <button
      onClick={handleInstall}
      className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
        canInstall 
          ? 'bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200' 
          : 'bg-gray-300 text-gray-600 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
      }`}
      disabled={!canInstall}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7,10 12,15 17,10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      {canInstall ? 'Install App' : 'Checking Install...'}
    </button>
  )
}