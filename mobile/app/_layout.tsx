import 'react-native-reanimated';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { PremiumProvider } from '@/components/PremiumContext';
import { initAds } from '@/lib/adService';

export default function RootLayout() {
  useEffect(() => {
    initAds().catch((err) => console.error('Failed to initialize ads:', err));
  }, []);

  return (
    <PremiumProvider>
      <GestureHandlerRootView style={styles.root}>
        <StatusBar style="light" backgroundColor={Colors.bg} />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.bg } }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="wallpaper/[id]"
            options={{
              headerShown: false,
              animation: 'fade',
              presentation: 'fullScreenModal',
            }}
          />
          <Stack.Screen
            name="category/[id]"
            options={{
              headerShown: true,
              headerStyle: { backgroundColor: Colors.bg },
              headerTintColor: Colors.text,
              headerBackTitle: '',
              title: '',
            }}
          />
          <Stack.Screen
            name="paywall"
            options={{
              headerShown: false,
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
        </Stack>
      </GestureHandlerRootView>
    </PremiumProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
