import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { useEffect, useRef } from 'react';
import { Colors, Radius } from '@/constants/Colors';

const { width } = Dimensions.get('window');
const CARD_W = (width - 16 * 2 - 12) / 2;

function SkeletonBox({ width: w, height: h, style }: { width: number; height: number; style?: any }) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.7] });

  return (
    <Animated.View
      style={[
        { width: w, height: h, borderRadius: Radius.md, backgroundColor: Colors.surface2, opacity },
        style,
      ]}
    />
  );
}

export default function SkeletonGrid() {
  const items = Array.from({ length: 8 }, (_, i) => i);
  const left = items.filter((_, i) => i % 2 === 0);
  const right = items.filter((_, i) => i % 2 !== 0);

  return (
    <View style={styles.row}>
      <View style={styles.col}>
        {left.map((i) => (
          <SkeletonBox
            key={i}
            width={CARD_W}
            height={i % 3 === 1 ? CARD_W * 1.6 : CARD_W * 1.2}
            style={styles.card}
          />
        ))}
      </View>
      <View style={styles.col}>
        {right.map((i) => (
          <SkeletonBox
            key={i}
            width={CARD_W}
            height={i % 3 === 0 ? CARD_W * 1.6 : CARD_W * 1.2}
            style={styles.card}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  col: {
    flex: 1,
  },
  card: {
    marginBottom: 12,
  },
});
