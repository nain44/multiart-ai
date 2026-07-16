import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases from 'react-native-purchases';

const REVENUECAT_API_KEYS = {
  ios: 'appl_mock_ios_api_key',
  android: 'goog_mock_android_api_key',
};

interface PremiumContextType {
  isPremium: boolean;
  isLoading: boolean;
  isSimulated: boolean;
  purchasePackage: (packageType: 'monthly' | 'annual') => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  setSimulatedPremium: (val: boolean) => Promise<void>;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSimulated, setIsSimulated] = useState(false);

  useEffect(() => {
    async function initPurchases() {
      try {
        const apiKey = Platform.select({
          ios: REVENUECAT_API_KEYS.ios,
          android: REVENUECAT_API_KEYS.android,
          default: '',
        });

        if (apiKey && Platform.OS !== 'web') {
          // Attempt to configure RevenueCat Purchases
          Purchases.configure({ apiKey });
          
          // Get customer info
          const customerInfo = await Purchases.getCustomerInfo();
          const hasPremium = 
            customerInfo.entitlements.active['Premium'] !== undefined ||
            customerInfo.entitlements.active['premium'] !== undefined;
          
          setIsPremium(hasPremium);
          setIsSimulated(false);
        } else {
          throw new Error('Unsupported platform');
        }
      } catch (e) {
        console.warn('RevenueCat SDK configuration failed or running in Expo Go. Falling back to Simulated Sandbox Mode.', e);
        setIsSimulated(true);
        // Load simulated premium status
        const mockPremium = await AsyncStorage.getItem('simulated_premium');
        setIsPremium(mockPremium === 'true');
      } finally {
        setIsLoading(false);
      }
    }

    initPurchases();
  }, []);

  const purchasePackage = async (packageType: 'monthly' | 'annual'): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (isSimulated) {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1500));
        await AsyncStorage.setItem('simulated_premium', 'true');
        setIsPremium(true);
        setIsLoading(false);
        return true;
      }

      // Live purchase
      const offerings = await Purchases.getOfferings();
      const pkg = packageType === 'annual' ? offerings.current?.annual : offerings.current?.monthly;
      
      if (pkg) {
        const { customerInfo } = await Purchases.purchasePackage(pkg);
        const hasPremium = 
          customerInfo.entitlements.active['Premium'] !== undefined ||
          customerInfo.entitlements.active['premium'] !== undefined;
        setIsPremium(hasPremium);
        setIsLoading(false);
        return hasPremium;
      } else {
        throw new Error(`Package type ${packageType} not found in offerings`);
      }
    } catch (e: any) {
      if (e.userCancelled) {
        console.log('User cancelled purchase');
      } else {
        console.error('Purchase error:', e);
      }
      setIsLoading(false);
      return false;
    }
  };

  const restorePurchases = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (isSimulated) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const mockPremium = await AsyncStorage.getItem('simulated_premium');
        setIsPremium(mockPremium === 'true');
        setIsLoading(false);
        return mockPremium === 'true';
      }

      const customerInfo = await Purchases.restorePurchases();
      const hasPremium = 
        customerInfo.entitlements.active['Premium'] !== undefined ||
        customerInfo.entitlements.active['premium'] !== undefined;
      setIsPremium(hasPremium);
      setIsLoading(false);
      return hasPremium;
    } catch (e) {
      console.error('Restore error:', e);
      setIsLoading(false);
      return false;
    }
  };

  const setSimulatedPremium = async (val: boolean) => {
    if (isSimulated) {
      await AsyncStorage.setItem('simulated_premium', val ? 'true' : 'false');
      setIsPremium(val);
    }
  };

  return (
    <PremiumContext.Provider
      value={{
        isPremium,
        isLoading,
        isSimulated,
        purchasePackage,
        restorePurchases,
        setSimulatedPremium,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  const context = useContext(PremiumContext);
  if (context === undefined) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
}
