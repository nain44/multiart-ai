import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { BANNER_AD_UNIT_ID, isNativeModuleAvailable } from '../lib/adService';

let BannerAd: any = null;
let BannerAdSize: any = null;

try {
  if (isNativeModuleAvailable) {
    const ads = require('react-native-google-mobile-ads');
    BannerAd = ads.BannerAd;
    BannerAdSize = ads.BannerAdSize;
  }
} catch (e) {
  console.warn('Google Mobile Ads native module failed to load in BannerAdComponent.');
}

export default function BannerAdComponent() {
  if (!isNativeModuleAvailable || !BannerAd || !BannerAdSize) {
    // Simulated placeholder in developmental environment (like Expo Go)
    return (
      <View style={styles.simulatedContainer}>
        <Text style={styles.simulatedText}>[Simulated Banner Ad]</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={BANNER_AD_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
  simulatedContainer: {
    height: 56,
    backgroundColor: '#161622',
    borderColor: '#232333',
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    alignSelf: 'center',
    marginVertical: 12,
  },
  simulatedText: {
    color: '#8b5cf6',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
