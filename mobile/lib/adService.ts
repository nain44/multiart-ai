import { Platform, Alert } from 'react-native';

let mobileAds: any;
let RewardedAd: any;
let RewardedAdEventType: any;
let AdEventType: any;
let InterstitialAd: any;

export let isNativeModuleAvailable = false;

try {
  const ads = require('react-native-google-mobile-ads');
  mobileAds = ads.default || ads;
  RewardedAd = ads.RewardedAd;
  RewardedAdEventType = ads.RewardedAdEventType;
  AdEventType = ads.AdEventType;
  InterstitialAd = ads.InterstitialAd;
  isNativeModuleAvailable = true;
} catch (e) {
  console.warn('Google Mobile Ads native module is not available in this environment. Falling back to Simulated Ad Mode.');
}

// Production Ad Unit IDs
export const REWARDED_AD_UNIT_ID = Platform.select({
  android: 'ca-app-pub-4935488254463353/9346404334',
  ios: 'ca-app-pub-3940256099942544/1712485313',
  default: 'ca-app-pub-4935488254463353/9346404334',
});

export const INTERSTITIAL_AD_UNIT_ID = Platform.select({
  android: 'ca-app-pub-4935488254463353/7417676773',
  ios: 'ca-app-pub-3940256099942544/4411468910', // iOS Test ID fallback
  default: 'ca-app-pub-4935488254463353/7417676773',
});

export const BANNER_AD_UNIT_ID = Platform.select({
  android: 'ca-app-pub-4935488254463353/3059784895',
  ios: 'ca-app-pub-3940256099942544/2934735716', // iOS Test ID fallback
  default: 'ca-app-pub-4935488254463353/3059784895',
});

let isInitialized = false;
let interstitialInstance: any = null;
let isInterstitialLoaded = false;

export async function initAds() {
  if (!isNativeModuleAvailable) return;
  if (isInitialized) return;
  try {
    await mobileAds().initialize();
    console.log('✅ AdMob SDK Initialized successfully');
    isInitialized = true;
    
    // Preload interstitial ad
    loadInterstitial();
  } catch (error) {
    console.error('❌ AdMob initialization error:', error);
  }
}

// Interstitial Ad Management
function loadInterstitial() {
  if (!isNativeModuleAvailable || !InterstitialAd) return;
  try {
    interstitialInstance = InterstitialAd.createForAdRequest(INTERSTITIAL_AD_UNIT_ID, {
      requestNonPersonalizedAdsOnly: true,
    });

    interstitialInstance.addAdEventListener(AdEventType.LOADED, () => {
      isInterstitialLoaded = true;
      console.log('🎬 Interstitial Ad Loaded');
    });

    interstitialInstance.addAdEventListener(AdEventType.ERROR, (error: any) => {
      console.error('❌ Interstitial Ad failed to load:', error);
      isInterstitialLoaded = false;
    });

    interstitialInstance.addAdEventListener(AdEventType.CLOSED, () => {
      isInterstitialLoaded = false;
      console.log('🎬 Interstitial Ad Closed - Reloading...');
      // Load next interstitial ad
      loadInterstitial();
    });

    interstitialInstance.load();
  } catch (error) {
    console.error('❌ Error creating interstitial ad:', error);
  }
}

/**
 * Helper to show an interstitial ad.
 * Resolves when the ad is closed or if no ad is available.
 */
export function showInterstitialAd(): Promise<void> {
  return new Promise((resolve) => {
    if (!isNativeModuleAvailable || !interstitialInstance) {
      console.log('🎬 [Simulated Ad] Displaying popup mock interstitial ad...');
      Alert.alert(
        'Simulated Interstitial Ad',
        'This simulates a full-screen interstitial ad transition.',
        [
          {
            text: 'Close Ad',
            onPress: () => resolve(),
          },
        ]
      );
      return;
    }

    if (isInterstitialLoaded) {
      const unsubscribeClosed = interstitialInstance.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          unsubscribeClosed();
          resolve();
        }
      );
      interstitialInstance.show();
    } else {
      console.log('⚠️ Interstitial ad not loaded yet, proceeding without ad');
      loadInterstitial(); // Try reloading for next time
      resolve();
    }
  });
}

/**
 * Helper to show a rewarded ad.
 * Returns a Promise that resolves to:
 * - true: If the user successfully watched the ad and earned the reward.
 * - false: If the ad failed to load/show or the user closed it early.
 */
export function showRewardedAd(): Promise<boolean> {
  return new Promise(async (resolve) => {
    if (!isNativeModuleAvailable) {
      console.log('🎬 [Simulated Ad] Displaying popup mock rewarded ad...');
      Alert.alert(
        'Simulated Video Ad',
        'This simulates a 15-second rewarded video ad overlay since Google Mobile Ads is not supported in Expo Go.',
        [
          {
            text: 'Close early',
            onPress: () => {
              console.log('🎬 [Simulated Ad] User closed early.');
              resolve(false);
            },
            style: 'cancel',
          },
          {
            text: 'Finish watching',
            onPress: () => {
              console.log('🎬 [Simulated Ad] Reward granted.');
              resolve(true);
            },
          },
        ]
      );
      return;
    }

    // Ensure Ads are initialized
    await initAds();

    if (!REWARDED_AD_UNIT_ID) {
      console.warn('⚠️ No Ad Unit ID configured for this platform');
      resolve(false);
      return;
    }

    const rewarded = RewardedAd.createForAdRequest(REWARDED_AD_UNIT_ID, {
      requestNonPersonalizedAdsOnly: true,
    });

    let hasRewarded = false;

    const unsubscribeLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
      try {
        rewarded.show();
      } catch (err) {
        console.error('❌ Error showing rewarded ad:', err);
        cleanup();
        resolve(false);
      }
    });

    const unsubscribeEarned = rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      (reward: any) => {
        console.log('💰 User successfully watched the ad and earned reward:', reward);
        hasRewarded = true;
      }
    );

    const unsubscribeClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
      cleanup();
      resolve(hasRewarded);
    });

    const unsubscribeError = rewarded.addAdEventListener(AdEventType.ERROR, (error: any) => {
      console.error('❌ Rewarded Ad loading/playback error:', error);
      cleanup();
      resolve(false);
    });

    function cleanup() {
      unsubscribeLoaded();
      unsubscribeEarned();
      unsubscribeClosed();
      unsubscribeError();
    }

    try {
      rewarded.load();
    } catch (err) {
      console.error('❌ Failed to trigger rewarded ad load:', err);
      cleanup();
      resolve(false);
    }
  });
}

