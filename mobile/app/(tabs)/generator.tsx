import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  ScrollView,
  Keyboard,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { router, useNavigation } from 'expo-router';
import { api, Wallpaper } from '@/lib/api';
import { Colors, Radius, Spacing } from '@/constants/Colors';
import FancyAlert, { AlertButton } from '@/components/FancyAlert';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showRewardedAd } from '@/lib/adService';
import { usePremium } from '@/components/PremiumContext';

const { width } = Dimensions.get('window');

const LOADING_QUOTES = [
  'Initializing AI imagination engine...',
  'Analyzing text prompt tokens...',
  'Composing paint brushes & palettes...',
  'Drafting basic lighting and contours...',
  'Applying high-resolution detail passes...',
  'Polishing neural network gradients...',
  'Uploading high-resolution art to Cloudinary...',
  'Saving to MultiArt AI Database...',
  'Almost ready! Finalizing metadata...',
];

const SUGGESTIONS = [
  { label: 'Cyberpunk 🏙️', prompt: 'Futuristic cyberpunk cityscape, towering neon skyscrapers, flying cars, rain slicked streets, glowing holographic signs, vertical wallpaper, hyperrealistic' },
  { label: 'Cosmic 🌌', prompt: 'An astronaut floating in deep space next to a swirling colorful galaxy, stars exploding, nebulas, cosmic dust, photorealistic 8k vertical wallpaper' },
  { label: 'Mystic 🌲', prompt: 'Ethereal glowing enchanted forest, ancient massive trees with hanging lanterns, magical mist, sparkling fireflies, fantasy concept art' },
  { label: 'Anime 🎨', prompt: 'Cozy anime street in Tokyo, cherry blossom petals falling, soft sunset glow, digital illustration style, warm colors, nostalgic, highly detailed' },
  { label: 'Minimalist 📐', prompt: 'Abstract minimalist geometric shapes, warm pastel color palette, simple clean vector art, aesthetic flat design, vertical' },
];

export default function AIGeneratorScreen() {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
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

  const { isPremium } = usePremium();
  const [remainingCreations, setRemainingCreations] = useState(3);
  const navigation = useNavigation();

  async function loadCreations() {
    try {
      const val = await AsyncStorage.getItem('remaining_creations');
      if (val !== null) {
        setRemainingCreations(parseInt(val, 10));
      } else {
        await AsyncStorage.setItem('remaining_creations', '3');
        setRemainingCreations(3);
      }
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    loadCreations();
    const unsubscribe = navigation.addListener('focus', () => {
      loadCreations();
    });
    return unsubscribe;
  }, [navigation]);

  const showCustomAlert = (title: string, message: string, icon: string, buttons?: AlertButton[]) => {
    setFancyAlert({
      visible: true,
      title,
      message,
      icon,
      buttons: buttons || [],
    });
  };
  const [loadingQuoteIndex, setLoadingQuoteIndex] = useState(0);
  const [generatedWp, setGeneratedWp] = useState<Wallpaper | null>(null);

  // Cycle loading quotes when generating is true
  useEffect(() => {
    let interval: any;
    if (generating) {
      setLoadingQuoteIndex(0);
      interval = setInterval(() => {
        setLoadingQuoteIndex((prev) => (prev + 1) % LOADING_QUOTES.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [generating]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showCustomAlert('Empty Prompt', 'Please write a descriptive prompt to generate a wallpaper.', '⚠️');
      return;
    }

    if (!isPremium && remainingCreations === 0) {
      showCustomAlert(
        'No Creations Left',
        'You have used all your free AI creations. Watch a quick video ad to get 3 more creations!',
        '📺',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Watch Ad',
            onPress: async () => {
              const success = await showRewardedAd();
              if (success) {
                const next = 3;
                await AsyncStorage.setItem('remaining_creations', next.toString());
                setRemainingCreations(next);
                showCustomAlert('Reward Granted', 'You have successfully earned 3 AI Creations! Tap generate again to create your wallpaper.', '🎉');
              } else {
                showCustomAlert('Ad Closed', 'You must finish watching the ad to earn the creations reward.', '⚠️');
              }
            }
          }
        ]
      );
      return;
    }

    Keyboard.dismiss();
    setGenerating(true);
    setGeneratedWp(null);

    try {
      const wallpaper = await api.generateAI(prompt);
      setGeneratedWp(wallpaper);

      if (!isPremium) {
        const next = Math.max(0, remainingCreations - 1);
        await AsyncStorage.setItem('remaining_creations', next.toString());
        setRemainingCreations(next);
      }
    } catch (e: any) {
      console.error(e);
      showCustomAlert(
        'Generation Failed',
        e?.message || 'An error occurred during AI image generation. Please try again.',
        '🚫'
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleSuggestionPress = (p: string) => {
    setPrompt(p);
  };

  const handleViewDetails = () => {
    if (generatedWp) {
      router.push({
        pathname: '/wallpaper/[id]',
        params: { id: generatedWp._id },
      } as any);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#0d051c', Colors.bg, Colors.bg]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={styles.headerTitle}>AI Art Generator</Text>
            <Text style={styles.headerSubtitle}>Create unique wallpapers from text</Text>
          </View>
          {!isPremium && (
            <View style={styles.creationsBadge}>
              <Text style={styles.creationsBadgeText}>🎨 {remainingCreations} left</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {generating ? (
          // Loading State
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.accent} />
            <Text style={styles.loadingTitle}>Dreaming Up Art...</Text>
            <View style={styles.quoteBox}>
              <Text style={styles.loadingQuote}>{LOADING_QUOTES[loadingQuoteIndex]}</Text>
            </View>
            <Text style={styles.loadingTip}>Note: Generation usually takes about 10-15 seconds.</Text>
          </View>
        ) : generatedWp ? (
          // Results State
          <View style={styles.resultsContainer}>
            <View style={styles.previewCard}>
              <Image
                source={{ uri: generatedWp.imageUrl }}
                style={styles.previewImage}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
              <View style={styles.previewBadge}>
                <Text style={styles.previewBadgeText}>✨ Generated</Text>
              </View>
            </View>

            <Text style={styles.resultPromptTitle}>"{generatedWp.title}"</Text>

            <View style={styles.resultsActions}>
              <Pressable style={styles.viewDetailsBtn} onPress={handleViewDetails}>
                <LinearGradient
                  colors={[Colors.accent, Colors.accent2]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientBtn}
                >
                  <Text style={styles.viewDetailsText}>View Details & Set ➡️</Text>
                </LinearGradient>
              </Pressable>

              <Pressable 
                style={styles.resetBtn} 
                onPress={() => {
                  setGeneratedWp(null);
                  setPrompt('');
                }}
              >
                <Text style={styles.resetBtnText}>Create Another 🎨</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          // Input State
          <View style={styles.inputContainer}>
            <Text style={styles.sectionLabel}>Describe your wallpaper</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                multiline
                numberOfLines={5}
                placeholder="Describe what you want to see... E.g., 'An enchanted cosmic jellyfish floating in an underwater coral reef, glowing neon colors, 8k resolution, vertical wallpaper'"
                placeholderTextColor={Colors.textDim}
                value={prompt}
                onChangeText={setPrompt}
                maxLength={400}
              />
              <Text style={styles.charCount}>{prompt.length}/400</Text>
            </View>

            <Text style={styles.sectionLabel}>Need ideas? Tap a suggestion</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.suggestionsScroll}
              contentContainerStyle={styles.suggestionsContent}
            >
              {SUGGESTIONS.map((item) => (
                <Pressable
                  key={item.label}
                  style={styles.suggestionChip}
                  onPress={() => handleSuggestionPress(item.prompt)}
                >
                  <Text style={styles.suggestionText}>{item.label}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <Pressable style={styles.generateBtn} onPress={handleGenerate}>
              <LinearGradient
                colors={[Colors.accent, Colors.accent2]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientBtn}
              >
                <Text style={styles.generateBtnText}>Generate Wallpaper ✨</Text>
              </LinearGradient>
            </Pressable>
          </View>
        )}
      </ScrollView>
      <FancyAlert
        visible={fancyAlert.visible}
        title={fancyAlert.title}
        message={fancyAlert.message}
        icon={fancyAlert.icon}
        buttons={fancyAlert.buttons}
        onClose={() => setFancyAlert((prev) => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  inputContainer: {
    marginTop: Spacing.md,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputWrapper: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  textInput: {
    color: Colors.text,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right',
    color: Colors.textDim,
    fontSize: 11,
    marginTop: Spacing.sm,
  },
  suggestionsScroll: {
    marginBottom: Spacing.xxl,
  },
  suggestionsContent: {
    gap: Spacing.sm,
    paddingRight: Spacing.xl,
  },
  suggestionChip: {
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
  },
  suggestionText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  generateBtn: {
    borderRadius: Radius.full,
    overflow: 'hidden',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  gradientBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  quoteBox: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    width: '100%',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  loadingQuote: {
    color: Colors.text,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  loadingTip: {
    color: Colors.textDim,
    fontSize: 12,
    textAlign: 'center',
  },
  resultsContainer: {
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  previewCard: {
    width: width * 0.65,
    aspectRatio: 9 / 16,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
    marginBottom: Spacing.xl,
    position: 'relative',
  },
  previewImage: {
    flex: 1,
  },
  previewBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(5, 5, 8, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  previewBadgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  resultPromptTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xxl,
    fontStyle: 'italic',
  },
  resultsActions: {
    width: '100%',
    gap: Spacing.md,
  },
  viewDetailsBtn: {
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  viewDetailsText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  resetBtn: {
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.full,
    paddingVertical: 16,
    alignItems: 'center',
  },
  resetBtnText: {
    color: Colors.textMuted,
    fontSize: 15,
    fontWeight: '700',
  },
  creationsBadge: {
    backgroundColor: 'rgba(139,92,246,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.3)',
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  creationsBadgeText: {
    color: '#a78bfa',
    fontSize: 12,
    fontWeight: '700',
  },
});
