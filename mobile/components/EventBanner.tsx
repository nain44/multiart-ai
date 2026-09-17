import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Category } from '@/lib/api';
import { Colors, Spacing, Radius } from '@/constants/Colors';

export default function EventBanner({ category }: { category: Category }) {
  return (
    <Pressable
      style={styles.banner}
      onPress={() => router.push(`/category/${category._id}?name=${encodeURIComponent(category.name)}` as any)}
    >
      <Text style={styles.icon}>{category.icon}</Text>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{category.name} wallpapers are here!</Text>
        <Text style={styles.subtitle}>Tap to see the collection</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.accent,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  icon: { fontSize: 28 },
  textWrap: { flex: 1 },
  title: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  subtitle: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  chevron: { color: Colors.accent, fontSize: 24, fontWeight: '700' },
});
