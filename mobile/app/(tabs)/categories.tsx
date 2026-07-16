import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { api, Category } from '@/lib/api';
import { Colors, Spacing, Radius } from '@/constants/Colors';

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.categories()
      .then((cats) => setCategories(cats.filter((c) => c.isActive)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Categories</Text>
        <Text style={styles.sub}>{categories.length} collections</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.accent} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.card, pressed && { opacity: 0.8 }]}
              onPress={() => router.push(`/category/${item._id}?name=${encodeURIComponent(item.name)}` as any)}
            >
              <Text style={styles.cardIcon}>{item.icon}</Text>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardCount}>{item.wallpaperCount} wallpapers</Text>
              <View style={styles.cardArrow}>
                <Text style={styles.cardArrowText}>→</Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 56,
    paddingBottom: Spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  },
  sub: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 2,
  },
  grid: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 40,
  },
  row: {
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    position: 'relative',
    minHeight: 120,
  },
  cardIcon: {
    fontSize: 36,
    marginBottom: Spacing.sm,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  cardCount: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  cardArrow: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
  },
  cardArrowText: {
    color: Colors.accent,
    fontSize: 18,
    fontWeight: '700',
  },
});
