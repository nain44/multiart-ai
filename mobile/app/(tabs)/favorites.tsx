import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Linking } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getFavorites, removeFavorite } from '@/lib/storage';
import { Wallpaper } from '@/lib/api';
import { Colors, Spacing, Radius } from '@/constants/Colors';
import MasonryGrid from '@/components/MasonryGrid';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<Wallpaper[]>([]);

  // Reload favorites every time tab is focused
  useFocusEffect(
    useCallback(() => {
      getFavorites().then(setFavorites);
    }, [])
  );

  const openPrivacyPolicy = () => {
    Linking.openURL('https://paynovatechnologies.com/privacy-policy');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.title}>Favorites</Text>
          <Pressable onPress={openPrivacyPolicy}>
            <Text style={{ color: Colors.accent, fontSize: 13, fontWeight: '600' }}>Privacy Policy</Text>
          </Pressable>
        </View>
        {favorites.length > 0 && (
          <Text style={styles.sub}>{favorites.length} saved</Text>
        )}
      </View>

      {favorites.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>❤️</Text>
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptySub}>
            Tap the heart icon on any wallpaper to save it here
          </Text>
        </View>
      ) : (
        <FlatList
          data={[1]}
          renderItem={() => <MasonryGrid wallpapers={favorites} />}
          keyExtractor={() => 'favs'}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
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
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: 80,
  },
  emptyIcon: { fontSize: 64, marginBottom: Spacing.lg },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptySub: {
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
