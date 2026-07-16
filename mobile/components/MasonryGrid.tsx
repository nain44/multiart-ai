import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Wallpaper } from '@/lib/api';
import WallpaperCard from './WallpaperCard';
import BannerAdComponent from './BannerAdComponent';

const { width } = Dimensions.get('window');
const PADDING = 16;
const GAP = 12;

interface Props {
  wallpapers: Wallpaper[];
}

export default function MasonryGrid({ wallpapers }: Props) {
  const first12 = wallpapers.slice(0, 12);
  const remaining = wallpapers.slice(12);

  const left1: Wallpaper[] = [];
  const right1: Wallpaper[] = [];
  first12.forEach((wp, i) => {
    if (i % 2 === 0) left1.push(wp);
    else right1.push(wp);
  });

  const left2: Wallpaper[] = [];
  const right2: Wallpaper[] = [];
  remaining.forEach((wp, i) => {
    if (i % 2 === 0) left2.push(wp);
    else right2.push(wp);
  });

  return (
    <View>
      <View style={styles.row}>
        <View style={styles.col}>
          {left1.map((wp, i) => (
            <WallpaperCard key={wp._id} wallpaper={wp} tall={i % 3 === 1} />
          ))}
        </View>
        <View style={styles.col}>
          {right1.map((wp, i) => (
            <WallpaperCard key={wp._id} wallpaper={wp} tall={i % 3 === 0} />
          ))}
        </View>
      </View>

      {/* Banner Ad after 6 rows (12 items) */}
      {wallpapers.length > 12 && (
        <View style={{ marginVertical: 8 }}>
          <BannerAdComponent />
        </View>
      )}

      {remaining.length > 0 && (
        <View style={[styles.row, { marginTop: 0 }]}>
          <View style={styles.col}>
            {left2.map((wp, i) => (
              <WallpaperCard key={wp._id} wallpaper={wp} tall={i % 3 === 1} />
            ))}
          </View>
          <View style={styles.col}>
            {right2.map((wp, i) => (
              <WallpaperCard key={wp._id} wallpaper={wp} tall={i % 3 === 0} />
            ))}
          </View>
        </View>
      )}
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
