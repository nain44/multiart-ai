import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  Dimensions, Alert, ActivityIndicator, Share, Linking, Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import FancyAlert, { AlertButton } from '@/components/FancyAlert';

let RnExpoWallpaperManager: any;
try {
  const mod = require('rn-expo-wallpaper-manager');
  RnExpoWallpaperManager = mod.default || mod;
} catch (e) {
  console.warn('RnExpoWallpaperManager native module is not available in this environment.');
}
import { api, Wallpaper } from '@/lib/api';
import { saveImageToGallery } from '@/lib/download';
import { toggleFavorite, isFavorite } from '@/lib/storage';
import { Colors, Spacing, Radius } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showRewardedAd } from '@/lib/adService';
import { usePremium } from '@/components/PremiumContext';

const { width, height } = Dimensions.get('window');

export default function WallpaperDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [wallpaper, setWallpaper] = useState<Wallpaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [settingWallpaper, setSettingWallpaper] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  const [fancyAlert, setFancyAlert] = useState<{
    visible: boolean;
    title: string;
    message: string;
    icon: string;
    buttons: AlertButton[];
  }>({
    visible: false,
    title: '',
    message: '',
    icon: '💡',
    buttons: [],
  });

  const showCustomAlert = (title: string, message: string, icon: string, buttons?: AlertButton[]) => {
    setFancyAlert({
      visible: true,
      title,
      message,
      icon,
      buttons: buttons || [],
    });
  };
  const { isPremium } = usePremium();

  const isCurrentlyUnlocked = unlocked || isPremium;

  useEffect(() => {
    if (!id) return;
    api.wallpaper(id)
      .then(async (wp) => {
        setWallpaper(wp);
        setFavorited(await isFavorite(wp._id));
        if (wp.isPremium) {
          const isUnlocked = await AsyncStorage.getItem(`unlocked_${wp._id}`);
          setUnlocked(isUnlocked === 'true');
        } else {
          setUnlocked(true);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  async function triggerUnlockDialog(action: 'download' | 'set') {
    if (!wallpaper) return;

    showCustomAlert(
      '👑 Premium Wallpaper',
      'Unlock this wallpaper with a Premium subscription for instant access, or watch a short video ad.',
      '👑',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Watch Ad',
          onPress: async () => {
            const success = await showRewardedAd();
            if (success) {
              await AsyncStorage.setItem(`unlocked_${wallpaper._id}`, 'true');
              setUnlocked(true);
              showCustomAlert(
                'Success',
                'Wallpaper unlocked permanently!',
                '✅',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      if (action === 'download') {
                        handleDownload();
                      } else {
                        handleSetWallpaper();
                      }
                    }
                  }
                ]
              );
            } else {
              showCustomAlert('Ad Closed', 'You must finish watching the ad to unlock this wallpaper.', '⚠️');
            }
          }
        },
        {
          text: 'Go Premium 👑',
          onPress: () => {
            router.push('/paywall' as any);
          }
        }
      ]
    );
  }

  async function handleDownload() {
    if (!wallpaper) return;

    if (wallpaper.isPremium && !isCurrentlyUnlocked) {
      triggerUnlockDialog('download');
      return;
    }

    setDownloading(true);
    try {
      await saveImageToGallery(wallpaper.imageUrl, wallpaper._id);
      api.trackDownload(wallpaper._id).catch(() => {});
      showCustomAlert(
        'Saved to Gallery',
        'Open your Gallery app, then long-press the image to set it as your wallpaper.',
        '💾',
        [{ text: 'Got it', style: 'default' }]
      );
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      if (message.includes('permission') || message.includes('Permission')) {
        showCustomAlert(
          'Permission required',
          'Please allow photo access so MultiArt AI can save wallpapers to your gallery.',
          '🚫'
        );
      } else {
        showCustomAlert('Download failed', message || 'Please check your connection and try again.', '🚫');
      }
    } finally {
      setDownloading(false);
    }
  }

  async function handleSetWallpaper() {
    if (!wallpaper) return;
    if (Platform.OS !== 'android') {
      showCustomAlert('Not supported', 'Directly setting wallpaper is only supported on Android.', '⚠️');
      return;
    }

    if (wallpaper.isPremium && !isCurrentlyUnlocked) {
      triggerUnlockDialog('set');
      return;
    }

    showCustomAlert(
      'Set Wallpaper',
      'Where would you like to apply this wallpaper?',
      '📱',
      [
        { text: 'Home Screen', onPress: () => applyWallpaper('home') },
        { text: 'Lock Screen', onPress: () => applyWallpaper('lock') },
        { text: 'Both Screens', onPress: () => applyWallpaper('both') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }

  async function applyWallpaper(type: 'home' | 'lock' | 'both') {
    if (!wallpaper) return;
    setSettingWallpaper(true);
    try {
      if (!RnExpoWallpaperManager || typeof RnExpoWallpaperManager.setWallpaperFromUrl !== 'function') {
        showCustomAlert(
          'Simulated Action',
          `Directly setting wallpaper is only supported in native builds. Simulated setting to: ${type}`,
          '💡'
        );
        return;
      }
      await RnExpoWallpaperManager.setWallpaperFromUrl(wallpaper.imageUrl, type);
      showCustomAlert('Success', 'Wallpaper has been updated!', '✅');
    } catch (e: any) {
      console.error(e);
      showCustomAlert('Error', e?.message || 'Failed to set wallpaper', '🚫');
    } finally {
      setSettingWallpaper(false);
    }
  }

  async function handleFavorite() {
    if (!wallpaper) return;
    const nowFav = await toggleFavorite(wallpaper);
    setFavorited(nowFav);
  }

  async function handleShare() {
    if (!wallpaper) return;
    await Share.share({
      message: `Check out this wallpaper: ${wallpaper.title} — ${wallpaper.imageUrl}`,
      title: wallpaper.title,
    });
  }

  async function handleReport() {
    if (!wallpaper) return;

    showCustomAlert(
      'Report Content',
      'Are you sure you want to report this wallpaper for review?',
      '🚩',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Report',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.reportWallpaper(wallpaper._id);
              showCustomAlert(
                'Thank you',
                'This wallpaper has been reported for review. Content flagged by users is reviewed by our moderators within 24 hours to ensure a safe community.',
                '✅'
              );
            } catch (e: any) {
              console.error(e);
              showCustomAlert('Error', e?.message || 'Failed to submit report. Please try again.', '🚫');
            }
          }
        }
      ]
    );
  }

  async function handleOpenURL(url: string) {
    if (!url) return;
    try {
      await Linking.openURL(url);
    } catch (e) {
      Alert.alert('Error', 'Cannot open link');
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  if (!wallpaper) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: Colors.text }}>Wallpaper not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Full-screen image */}
      <Image
        source={{ uri: wallpaper.imageUrl }}
        style={styles.image}
        contentFit="cover"
        cachePolicy="memory-disk"
      />

      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()}>
          <Text style={styles.iconBtnText}>←</Text>
        </Pressable>
        <View style={styles.topRight}>
          <Pressable style={styles.iconBtn} onPress={handleFavorite}>
            <Text style={styles.iconBtnText}>{favorited ? '❤️' : '🤍'}</Text>
          </Pressable>
          <Pressable style={styles.iconBtn} onPress={handleShare}>
            <Text style={styles.iconBtnText}>↗</Text>
          </Pressable>
          <Pressable style={styles.iconBtn} onPress={handleReport}>
            <Text style={styles.iconBtnText}>🚩</Text>
          </Pressable>
        </View>
      </View>

      {/* Bottom sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.handle} />

        <Text style={styles.wpTitle}>{wallpaper.title}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Text style={styles.metaText}>📁 {wallpaper.category?.name}</Text>
          </View>
          <View style={styles.metaChip}>
            <Text style={styles.metaText}>🖥 {wallpaper.resolution}</Text>
          </View>
          <View style={styles.metaChip}>
            <Text style={styles.metaText}>⬇ {wallpaper.downloadCount.toLocaleString()}</Text>
          </View>
          {wallpaper.isPremium && (
            <View style={[styles.metaChip, styles.premiumChip]}>
              <Text style={[styles.metaText, styles.premiumText]}>{isCurrentlyUnlocked ? '🔓 Premium (Unlocked)' : '👑 Premium'}</Text>
            </View>
          )}
        </View>

        {wallpaper.tags?.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsScroll}>
            <View style={styles.tagsRow}>
              {wallpaper.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        )}

        <View style={styles.actionRow}>
          <Pressable
            style={[styles.downloadBtn, downloading && styles.downloadBtnDisabled, { flex: 1 }]}
            onPress={handleDownload}
            disabled={downloading || settingWallpaper}
          >
            {downloading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.downloadBtnText}>
                {wallpaper.isPremium && !isCurrentlyUnlocked ? '🔑 Unlock' : '⬇ Download'}
              </Text>
            )}
          </Pressable>

          {Platform.OS === 'android' && (
            <Pressable
              style={[styles.setBtn, settingWallpaper && styles.downloadBtnDisabled, { flex: 1.2 }]}
              onPress={handleSetWallpaper}
              disabled={downloading || settingWallpaper}
            >
              {settingWallpaper ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.downloadBtnText}>
                  {wallpaper.isPremium && !isCurrentlyUnlocked ? '🔑 Unlock' : '✨ Set Wallpaper'}
                </Text>
              )}
            </Pressable>
          )}
        </View>

        {wallpaper.photographer && (
          <Text style={styles.attribution}>
            📸 Photo by{' '}
            {wallpaper.photographerUrl ? (
              <Text
                style={styles.linkText}
                onPress={() => wallpaper.photographerUrl && handleOpenURL(
                  wallpaper.source === 'unsplash'
                    ? (wallpaper.photographerUrl.includes('?') 
                      ? `${wallpaper.photographerUrl}&utm_source=multiartai&utm_medium=referral`
                      : `${wallpaper.photographerUrl}?utm_source=multiartai&utm_medium=referral`)
                    : wallpaper.photographerUrl
                )}
              >
                {wallpaper.photographer}
              </Text>
            ) : (
              wallpaper.photographer
            )}
            {wallpaper.source !== 'own' && (
              <>
                {' on '}
                <Text
                  style={styles.linkText}
                  onPress={() => handleOpenURL(
                    wallpaper.source === 'unsplash'
                      ? 'https://unsplash.com/?utm_source=multiartai&utm_medium=referral'
                      : 'https://pexels.com/'
                  )}
                >
                  {wallpaper.source === 'unsplash' ? 'Unsplash' : 'Pexels'}
                </Text>
              </>
            )}
          </Text>
        )}
      </View>
      <FancyAlert
        visible={fancyAlert.visible}
        title={fancyAlert.title}
        message={fancyAlert.message}
        icon={fancyAlert.icon}
        buttons={fancyAlert.buttons}
        onClose={() => setFancyAlert((prev) => ({ ...prev, visible: false }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bg },
  image: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: height * 0.65,
  },
  topBar: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  topRight: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  iconBtn: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.xl,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderColor: Colors.border,
    top: height * 0.58,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  wpTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  metaChip: {
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  metaText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  premiumChip: {
    backgroundColor: 'rgba(245,158,11,0.15)',
    borderColor: 'rgba(245,158,11,0.4)',
  },
  premiumText: {
    color: Colors.premium,
  },
  tagsScroll: {
    marginBottom: Spacing.lg,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  tag: {
    backgroundColor: 'rgba(139,92,246,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.25)',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  tagText: {
    color: '#a78bfa',
    fontSize: 12,
    fontWeight: '600',
  },
  downloadBtn: {
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.full,
    paddingVertical: 16,
    alignItems: 'center',
  },
  setBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  downloadBtnDisabled: {
    opacity: 0.7,
  },
  downloadBtnText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  attribution: {
    marginTop: Spacing.md,
    color: Colors.textDim,
    fontSize: 12,
    textAlign: 'center',
  },
  linkText: {
    color: '#a78bfa',
    textDecorationLine: 'underline',
  },
});
