# PWA Debug Guide

## Cek PWA Status di Browser:

### Chrome DevTools:
1. Buka DevTools (F12)
2. Go to **Application** tab
3. Check **Service Workers** section
4. Check **Manifest** section 
5. Look di **Installability** untuk errors

### Cara Memunculkan Install Prompt:

1. **Desktop (Chrome/Edge):**
   - Lihat icon install di address bar (⊕ atau ⬇️)
   - Atau floating button di kanan atas
   - Atau tombol "Install App" di halaman utama

2. **Mobile (Chrome/Safari):**
   - Chrome: Menu → "Add to Home screen"
   - Safari: Share button → "Add to Home Screen"

3. **Manual Test:**
   - Buka `http://localhost:3000`
   - Check console untuk Service Worker logs
   - Check Network tab untuk `/sw.js` request

### Troubleshooting:

**Jika tombol install tidak muncul:**
1. Clear browser cache & cookies
2. Open in Incognito mode
3. Check PWA criteria:
   - ✅ HTTPS (localhost OK)
   - ✅ Valid manifest.json
   - ✅ Service worker registered
   - ✅ Icons available
   - ✅ Display: standalone

**Force PWA Detection:**
- Add `?standalone=true` to URL
- Or manually trigger via console:
```javascript
// In browser console:
navigator.serviceWorker.register('/sw.js')
```

### Verify Files:
- http://localhost:3000/manifest.json
- http://localhost:3000/sw.js
- http://localhost:3000/icon-192x192.png