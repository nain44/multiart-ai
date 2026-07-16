import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Wallpaper } from '@/lib/api';
import WallpaperCard from './WallpaperCard';

const { width } = Dimensions.get('window');
const PADDING = 16;
const GAP = 12;

interface Props {
  wallpapers: Wallpaper[];
}

/**
 * Simple two-column masonry grid. Splits wallpapers into left/right columns,
 * alternating card heights for a Pinterest-style look.
 */
export default function MasonryGrid({ wallpapers }: Props) {
  const left: Wallpaper[] = [];
  const right: Wallpaper[] = [];

  wallpapers.forEach((wp, i) => {
    if (i % 2 === 0) left.push(wp);
    else right.push(wp);
  });

  return (
    <View style={styles.row}>
      <View style={styles.col}>
        {left.map((wp, i) => (
          <WallpaperCard key={wp._id} wallpaper={wp} tall={i % 3 === 1} />
        ))}
      </View>
      <View style={styles.col}>
        {right.map((wp, i) => (
          <WallpaperCard key={wp._id} wallpaper={wp} tall={i % 3 === 0} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: PADDING,
    gap: GAP,
  },
  col: {
    flex: 1,
  },
});
