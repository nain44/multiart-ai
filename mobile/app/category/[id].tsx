import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { api, Wallpaper } from '@/lib/api';
import { Colors, Spacing } from '@/constants/Colors';
import MasonryGrid from '@/components/MasonryGrid';
import SkeletonGrid from '@/components/SkeletonCard';

export default function CategoryScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const navigation = useNavigation();
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (name) navigation.setOptions({ title: decodeURIComponent(name) });
  }, [name]);

  async function fetchWallpapers(p = 1, reset = false) {
    if (!id) return;
    if (p === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const data = await api.byCategory(id, p);
      setWallpapers((prev) => (reset || p === 1 ? data.wallpapers : [...prev, ...data.wallpapers]));
      setTotalPages(data.pagination.pages);
      setPage(p);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { fetchWallpapers(1); }, [id]);

  return (
    <View style={styles.container}>
      <FlatList
        data={[1]}
        renderItem={() =>
          loading ? <SkeletonGrid /> : <MasonryGrid wallpapers={wallpapers} />
        }
        keyExtractor={() => 'cat'}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchWallpapers(1, true); }}
            tintColor={Colors.accent}
            colors={[Colors.accent]}
          />
        }
        onEndReached={() => {
          if (!loadingMore && page < totalPages) fetchWallpapers(page + 1);
        }}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{name ? decodeURIComponent(name) : 'Category'}</Text>
            {wallpapers.length > 0 && (
              <Text style={styles.headerSub}>{wallpapers.length} wallpapers</Text>
            )}
          </View>
        }
        ListFooterComponent={
          loadingMore ? <ActivityIndicator color={Colors.accent} style={{ marginVertical: 20 }} /> : null
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  headerSub: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
