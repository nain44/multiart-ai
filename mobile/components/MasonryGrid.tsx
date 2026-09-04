import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Wallpaper } from '@/lib/api';
import WallpaperCard from './WallpaperCard';
import BannerAdComponent from './BannerAdComponent';

const { width } = Dimensions.get('window');
const PADDING = 16;
const GAP = 12;

interface Props {
  wallpapers: Wallpaper[];
  showRank?: boolean;
}

export default function MasonryGrid({ wallpapers, showRank = false }: Props) {
  const first6 = wallpapers.slice(0, 6).map((wp, i) => ({ wp, rank: i + 1 }));
  const remaining = wallpapers.slice(6).map((wp, i) => ({ wp, rank: i + 7 }));

  const left1: { wp: Wallpaper; rank: number }[] = [];
  const right1: { wp: Wallpaper; rank: number }[] = [];
  first6.forEach((entry, i) => {
    if (i % 2 === 0) left1.push(entry);
    else right1.push(entry);
  });

  const left2: { wp: Wallpaper; rank: number }[] = [];
  const right2: { wp: Wallpaper; rank: number }[] = [];
  remaining.forEach((entry, i) => {
    if (i % 2 === 0) left2.push(entry);
    else right2.push(entry);
  });

  return (
    <View>
      <View style={styles.row}>
        <View style={styles.col}>
          {left1.map(({ wp, rank }, i) => (
            <WallpaperCard key={wp._id} wallpaper={wp} tall={i % 3 === 1} rank={showRank ? rank : undefined} />
          ))}
        </View>
        <View style={styles.col}>
          {right1.map(({ wp, rank }, i) => (
            <WallpaperCard key={wp._id} wallpaper={wp} tall={i % 3 === 0} rank={showRank ? rank : undefined} />
          ))}
        </View>
      </View>

      {/* Banner Ad after 6 wallpapers */}
      {wallpapers.length > 6 && (
        <View style={{ marginVertical: 8 }}>
          <BannerAdComponent />
        </View>
      )}

      {remaining.length > 0 && (
        <View style={[styles.row, { marginTop: 0 }]}>
          <View style={styles.col}>
            {left2.map(({ wp, rank }, i) => (
              <WallpaperCard key={wp._id} wallpaper={wp} tall={i % 3 === 1} rank={showRank ? rank : undefined} />
            ))}
          </View>
          <View style={styles.col}>
            {right2.map(({ wp, rank }, i) => (
              <WallpaperCard key={wp._id} wallpaper={wp} tall={i % 3 === 0} rank={showRank ? rank : undefined} />
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
