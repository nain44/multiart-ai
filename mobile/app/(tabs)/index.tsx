import { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable,
  Dimensions, RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { api, Wallpaper, Category } from '@/lib/api';
import { Colors, Spacing, Radius } from '@/constants/Colors';
import MasonryGrid from '@/components/MasonryGrid';
import CategoryChip from '@/components/CategoryChip';
import SkeletonGrid from '@/components/SkeletonCard';
import BannerAdComponent from '@/components/BannerAdComponent';
import FancyAlert, { AlertButton } from '@/components/FancyAlert';
import { showRewardedAd } from '@/lib/adService';
import { usePremium } from '@/components/PremiumContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [featured, setFeatured] = useState<Wallpaper[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isPremium } = usePremium();
  const [remainingCreations, setRemainingCreations] = useState(3);
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
    icon: '💡',
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

  async function loadCreations() {
    try {
      const val = await AsyncStorage.getItem('remaining_creations');
      if (val !== null) {
        setRemainingCreations(parseInt(val, 10));
      } else {
        await AsyncStorage.setItem('remaining_creations', '3');
        setRemainingCreations(3);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleWatchAdForCreations() {
    showCustomAlert(
      'Watch Video Ad',
      'Watch a short video ad to earn 3 free AI creations!',
      '📺',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Watch Ad',
          onPress: async () => {
            const success = await showRewardedAd();
            if (success) {
              const current = remainingCreations;
              const next = current + 3;
              await AsyncStorage.setItem('remaining_creations', next.toString());
              setRemainingCreations(next);
              showCustomAlert(
                'Reward Granted',
                'You have successfully earned +3 AI Creations!',
                '🎉'
              );
            } else {
              showCustomAlert(
                'Ad Closed',
                'You must finish watching the ad to earn the creations reward.',
                '⚠️'
              );
            }
          }
        }
      ]
    );
  }

  async function load() {
    setError(null);
    loadCreations();
    try {
      const [feat, cats] = await Promise.all([api.featured(), api.categories()]);
      setFeatured(feat);
      setCategories(cats.filter((c) => c.isActive));
    } catch (e: any) {
      console.error(e);
      setError(e?.message || 'Could not connect to server. Check your LAN IP in Config.ts.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ fontSize: 40, marginBottom: 16 }}>⚠️</Text>
        <Text style={{ color: Colors.text, fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' }}>
          Cannot reach backend
        </Text>
        <Text style={{ color: Colors.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 24 }}>
          {error}
        </Text>
        <Pressable
          style={{ backgroundColor: Colors.accent, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 24 }}
          onPress={() => { setLoading(true); load(); }}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); load(); }}
          tintColor={Colors.accent}
          colors={[Colors.accent]}
        />
      }
    >
      {/* Hero Header */}
      <View style={styles.hero}>
        <View style={styles.heroGlow} />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>✨ Free · Premium Content · Daily Updates</Text>
        </View>
        <Text style={styles.heroTitle}>
          {'Stunning\n'}
          <Text style={styles.heroAccent}>Wallpapers</Text>
        </Text>
        <Text style={styles.heroSub}>
          Thousands of free 4K wallpapers for your Android phone
        </Text>
        <Pressable
          style={styles.browseBtn}
          onPress={() => router.push('/browse')}
        >
          <Text style={styles.browseBtnText}>Browse All →</Text>
        </Pressable>
      </View>

      {/* Rewarded Ad Card (Creations Booster) */}
      {!isPremium && (
        <View style={styles.adCardContainer}>
          <LinearGradient
            colors={['#1c103a', '#0c051a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.adCard}
          >
            <View style={styles.adCardLeft}>
              <Text style={styles.adCardTitle}>📺 Watch Ad for AI Creations</Text>
              <Text style={styles.adCardSubtitle}>
                Get +3 free AI creations instantly. Remaining: {remainingCreations}
              </Text>
            </View>
            <Pressable style={styles.adCardBtn} onPress={handleWatchAdForCreations}>
              <Text style={styles.adCardBtnText}>Watch (+3)</Text>
            </Pressable>
          </LinearGradient>
        </View>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Browse by Category</Text>
            <Pressable onPress={() => router.push('/categories')}>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {categories.slice(0, 12).map((cat) => (
              <CategoryChip
                key={cat._id}
                category={cat}
                onPress={() => router.push(`/category/${cat._id}?name=${encodeURIComponent(cat.name)}` as any)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Banner Ad */}
      <BannerAdComponent />

      {/* Featured Wallpapers */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Most Popular</Text>
          <Pressable onPress={() => router.push('/browse?sort=popular')}>
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        </View>
        {loading ? (
          <SkeletonGrid />
        ) : (
          <MasonryGrid wallpapers={featured} />
        )}
      </View>

      {/* Stats bar */}
      <View style={styles.statsRow}>
        {[
          { value: '10K+', label: 'Wallpapers' },
          { value: '20+', label: 'Categories' },
          { value: '4K', label: 'Resolution' },
          { value: '100%', label: 'Free' },
        ].map((s) => (
          <View key={s.label} style={styles.stat}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>
      <FancyAlert
        visible={fancyAlert.visible}
        title={fancyAlert.title}
        message={fancyAlert.message}
        icon={fancyAlert.icon}
        buttons={fancyAlert.buttons}
        onClose={() => setFancyAlert((prev) => ({ ...prev, visible: false }))}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingBottom: 40 },
  adCardContainer: {
    paddingHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
  },
  adCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.3)',
  },
  adCardLeft: {
    flex: 1,
    marginRight: Spacing.md,
  },
  adCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 4,
  },
  adCardSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 16,
  },
  adCardBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: Radius.full,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  adCardBtnText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  hero: {
    padding: Spacing.xl,
    paddingTop: 60,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: -60,
    width: 400,
    height: 400,
    backgroundColor: 'rgba(139,92,246,0.12)',
    borderRadius: 200,
  },
  badge: {
    backgroundColor: 'rgba(139,92,246,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.3)',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  badgeText: {
    color: '#a78bfa',
    fontSize: 12,
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: 44,
    fontWeight: '900',
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 48,
    letterSpacing: -1,
    marginBottom: Spacing.md,
  },
  heroAccent: {
    color: Colors.accent,
  },
  heroSub: {
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  browseBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 14,
    borderRadius: Radius.full,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  browseBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  section: {
    marginTop: Spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  seeAll: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '600',
  },
  chipsRow: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    paddingBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.xxl,
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#a78bfa',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
