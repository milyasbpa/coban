import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Coban - Japanese Learning App',
    short_name: 'Coban',
    description: 'Learn Japanese with Coban - Your Japanese learning companion',
    start_url: '/',
    display: 'standalone',
    display_override: ['window-controls-overlay', 'standalone'],
    background_color: '#000000', // Black background for splash screen
    theme_color: '#000000',
    orientation: 'any',
    scope: '/',
    categories: ['education', 'productivity'],
    lang: 'en',
    dir: 'ltr',
    icons: [
      // Standard icons for different sizes
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      // Maskable icons for Android adaptive icons
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      },
      // Additional sizes for better Android support
      {
        src: '/icon-192x192.png',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icon-192x192.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'any'
      }
    ]
  }
}