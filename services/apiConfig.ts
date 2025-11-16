// API Configuration
// Change these values based on your environment

/**
 * API_BASE_URL Configuration Guide:
 *
 * 1. Development (localhost):
 *    - iOS Simulator: 'http://localhost:3000'
 *    - Android Emulator: 'http://10.0.2.2:3000'
 *    - Physical Device: 'http://YOUR_COMPUTER_IP:3000' (e.g., 'http://192.168.1.100:3000')
 *
 * 2. Production:
 *    - Update to your production API URL (e.g., 'https://api.yourdomain.com')
 */

export const API_CONFIG = {
  // Change this URL based on your environment
  BASE_URL: 'https://song-list-lilac.vercel.app',

  // API Endpoints
  ENDPOINTS: {
    SONGS: '/api/songs',
  },

  // Default pagination settings
  DEFAULT_LIMIT: 20,
};

/**
 * Helper function to get the correct API URL based on platform
 * You can customize this based on your needs
 */
export const getApiUrl = (): string => {
  // TODO: Detect platform and adjust URL accordingly
  // For now, returns the configured BASE_URL
  return API_CONFIG.BASE_URL;
};
