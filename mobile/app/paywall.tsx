import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { usePremium } from '@/components/PremiumContext';
import { Colors, Radius, Spacing } from '@/constants/Colors';
import FancyAlert, { AlertButton } from '@/components/FancyAlert';

export default function PaywallScreen() {
  const { purchasePackage, restorePurchases, isSimulated, setSimulatedPremium, isPremium } = usePremium();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const [fancyAlert, setFancyAlert] = useState<{
    visible: boolean;
    title: string;
    message: string;
    icon: string;
    buttons: AlertButton[];
  }>({
    visible: false,
    title: '',
    message: '',
    icon: '👑',
    buttons: [],
  });

  const showCustomAlert = (title: string, message: string, icon: string, buttons?: AlertButton[]) => {
    setFancyAlert({
      visible: true,
      title,
      message,
      icon,
      buttons: buttons || [],
    });
  };

  const handleSubscribe = async () => {
    setPurchasing(true);
    try {
      const success = await purchasePackage(selectedPlan);
      if (success) {
        showCustomAlert(
          '👑 Welcome to Premium!',
          'Thank you for subscribing to MultiArt AI Premium. Enjoy unlimited 4K downloads and an ad-free experience!',
          '👑',
          [{ text: 'Start Exploring', onPress: () => router.back() }]
        );
      } else {
        showCustomAlert('Purchase Failed', 'Unable to complete the purchase. Please try again.', '🚫');
      }
    } catch (error) {
      showCustomAlert('Error', 'An unexpected error occurred.', '🚫');
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const success = await restorePurchases();
      if (success) {
        showCustomAlert('Success', 'Your premium purchases have been restored!', '✅', [
          { text: 'Awesome', onPress: () => router.back() },
        ]);
      } else {
        showCustomAlert('No Purchase Found', 'We couldn\'t find any active premium subscriptions for your account.', '⚠️');
      }
    } catch (error) {
      showCustomAlert('Restore Failed', 'An error occurred during restore.', '🚫');
    } finally {
      setRestoring(false);
    }
  };

  const handleDevUnlock = async () => {
    if (isPremium) {
      await setSimulatedPremium(false);
      showCustomAlert('Developer Mode', 'Premium status cleared (set to free).', '🛠️');
    } else {
      await setSimulatedPremium(true);
      showCustomAlert('Developer Mode', 'Premium status unlocked successfully!', '🛠️', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#1a103c', Colors.bg, Colors.bg]}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Top Close Bar */}
      <View style={styles.header}>
        <Pressable style={styles.closeBtn} onPress={() => router.back()}>
          <Text style={styles.closeBtnText}>✕</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Crown Icon / Branding */}
        <View style={styles.brandingContainer}>
          <LinearGradient
            colors={[Colors.premium, '#f59e0b']}
            style={styles.crownWrapper}
          >
            <Text style={styles.crownIcon}>👑</Text>
          </LinearGradient>
          <Text style={styles.title}>MultiArt AI Premium</Text>
          <Text style={styles.subtitle}>Unlock the ultimate wallpaper experience</Text>
        </View>

        {/* Benefits List */}
        <View style={styles.benefitsContainer}>
          <View style={styles.benefitRow}>
            <Text style={styles.benefitEmoji}>✨</Text>
            <View style={styles.benefitTextCol}>
              <Text style={styles.benefitTitle}>All Premium Wallpapers</Text>
              <Text style={styles.benefitDesc}>Get unlimited access to exclusive artist collections.</Text>
            </View>
          </View>

          <View style={styles.benefitRow}>
            <Text style={styles.benefitEmoji}>🚀</Text>
            <View style={styles.benefitTextCol}>
              <Text style={styles.benefitTitle}>Ultra HD 4K/8K Downloads</Text>
              <Text style={styles.benefitDesc}>Save wallpapers in their original full resolution with zero compression.</Text>
            </View>
          </View>

          <View style={styles.benefitRow}>
            <Text style={styles.benefitEmoji}>🚫</Text>
            <View style={styles.benefitTextCol}>
              <Text style={styles.benefitTitle}>No Ads, Ever</Text>
              <Text style={styles.benefitDesc}>Browse, preview, and download wallpapers without interruptive ads.</Text>
            </View>
          </View>
        </View>

        {/* Plan Selectors */}
        <View style={styles.plansContainer}>
          {/* Annual Plan */}
          <Pressable
            style={[
              styles.planCard,
              selectedPlan === 'annual' && styles.planCardSelected,
            ]}
            onPress={() => setSelectedPlan('annual')}
          >
            {selectedPlan === 'annual' && (
              <LinearGradient
                colors={[Colors.accent2, Colors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.planCardOutline}
              />
            )}
            <View style={styles.planDetails}>
              <View>
                <Text style={styles.planTitle}>Annual Membership</Text>
                <Text style={styles.planDuration}>billed yearly ($1.66/month)</Text>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.planPrice}>$19.99</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Save 45%</Text>
                </View>
              </View>
            </View>
          </Pressable>

          {/* Monthly Plan */}
          <Pressable
            style={[
              styles.planCard,
              selectedPlan === 'monthly' && styles.planCardSelected,
            ]}
            onPress={() => setSelectedPlan('monthly')}
          >
            {selectedPlan === 'monthly' && (
              <LinearGradient
                colors={[Colors.accent2, Colors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.planCardOutline}
              />
            )}
            <View style={styles.planDetails}>
              <View>
                <Text style={styles.planTitle}>Monthly Plan</Text>
                <Text style={styles.planDuration}>Cancel anytime</Text>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.planPrice}>$2.99</Text>
              </View>
            </View>
          </Pressable>
        </View>

        {/* Action Button */}
        <Pressable
          style={styles.subscribeBtn}
          onPress={handleSubscribe}
          disabled={purchasing || restoring}
        >
          <LinearGradient
            colors={[Colors.accent, Colors.accent2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBtn}
          >
            {purchasing ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.subscribeBtnText}>
                {selectedPlan === 'annual' ? 'Get Annual Access • $19.99' : 'Get Monthly Access • $2.99'}
              </Text>
            )}
          </LinearGradient>
        </Pressable>

        {/* Secondary buttons */}
        <View style={styles.footerLinks}>
          <Pressable onPress={handleRestore} disabled={purchasing || restoring}>
            {restoring ? (
              <ActivityIndicator size="small" color={Colors.textMuted} />
            ) : (
              <Text style={styles.footerLinkText}>Restore Purchases</Text>
            )}
          </Pressable>
          <Text style={styles.footerDot}>•</Text>
          <Text style={styles.footerLinkText}>Terms & Privacy</Text>
        </View>

        {/* Developer simulated status info / unlocker */}
        {isSimulated && (
          <View style={styles.devContainer}>
            <Text style={styles.devText}>💻 Expo Sandbox Mode (RevenueCat Native SDK offline)</Text>
            <Pressable style={styles.devBtn} onPress={handleDevUnlock}>
              <Text style={styles.devBtnText}>
                {isPremium ? '🔒 Simulate Standard (Clear Premium)' : '🔓 Simulate Premium Unlock'}
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
      <FancyAlert
        visible={fancyAlert.visible}
        title={fancyAlert.title}
        message={fancyAlert.message}
        icon={fancyAlert.icon}
        buttons={fancyAlert.buttons}
        onClose={() => setFancyAlert((prev) => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    height: 60,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: Colors.textMuted,
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  brandingContainer: {
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xxl,
  },
  crownWrapper: {
    width: 80,
    height: 80,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.premium,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: Spacing.lg,
  },
  crownIcon: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  benefitsContainer: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xxl,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  benefitEmoji: {
    fontSize: 24,
    marginRight: Spacing.md,
    marginTop: 2,
  },
  benefitTextCol: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  benefitDesc: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  plansContainer: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  planCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  planCardSelected: {
    backgroundColor: Colors.surface2,
  },
  planCardOutline: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  planDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  planDuration: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  priceContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  badge: {
    backgroundColor: Colors.accent2,
    borderRadius: Radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '800',
  },
  subscribeBtn: {
    borderRadius: Radius.full,
    overflow: 'hidden',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: Spacing.xl,
  },
  gradientBtn: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  subscribeBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  footerLinkText: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  footerDot: {
    color: Colors.textDim,
  },
  devContainer: {
    backgroundColor: 'rgba(251, 191, 36, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.2)',
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  devText: {
    color: Colors.premium,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  devBtn: {
    backgroundColor: Colors.premium,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  devBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '700',
  },
});
