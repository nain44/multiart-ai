import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Colors, Radius } from '@/constants/Colors';
import { Wallpaper } from '@/lib/api';
import { showInterstitialAd } from '@/lib/adService';

const { width } = Dimensions.get('window');
const COLUMN_GAP = 12;
const PADDING = 16;
const CARD_WIDTH = (width - PADDING * 2 - COLUMN_GAP) / 2;

interface Props {
  wallpaper: Wallpaper;
  tall?: boolean; // alternate height for masonry feel
}

export default function WallpaperCard({ wallpaper, tall = false }: Props) {
  const cardHeight = tall ? CARD_WIDTH * 1.6 : CARD_WIDTH * 1.2;

  return (
    <Pressable
      onPress={async () => {
        await showInterstitialAd();
        router.push(`/wallpaper/${wallpaper._id}` as any);
      }}
      style={({ pressed }) => [styles.card, { height: cardHeight, opacity: pressed ? 0.92 : 1 }]}
    >
      <Image
        source={{ uri: wallpaper.thumbnailUrl }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
      />
      {/* Gradient overlay */}
      <View style={styles.overlay} />
      {/* Bottom info */}
      <View style={styles.info}>
        {wallpaper.isPremium && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumText}>⭐ FEATURED</Text>
          </View>
        )}
        <Text style={styles.title} numberOfLines={1}>
          {wallpaper.title}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: Radius.md,
    overflow: 'hidden',
    backgroundColor: Colors.surface2,
    marginBottom: COLUMN_GAP,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    // Simulated gradient via bottom gradient view
  },
  info: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    paddingTop: 24,
    backgroundColor: 'rgba(0,0,0,0)',
    // We use a separate gradient view below
  },
  title: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  premiumBadge: {
    backgroundColor: 'rgba(245,158,11,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.5)',
    borderRadius: Radius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  premiumText: {
    color: Colors.premium,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
