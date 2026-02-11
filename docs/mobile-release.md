# Mobile Release Guide

## Prerequisites

- Node.js 18+ and npm
- Xcode 15+ (for iOS, Mac only)
- Android Studio (for Android)
- An Apple Developer account (for App Store)
- A Google Play Developer account (for Play Store)

## Project Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd silvery-sleep-expert
   npm install
   ```

2. **Add native platforms:**
   ```bash
   npx cap add ios
   npx cap add android
   ```

3. **Build and sync:**
   ```bash
   npm run build
   npx cap sync
   ```

## Development (Hot Reload)

The `capacitor.config.ts` is pre-configured with a dev server URL. During development:

```bash
npx cap run ios        # Run on iOS simulator
npx cap run android    # Run on Android emulator
```

## Production Build

For store submission, update `capacitor.config.ts` to remove the `server.url` field so the app loads from local bundled assets:

```typescript
const config: CapacitorConfig = {
  appId: 'com.silvery.sleepexpert',
  appName: 'Silvery Sleep Expert',
  webDir: 'dist',
  // Remove server.url for production
};
```

Then:
```bash
npm run build
npx cap sync
```

## iOS Release

### 1. Open in Xcode
```bash
npx cap open ios
```

### 2. Configure signing
- Select the project in the navigator
- Go to **Signing & Capabilities**
- Select your Team
- Set Bundle Identifier: `com.silvery.sleepexpert`

### 3. Version numbers
- Update **Version** (e.g., `1.0.0`) and **Build** (e.g., `1`) in General tab
- Or edit `ios/App/App.xcodeproj/project.pbxproj`

### 4. App Icons
- Replace icons in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
- Use a tool like [App Icon Generator](https://www.appicon.co/) to generate all required sizes from the 512x512 source

### 5. Archive and submit
- Select **Any iOS Device** as build target
- **Product → Archive**
- In Organizer: **Distribute App → App Store Connect**
- Upload and submit through App Store Connect

## Android Release

### 1. Open in Android Studio
```bash
npx cap open android
```

### 2. App Icons
- Right-click `app/src/main/res` → **New → Image Asset**
- Use the 512x512 source icon
- Generate all density-specific icons

### 3. Version numbers
Edit `android/app/build.gradle`:
```groovy
versionCode 1
versionName "1.0.0"
```

### 4. Generate signed AAB
- **Build → Generate Signed Bundle / APK**
- Choose **Android App Bundle**
- Create or select a keystore
- Build release AAB

**Keep your keystore file safe!** You need it for every update.

### 5. Upload to Play Console
- Go to Google Play Console
- Create app → Upload AAB
- Complete the store listing

## Common WebView Issues

| Issue | Fix |
|-------|-----|
| White screen on load | Ensure `webDir: 'dist'` and run `npm run build && npx cap sync` |
| API calls failing | Check `allowNavigation` in capacitor config includes your Supabase domain |
| Keyboard covers input | The app uses `viewport-fit=cover` and safe-area CSS — should work automatically |
| Status bar overlap | Already handled via `apple-mobile-web-app-status-bar-style` meta tag |
| OAuth redirects | Ensure `/~oauth` is not cached by service worker (already configured) |

## After Every Code Change

```bash
npm run build
npx cap sync
npx cap run ios    # or android
```
