# ParkSave

A GPS parking spot saver app built with React + Vite + Capacitor for Android.

Save your parking location with one tap, then navigate back to it with a live map and compass.

---

## Features

### Map
- Full-screen OpenStreetMap map as the home screen
- All saved spots shown as markers — tap a marker to see the name and navigate
- Live blue dot showing your current GPS position
- **Recenter button** — flies the map back to your location after panning
- Dark-themed map controls and popups

### Save a Spot
- One tap to save your current GPS coordinates
- Name the spot (e.g. Mall, Airport, Level B2)
- GPS accuracy indicator (green / yellow / red) before confirming
- Duplicate name detection

### Spots List
- All saved spots in a scrollable list
- **Parked timer** — shows how long ago you parked (e.g. "2h 15m ago"), updates every 30 seconds
- **Walking time estimate** — approximate walk time based on current distance (e.g. "~8 min walk")
- **Distance from current position** — live, updates as you move
- **Share** — sends a Google Maps link via Android share sheet (WhatsApp, Gmail, etc.)
- Swipe-to-confirm delete

### Navigate to a Spot
- Full-screen map centered on the route between you and the spot
- Dashed green line from your position to the spot
- **Compass arrow** — rotates in real time pointing toward the spot
- **Live distance** displayed in large text
- **"You're here!" overlay** when you arrive within 10 metres, with a one-tap option to remove the spot

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 18 + Vite 8 |
| Map | Leaflet + OpenStreetMap (no API key) |
| GPS | @capacitor/geolocation |
| Compass | DeviceOrientationEvent (web API) |
| Share | @capacitor/share |
| Storage | localStorage (offline, no backend) |
| Android | Ionic Capacitor 8 |

---

## Getting Started

### Web (browser preview)
```bash
npm install
npm run dev
```

### Android
```bash
npm run build
npx cap sync android
# Open android/ in Android Studio, then Run
```

### Requirements
- Node.js 18+
- Android Studio (for Android builds)
- A device or emulator with GPS support

---

## Permissions

| Permission | Why |
|---|---|
| `ACCESS_FINE_LOCATION` | Save and navigate to parking spots |
| `ACCESS_COARSE_LOCATION` | Fallback GPS |

No account, no cloud, no tracking. All data stays on your device.