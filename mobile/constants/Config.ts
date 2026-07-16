import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * API base URL for development.
 *
 * Expo Go on a physical device: uses your PC's LAN IP from hostUri (e.g. 192.168.0.103).
 * Update FALLBACK_LAN_IP if hostUri is unavailable (run `ipconfig` in PowerShell).
 */
const FALLBACK_LAN_IP = '192.168.18.20';

function getApiUrl(): string {
  // Use production URL in production builds
  if (!__DEV__) {
    return process.env.EXPO_PUBLIC_API_URL || 'https://mbackend.paynovatechnologies.com/api';
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host && host !== 'localhost' && !host.startsWith('127.')) {
      return `http://${host}:5000/api`;
    }
  }

  if (Constants.isDevice) {
    return `http://${FALLBACK_LAN_IP}:5000/api`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }

  return 'http://localhost:5000/api';
}

export const API_BASE_URL = getApiUrl();

export const PAGE_SIZE = 20;
export const MASONRY_COLUMNS = 2;
