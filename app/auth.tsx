import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Google from 'expo-auth-session/providers/google';
import * as Crypto from 'expo-crypto';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, OAuthProvider } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BorderRadius, Colors, Spacing } from '@/constants/Colors';
import {
  signInWithEmail,
  signInWithProviderCredential,
  signUpWithEmail,
  useAuth,
} from '@/store/useAuthStore';

WebBrowser.maybeCompleteAuthSession();

function authErrorMessage(e: any, t: (k: string) => string): string {
  const code = e?.code ?? '';
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) {
    return t('auth.errInvalid');
  }
  if (code.includes('email-already-in-use')) return t('auth.errInUse');
  if (code.includes('weak-password')) return t('auth.errWeak');
  if (code.includes('invalid-email')) return t('auth.errEmail');
  if (e?.message === 'not-configured') return t('auth.errNotConfigured');
  return t('auth.errGeneric');
}

export default function AuthScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { isConfigured, isSignedIn } = useAuth();

  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);

  const [, googleResponse, googlePrompt] = Google.useIdTokenAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  // Close the screen once the user is authenticated.
  useEffect(() => {
    if (isSignedIn) router.back();
  }, [isSignedIn]);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      AppleAuthentication.isAvailableAsync().then(setAppleAvailable).catch(() => {});
    }
  }, []);

  // Handle the Google redirect result.
  useEffect(() => {
    if (googleResponse?.type === 'success') {
      const idToken = googleResponse.params?.id_token;
      if (!idToken) return;
      setBusy(true);
      signInWithProviderCredential(GoogleAuthProvider.credential(idToken))
        .catch((e) => Alert.alert(t('auth.title'), authErrorMessage(e, t)))
        .finally(() => setBusy(false));
    }
  }, [googleResponse]);

  const handleEmailAuth = async () => {
    if (busy) return;
    if (!email.trim() || !password) {
      Alert.alert(t('auth.title'), t('auth.errEmpty'));
      return;
    }
    setBusy(true);
    try {
      if (mode === 'signUp') {
        await signUpWithEmail(name, email, password);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (e) {
      Alert.alert(t('auth.title'), authErrorMessage(e, t));
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    if (busy) return;
    if (!isConfigured) {
      Alert.alert(t('auth.title'), t('auth.errNotConfigured'));
      return;
    }
    try {
      await googlePrompt();
    } catch (e) {
      Alert.alert(t('auth.title'), authErrorMessage(e, t));
    }
  };

  const handleApple = async () => {
    if (busy) return;
    if (!isConfigured) {
      Alert.alert(t('auth.title'), t('auth.errNotConfigured'));
      return;
    }
    try {
      const rawNonce = Crypto.randomUUID();
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        rawNonce
      );
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });
      if (!credential.identityToken) throw new Error('no-token');
      const provider = new OAuthProvider('apple.com');
      const firebaseCred = provider.credential({
        idToken: credential.identityToken,
        rawNonce,
      });
      setBusy(true);
      await signInWithProviderCredential(firebaseCred);
    } catch (e: any) {
      if (e?.code === 'ERR_REQUEST_CANCELED') return;
      Alert.alert(t('auth.title'), authErrorMessage(e, t));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton} activeOpacity={0.7}>
          <FontAwesome name="close" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.brand}>{t('auth.brand')}</Text>
          <Text style={styles.title}>
            {mode === 'signIn' ? t('auth.signInTitle') : t('auth.signUpTitle')}
          </Text>
          <Text style={styles.subtitle}>{t('auth.subtitle')}</Text>

          {!isConfigured && (
            <View style={styles.notice}>
              <FontAwesome name="exclamation-circle" size={14} color={Colors.textMuted} />
              <Text style={styles.noticeText}>{t('auth.notConfigured')}</Text>
            </View>
          )}

          {mode === 'signUp' && (
            <TextInput
              style={styles.input}
              placeholder={t('auth.name')}
              placeholderTextColor={Colors.textMuted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          )}
          <TextInput
            style={styles.input}
            placeholder={t('auth.email')}
            placeholderTextColor={Colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder={t('auth.password')}
            placeholderTextColor={Colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.primaryButton, busy && styles.disabled]}
            onPress={handleEmailAuth}
            activeOpacity={0.8}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color={Colors.background} />
            ) : (
              <Text style={styles.primaryText}>
                {mode === 'signIn' ? t('auth.signIn') : t('auth.signUp')}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')}
            activeOpacity={0.7}
            style={styles.toggle}
          >
            <Text style={styles.toggleText}>
              {mode === 'signIn' ? t('auth.toggleToSignUp') : t('auth.toggleToSignIn')}
            </Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>{t('auth.or')}</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity
            style={styles.socialButton}
            onPress={handleGoogle}
            activeOpacity={0.8}
            disabled={busy}
          >
            <FontAwesome name="google" size={16} color={Colors.textPrimary} />
            <Text style={styles.socialText}>{t('auth.google')}</Text>
          </TouchableOpacity>

          {appleAvailable && (
            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleApple}
              activeOpacity={0.8}
              disabled={busy}
            >
              <FontAwesome name="apple" size={18} color={Colors.textPrimary} />
              <Text style={styles.socialText}>{t('auth.apple')}</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  brand: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 3,
    color: Colors.accent,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  primaryButton: {
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    marginTop: Spacing.sm,
  },
  disabled: {
    opacity: 0.6,
  },
  primaryText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: Colors.background,
  },
  toggle: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  toggleText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginHorizontal: Spacing.md,
    letterSpacing: 1,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    marginBottom: Spacing.sm,
  },
  socialText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});
