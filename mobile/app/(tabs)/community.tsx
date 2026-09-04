import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { api, Wallpaper } from '@/lib/api';
import { Colors, Spacing, Radius } from '@/constants/Colors';
import MasonryGrid from '@/components/MasonryGrid';
import SkeletonGrid from '@/components/SkeletonCard';

type Period = 'daily' | 'weekly';

export default function CommunityScreen() {
  const [period, setPeriod] = useState<Period>('daily');
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load(p: Period) {
    setLoading(true);
    try {
      const data = await api.communityTop(p);
      setWallpapers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(period); }, [period]);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(period); }}
            tintColor={Colors.accent}
            colors={[Colors.accent]}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.replace('/')} style={styles.backBtn}>
              <Text style={styles.backBtnText}>←</Text>
            </Pressable>
            <Text style={styles.headerTitle}>Community Top</Text>
          </View>
          <Text style={styles.headerSub}>
            The best AI creations, ranked by the community.
          </Text>
        </View>

        {/* Daily / Weekly toggle */}
        <View style={styles.toggleRow}>
          <Pressable
            style={[styles.toggleBtn, period === 'daily' && styles.toggleBtnActive]}
            onPress={() => setPeriod('daily')}
          >
            <Text style={[styles.toggleText, period === 'daily' && styles.toggleTextActive]}>
              🔥 Top Today
            </Text>
          </Pressable>
          <Pressable
            style={[styles.toggleBtn, period === 'weekly' && styles.toggleBtnActive]}
            onPress={() => setPeriod('weekly')}
          >
            <Text style={[styles.toggleText, period === 'weekly' && styles.toggleTextActive]}>
              👑 Top This Week
            </Text>
          </Pressable>
        </View>

        {loading ? (
          <SkeletonGrid />
        ) : wallpapers.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              No community creations {period === 'daily' ? 'today' : 'this week'} yet.{'\n'}
              Be the first — create one with AI!
            </Text>
          </View>
        ) : (
          <MasonryGrid wallpapers={wallpapers} showRank />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 56,
    paddingBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xs,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 18,
    color: Colors.text,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  },
  headerSub: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 2,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.full,
  },
  toggleBtnActive: {
    backgroundColor: 'rgba(139,92,246,0.15)',
    borderColor: Colors.accent,
  },
  toggleText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  toggleTextActive: { color: '#a78bfa' },
  empty: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
