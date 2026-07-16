import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, Radius, Spacing } from '@/constants/Colors';
import { Category } from '@/lib/api';

interface Props {
  category: Category;
  onPress: () => void;
  active?: boolean;
}

export default function CategoryChip({ category, onPress, active = false }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active && styles.chipActive,
        pressed && styles.chipPressed,
      ]}
    >
      <Text style={styles.icon}>{category.icon}</Text>
      <Text style={[styles.label, active && styles.labelActive]}>{category.name}</Text>
      {category.wallpaperCount > 0 && (
        <Text style={styles.count}>{category.wallpaperCount}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
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
  chipPressed: {
    opacity: 0.75,
  },
  icon: {
    fontSize: 16,
  },
  label: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  labelActive: {
    color: '#a78bfa',
    fontWeight: '600',
  },
  count: {
    fontSize: 12,
    color: Colors.textDim,
  },
});
