import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radius, Spacing } from '@/constants/Colors';

const { width } = Dimensions.get('window');

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface FancyAlertProps {
  visible: boolean;
  title: string;
  message: string;
  icon?: string; // Emoji representing the alert context, e.g. "👑", "✅", "⚠️", "🚫"
  buttons?: AlertButton[];
  onClose: () => void;
}

export default function FancyAlert({
  visible,
  title,
  message,
  icon = '💡',
  buttons,
  onClose,
}: FancyAlertProps) {
  
  const defaultButtons: AlertButton[] = buttons && buttons.length > 0 
    ? buttons 
    : [{ text: 'OK', onPress: onClose }];

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Top Decorative Icon */}
          <View style={styles.iconCircle}>
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientEnd]}
              style={styles.iconGradient}
            >
              <Text style={styles.iconText}>{icon}</Text>
            </LinearGradient>
          </View>

          {/* Heading */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {defaultButtons.map((btn, idx) => {
              const isCancel = btn.style === 'cancel';
              const isDestructive = btn.style === 'destructive';
              
              if (isCancel) {
                return (
                  <TouchableOpacity
                    key={`btn-${idx}`}
                    style={styles.laterButton}
                    activeOpacity={0.7}
                    onPress={() => {
                      onClose();
                      if (btn.onPress) btn.onPress();
                    }}
                  >
                    <Text style={styles.laterButtonText}>{btn.text}</Text>
                  </TouchableOpacity>
                );
              }

              // Default / Primary Gradient Button
              return (
                <TouchableOpacity
                  key={`btn-${idx}`}
                  style={styles.primaryButton}
                  activeOpacity={0.8}
                  onPress={() => {
                    onClose();
                    if (btn.onPress) btn.onPress();
                  }}
                >
                  <LinearGradient
                    colors={
                      isDestructive
                        ? ['#ef4444', '#b91c1c']
                        : [Colors.gradientStart, Colors.gradientEnd]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientButton}
                  >
                    <Text style={styles.primaryButtonText}>{btn.text}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 5, 8, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  container: {
    width: Math.min(width * 0.85, 340),
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  iconGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 28,
  },
  title: {
    fontSize: 19,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  message: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.lg,
  },
  buttonContainer: {
    width: '100%',
    gap: Spacing.sm,
  },
  primaryButton: {
    width: '100%',
    height: 46,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  gradientButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  laterButton: {
    width: '100%',
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radius.md,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  laterButtonText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
});
