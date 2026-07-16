import { useState, useRef } from 'react';
import {
  View, Text, TextInput, StyleSheet, FlatList,
  Pressable, ActivityIndicator, Keyboard,
} from 'react-native';
import { api, Wallpaper } from '@/lib/api';
import { Colors, Spacing, Radius } from '@/constants/Colors';
import MasonryGrid from '@/components/MasonryGrid';

const SUGGESTIONS = [
  { label: 'Nature', icon: '🌿' },
  { label: 'Space', icon: '🚀' },
  { label: 'Dark', icon: '🌑' },
  { label: 'Abstract', icon: '🎨' },
  { label: 'City', icon: '🏙️' },
  { label: 'Ocean', icon: '🌊' },
  { label: 'Minimal', icon: '⬜' },
  { label: 'Animals', icon: '🦁' },
];

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLoadingRef = useRef(false);
  const currentQueryRef = useRef('');

  async function doSearch(q: string, p = 1, reset = false) {
    if (!q.trim()) {
      setWallpapers([]);
      setSearched(false);
      return;
    }
    if (isLoadingRef.current && !reset) return;

    currentQueryRef.current = q;
    isLoadingRef.current = true;

    if (p === 1) { setLoading(true); setSearched(true); }
    else setLoadingMore(true);

    try {
      const data = await api.explore(q, p);
      // Discard stale responses if query changed
      if (currentQueryRef.current !== q) return;
      setWallpapers((prev) => reset || p === 1 ? data.wallpapers : [...prev, ...data.wallpapers]);
      setHasMore(data.pagination.hasMore);
      setPage(p);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isLoadingRef.current = false;
    }
  }

  function handleChange(text: string) {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(text, 1, true), 600);
  }

  function loadMore() {
    if (!isLoadingRef.current && hasMore && searched) {
      doSearch(query, page + 1);
    }
  }

  function pickSuggestion(label: string) {
    setQuery(label);
    Keyboard.dismiss();
    doSearch(label, 1, true);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
        <Text style={styles.subtitle}>Find wallpapers from Pexels & Unsplash</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          value={query}
          onChangeText={handleChange}
          placeholder="nature, space, dark aesthetic..."
          placeholderTextColor={Colors.textDim}
          style={styles.input}
          returnKeyType="search"
          onSubmitEditing={() => { Keyboard.dismiss(); doSearch(query, 1, true); }}
          autoCapitalize="none"
        />
        {query.length > 0 && (
          <Pressable onPress={() => { setQuery(''); setWallpapers([]); setSearched(false); }}>
            <Text style={styles.clearBtn}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* Results FlatList */}
      <FlatList
        data={[1]}
        renderItem={() => {
          if (loading) {
            return (
              <View style={styles.loadingState}>
                <ActivityIndicator color={Colors.accent} size="large" />
                <Text style={styles.loadingText}>Searching Pexels & Unsplash...</Text>
              </View>
            );
          }

          if (!searched) {
            return (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🖼️</Text>
                <Text style={styles.emptyTitle}>Find your perfect wallpaper</Text>
                <Text style={styles.emptySub}>Search any style, mood, or theme</Text>
                <View style={styles.suggestions}>
                  {SUGGESTIONS.map((s) => (
                    <Pressable key={s.label} style={styles.tag} onPress={() => pickSuggestion(s.label)}>
                      <Text style={styles.tagText}>{s.icon} {s.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            );
          }

          if (wallpapers.length === 0) {
            return (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>😔</Text>
                <Text style={styles.emptyTitle}>No results for "{query}"</Text>
                <Text style={styles.emptySub}>Try a different keyword</Text>
              </View>
            );
          }

          return <MasonryGrid wallpapers={wallpapers} />;
        }}
        keyExtractor={() => 'search'}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator color={Colors.accent} style={{ marginVertical: 24 }} />
          ) : null
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
    paddingTop: 56,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    gap: Spacing.sm,
  },
  searchIcon: { fontSize: 16 },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: 15,
  },
  clearBtn: {
    color: Colors.textMuted,
    fontSize: 16,
    padding: 4,
  },
  loadingState: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 16,
  },
  loadingText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: { fontSize: 56, marginBottom: Spacing.lg },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emptySub: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  tag: {
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  tagText: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
});
