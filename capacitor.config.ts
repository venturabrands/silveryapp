import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.e178caaf9a3c4f1790bc92ce70cf48b6',
  appName: 'silveryapp',
  webDir: 'dist',
  server: {
    url: 'https://e178caaf-9a3c-4f17-90bc-92ce70cf48b6.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#0a0c14',
      showSpinner: false,
      androidSpinnerStyle: 'small',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0a0c14',
    },
  },
};

export default config;
