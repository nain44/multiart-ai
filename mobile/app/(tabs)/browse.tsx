import { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, FlatList,
  Pressable, ActivityIndicator, RefreshControl,
} from 'react-native';
import { api, Wallpaper, Category } from '@/lib/api';
import { Colors, Spacing, Radius } from '@/constants/Colors';
import MasonryGrid from '@/components/MasonryGrid';
import SkeletonGrid from '@/components/SkeletonCard';

const DEFAULT_QUERY = 'beautiful 4k wallpaper';

const PRESET_CATEGORIES = [
  { name: 'Nature', icon: '🌿' },
  { name: 'Space', icon: '🚀' },
  { name: 'Abstract', icon: '🎨' },
  { name: 'Dark', icon: '🌑' },
  { name: 'Minimal', icon: '⬜' },
  { name: 'City', icon: '🏙️' },
  { name: 'Ocean', icon: '🌊' },
  { name: 'Mountains', icon: '🏔️' },
  { name: 'Cars', icon: '🚗' },
  { name: 'Animals', icon: '🦁' },
  { name: 'Flowers', icon: '🌸' },
  { name: 'Architecture', icon: '🏛️' },
];

export default function BrowseScreen() {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [dbCategories, setDbCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeQuery, setActiveQuery] = useState(DEFAULT_QUERY);
  const [activeLabel, setActiveLabel] = useState('All');
  const isLoadingMoreRef = useRef(false);

  async function fetchWallpapers(q: string, p = 1, reset = false) {
    if (isLoadingMoreRef.current && !reset) return;
    if (p === 1) setLoading(true);
    else {
      setLoadingMore(true);
      isLoadingMoreRef.current = true;
    }

    try {
      const data = await api.explore(q, p);
      setWallpapers((prev) =>
        reset || p === 1 ? data.wallpapers : [...prev, ...data.wallpapers]
      );
      setHasMore(data.pagination.hasMore);
      setPage(p);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
      isLoadingMoreRef.current = false;
    }
  }

  useEffect(() => {
    api.categories().then((c) => setDbCategories(c.filter((x) => x.isActive)));
    fetchWallpapers(DEFAULT_QUERY, 1, true);
  }, []);

  function selectQuery(query: string, label: string) {
    const next = activeLabel === label ? DEFAULT_QUERY : query;
    const nextLabel = activeLabel === label ? 'All' : label;
    setActiveQuery(next);
    setActiveLabel(nextLabel);
    setWallpapers([]);
    fetchWallpapers(next, 1, true);
  }

  function loadMore() {
    if (!isLoadingMoreRef.current && hasMore && !loading) {
      fetchWallpapers(activeQuery, page + 1);
    }
  }

  const dbNames = new Set(dbCategories.map((c) => c.name.toLowerCase()));
  const extraPresets = PRESET_CATEGORIES.filter(
    (p) => !dbNames.has(p.name.toLowerCase())
  );

  const ListHeader = (
    <View>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Browse</Text>
        <Text style={styles.headerSub}>
          {activeLabel === 'All' ? 'Explore all wallpapers' : `Browsing: ${activeLabel}`}
        </Text>
      </View>

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
        style={styles.chipsScroll}
      >
        <Pressable
          style={[styles.chip, activeLabel === 'All' && styles.chipActive]}
          onPress={() => selectQuery(DEFAULT_QUERY, 'All')}
        >
          <Text style={[styles.chipText, activeLabel === 'All' && styles.chipTextActive]}>
            🌐 All
          </Text>
        </Pressable>

        {dbCategories.map((cat) => (
          <Pressable
            key={cat._id}
            style={[styles.chip, activeLabel === cat.name && styles.chipActive]}
            onPress={() => selectQuery(cat.name, cat.name)}
          >
            <Text style={[styles.chipText, activeLabel === cat.name && styles.chipTextActive]}>
              {cat.icon} {cat.name}
            </Text>
          </Pressable>
        ))}

        {extraPresets.map((cat) => (
          <Pressable
            key={cat.name}
            style={[styles.chip, activeLabel === cat.name && styles.chipActive]}
            onPress={() => selectQuery(cat.name, cat.name)}
          >
            <Text style={[styles.chipText, activeLabel === cat.name && styles.chipTextActive]}>
              {cat.icon} {cat.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={[1]}
        renderItem={() =>
          loading ? <SkeletonGrid /> : <MasonryGrid wallpapers={wallpapers} />
        }
        keyExtractor={() => 'grid'}
        ListHeaderComponent={ListHeader}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchWallpapers(activeQuery, 1, true);
            }}
            tintColor={Colors.accent}
            colors={[Colors.accent]}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator color={Colors.accent} style={{ marginVertical: 24 }} />
          ) : hasMore && !loading ? (
            <Text style={styles.loadMoreHint}>Scroll for more ↓</Text>
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 32 }}
      />
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
  chipsScroll: {
    marginBottom: Spacing.sm,
  },
  chipsRow: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    paddingBottom: 8,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.full,
  },
  chipActive: {
    backgroundColor: 'rgba(139,92,246,0.15)',
    borderColor: Colors.accent,
  },
  chipText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextActive: { color: '#a78bfa' },
  loadMoreHint: {
    color: Colors.textMuted,
    textAlign: 'center',
    fontSize: 13,
    marginVertical: 16,
  },
});
