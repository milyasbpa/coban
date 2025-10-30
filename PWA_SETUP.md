# PWA Setup untuk Coban

## Setup yang sudah dilakukan:

### 1. Dependencies
- Installed `next-pwa` package untuk PWA support

### 2. File Manifest (`public/manifest.json`)
- Konfigurasi aplikasi PWA dengan nama "Coban - Japanese Learning App"
- Icon support untuk berbagai ukuran (192x192, 256x256, 384x384, 512x512)
- Theme color: hitam (#000000)
- Background color: putih (#ffffff)
- Display mode: standalone (seperti native app)

### 3. Service Worker (`public/sw.js`)
- Caching strategy untuk offline support
- Cache aplikasi utama dan assets penting
- Auto-update cache ketika ada versi baru

### 4. Next.js Configuration (`next.config.ts`)
- PWA wrapper dengan next-pwa
- Turbopack compatibility configuration
- Service worker disabled di development mode

### 5. Layout Updates (`app/layout.tsx`)
- PWA metadata lengkap (title, description, manifest)
- Apple touch icon support
- Viewport configuration untuk mobile
- PWAInstaller component untuk register service worker

### 6. Assets
- Icon placeholder (SVG dan PNG format)
- Favicon.ico
- Browserconfig.xml untuk Windows tiles support
- Robots.txt untuk SEO

## Testing PWA:

1. Build aplikasi:
   ```bash
   npm run build
   ```

2. Jalankan production mode:
   ```bash
   npm start
   ```

3. Buka di browser: `http://localhost:3000`

4. Untuk test PWA functionality:
   - Buka Developer Tools > Application > Service Workers
   - Check "Offline" untuk test offline functionality
   - Look for "Install" prompt di address bar (Chrome/Edge)

## Deploy ke Vercel:

PWA ini siap untuk di-deploy ke Vercel. File-file berikut akan otomatis ter-handle:

- `public/manifest.json` - PWA manifest
- `public/sw.js` - Service worker
- `public/icon-*.png` - App icons
- Semua static assets lainnya

Setelah deploy, aplikasi akan:
- ✅ Installable sebagai PWA
- ✅ Berfungsi offline (basic functionality)
- ✅ Cache static assets
- ✅ Mobile-friendly
- ✅ Apple device compatible

## Next Steps (Optional):

1. Ganti icon placeholder dengan logo Coban yang sebenarnya
2. Tambah screenshots ke manifest untuk app store
3. Implement push notifications
4. Tambah advanced caching strategies
5. Add offline page