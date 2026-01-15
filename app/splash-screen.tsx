"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/pwa/core/components/badge";

export default function SplashScreen({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if running as PWA (standalone mode)
    const checkPWAMode = () => {
      const isStandalone = window.matchMedia(
        "(display-mode: standalone)"
      ).matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      return isStandalone || isIOSStandalone;
    };

    // Show splash screen for PWA or first visit
    const shouldShowSplash =
      checkPWAMode() || !sessionStorage.getItem("visited");

    if (shouldShowSplash) {
      setIsInstalled(checkPWAMode());

      // Show splash for minimum 2 seconds
      const timer = setTimeout(() => {
        setIsLoading(false);
        sessionStorage.setItem("visited", "true");
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 transition-colors duration-300">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-linear-to-br from-black via-black/98 to-[oklch(0.14_0_0)]/30"></div>

        {/* Character Image */}
        <div className="relative mb-8 animate-bounce-slow z-10">
          <img
            src="/icon-512x512.png"
            alt="Coban Character"
            className="w-40 h-40 object-contain drop-shadow-[0_20px_35px_rgba(255,255,255,0.1)]"
          />

          {/* Glow effect around character */}
          <div className="absolute inset-0 w-40 h-40 bg-white/30 rounded-full blur-xl animate-pulse"></div>

          {/* Additional subtle glow */}
          <div className="absolute inset-0 w-40 h-40 bg-gray-400/20 rounded-full blur-2xl animate-pulse [animation-delay:0.5s]"></div>
        </div>

        {/* App Info */}
        <div className="text-center mb-6 z-10">
          <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
            Coban
          </h1>
          <Badge
            variant="secondary"
            className="text-sm bg-[oklch(0.25_0_0)]/80 text-white border-[oklch(0.25_0_0)]/30 backdrop-blur-sm"
          >
            Japanese Learning App
          </Badge>
          {isInstalled && (
            <Badge
              variant="outline"
              className="mt-2 text-xs flex items-center gap-1 mx-auto w-fit border-[oklch(0.26_0_0)]/50 bg-[oklch(0.14_0_0)]/50 backdrop-blur-sm text-[oklch(0.72_0_0)]"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-[oklch(0.32_0_0)]"
              >
                <polyline points="20,6 9,17 4,12" />
              </svg>
              App Installed
            </Badge>
          )}
        </div>

        {/* Simple Loading Dots */}
        <div className="flex space-x-2 z-10">
          <div className="w-3 h-3 bg-white/90 rounded-full animate-bounce [animation-delay:-0.3s] shadow-sm"></div>
          <div className="w-3 h-3 bg-white/90 rounded-full animate-bounce [animation-delay:-0.15s] shadow-sm"></div>
          <div className="w-3 h-3 bg-white/90 rounded-full animate-bounce shadow-sm"></div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
