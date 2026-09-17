import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable,
  Dimensions, RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { api, Wallpaper, Category } from '@/lib/api';
import { Colors, Spacing, Radius } from '@/constants/Colors';
import MasonryGrid from '@/components/MasonryGrid';
import WallpaperCard from '@/components/WallpaperCard';
import CategoryChip from '@/components/CategoryChip';
import SkeletonGrid from '@/components/SkeletonCard';
import SideDrawer from '@/components/SideDrawer';
import EventBanner from '@/components/EventBanner';
import { getUpcomingEventCategory } from '@/lib/eventReminder';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [featured, setFeatured] = useState<Wallpaper[]>([]);
  const [myCreations, setMyCreations] = useState<Wallpaper[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const upcomingEvent = useMemo(() => getUpcomingEventCategory(categories), [categories]);

  async function load() {
    setError(null);
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

  // Refresh just "Your Creations" on focus, so a wallpaper generated on the
  // Create tab shows up at the top the moment the user comes back to Home.
  useFocusEffect(
    useCallback(() => {
      api.myCreations()
        .then((items) => setMyCreations(items.slice(0, 6)))
        .catch(() => {});
    }, [])
  );

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
    <View style={styles.container}>
      {/* Top Bar Navigation */}
      <View style={styles.topBar}>
        <Pressable onPress={() => setDrawerOpen(true)} style={styles.iconBtn}>
          <Text style={styles.iconText}>☰</Text>
        </Pressable>
        <Text style={styles.logoText}>MultiArt AI</Text>
        <View style={styles.topBarActions}>
          <Pressable onPress={() => router.push('/search')} style={styles.iconBtn}>
            <Text style={styles.iconText}>🔍</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/favorites')} style={styles.iconBtn}>
            <Text style={styles.iconText}>❤️</Text>
          </Pressable>
        </View>
      </View>

      {/* Hero Header */}
      <View style={styles.hero}>
        <View style={styles.heroGlow} />
        <View style={styles.heroActions}>
          <Pressable
            style={styles.browseBtn}
            onPress={() => router.push('/browse')}
          >
            <Text style={styles.browseBtnText}>Browse All 🖼️</Text>
          </Pressable>
          <Pressable
            style={styles.createBtn}
            onPress={() => router.push('/generator')}
          >
            <Text style={styles.createBtnText}>Create AI 🎨</Text>
          </Pressable>
        </View>
      </View>

      {/* Seasonal/holiday reminder */}
      {upcomingEvent && <EventBanner category={upcomingEvent} />}

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
            style={styles.chipsScroll}
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

      <ScrollView
        style={styles.scroll}
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
      {/* Your Creations (own AI generations, private or pending - visible only to this device) */}
      {myCreations.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎨 Your Creations</Text>
            <Pressable onPress={() => router.push('/my-creations' as any)}>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalRow}
          >
            {myCreations.map((wp) => (
              <WallpaperCard key={wp._id} wallpaper={wp} />
            ))}
          </ScrollView>
        </View>
      )}

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

      </ScrollView>

      <SideDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { paddingBottom: 40 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 54,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.bg,
  },
  topBarActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 16,
    color: Colors.text,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  hero: {
    padding: Spacing.xl,
    paddingTop: Spacing.lg,
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
  heroActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
    width: '100%',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  browseBtn: {
    flex: 1,
    backgroundColor: Colors.accent,
    paddingVertical: 14,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  browseBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  createBtn: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  createBtnText: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  section: {
    marginTop: Spacing.xxl,
  },
  horizontalRow: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
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
  chipsScroll: {
    flexGrow: 0,
    flexShrink: 0,
    maxHeight: 52,
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
