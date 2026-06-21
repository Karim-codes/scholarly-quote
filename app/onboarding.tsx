import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BorderRadius, Colors, Spacing } from '@/constants/Colors';
import { completeOnboarding } from '@/store/useUserStore';

export default function OnboardingScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const handleContinue = async () => {
    if (!name.trim()) {
      // Shake the input
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
      return;
    }
    setBusy(true);
    await completeOnboarding(name.trim());
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.star}>✦</Text>
            <Text style={styles.greeting}>السلام عليكم</Text>
            <Text style={styles.greetingEn}>Peace be upon you</Text>
          </View>

          {/* Question */}
          <View style={styles.questionSection}>
            <Text style={styles.question}>What should we call you?</Text>
            <Text style={styles.hint}>
              This will be used to personalise your experience
            </Text>
          </View>

          {/* Input */}
          <Animated.View style={[styles.inputWrapper, { transform: [{ translateX: shakeAnim }] }]}>
            <FontAwesome name="user-o" size={16} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor={Colors.textMuted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleContinue}
            />
          </Animated.View>

          {/* Spacer */}
          <View style={{ flex: 1 }} />

          {/* Continue button */}
          <TouchableOpacity
            style={[styles.button, !name.trim() && styles.buttonDisabled]}
            onPress={handleContinue}
            activeOpacity={0.8}
            disabled={busy}
          >
            <Text style={styles.buttonText}>Continue</Text>
            <FontAwesome name="arrow-right" size={14} color={Colors.background} />
          </TouchableOpacity>

          <Text style={styles.footer}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl * 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl * 2,
  },
  star: {
    fontSize: 24,
    color: Colors.accent,
    marginBottom: Spacing.md,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '300',
    color: Colors.accent,
    marginBottom: Spacing.sm,
  },
  greetingEn: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  questionSection: {
    marginBottom: Spacing.xl,
  },
  question: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  hint: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.textMuted,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: Spacing.md,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: Colors.textPrimary,
    paddingVertical: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.md,
    paddingVertical: 16,
    gap: 10,
    marginBottom: Spacing.lg,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.background,
  },
  footer: {
    textAlign: 'center',
    fontSize: 14,
    color: Colors.textMuted,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
});
