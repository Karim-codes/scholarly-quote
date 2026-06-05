import '@/i18n';
import { initAppStore } from '@/store/useAppStore';
import { initAuth } from '@/store/useAuthStore';
import { initLanguage } from '@/store/useLanguageStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import {
    Cinzel_400Regular,
} from '@expo-google-fonts/cinzel';

import { Colors } from '@/constants/Colors';

export {
    ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

const ScholarQuoteTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.accent,
    background: Colors.background,
    card: Colors.background,
    text: Colors.textPrimary,
    border: Colors.border,
    notification: Colors.accent,
  },
};

function AppSplash({ opacity }: { opacity: Animated.Value }) {
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(16)).current;
  const lineScale = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const starOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(starOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(titleY, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.timing(lineScale, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(subtitleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[splashStyles.container, { opacity }]}>
      <View style={splashStyles.content}>
        {/* Decorative star */}
        <Animated.Text style={[splashStyles.star, { opacity: starOpacity }]}>✦</Animated.Text>

        {/* App name */}
        <Animated.Text
          style={[
            splashStyles.title,
            { opacity: titleOpacity, transform: [{ translateY: titleY }] },
          ]}
        >
          Scholar Quote
        </Animated.Text>

        {/* Divider line */}
        <Animated.View
          style={[splashStyles.line, { transform: [{ scaleX: lineScale }] }]}
        />

        {/* Arabic subtitle */}
        <Animated.Text style={[splashStyles.subtitle, { opacity: subtitleOpacity }]}>
          حكمة العلماء
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

export default function RootLayout() {
  const [langReady, setLangReady] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
    Cinzel_400Regular,
  });

  useEffect(() => {
    initAuth();
    Promise.all([initLanguage(), initAppStore()]).finally(() => setLangReady(true));
  }, []);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded && langReady) {
      SplashScreen.hideAsync();
      // Let our in-app splash breathe for a moment, then fade out
      Animated.sequence([
        Animated.delay(500),
        Animated.timing(splashOpacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start(() => setSplashDone(true));
    }
  }, [loaded, langReady]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {splashDone && <RootLayoutNav />}
      {!splashDone && <AppSplash opacity={splashOpacity} />}
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  return (
    <ThemeProvider value={ScholarQuoteTheme}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="quote/[id]"
          options={{
            headerShown: false,
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="scholar/[id]"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="premium"
          options={{
            headerShown: false,
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="auth"
          options={{
            headerShown: false,
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}

const splashStyles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 14,
  },
  star: {
    fontSize: 20,
    color: Colors.scholars.ibnQayyim, // warm sand gold
    marginBottom: 4,
    letterSpacing: 4,
  },
  title: {
    fontFamily: 'Cinzel_400Regular',
    fontSize: 28,
    letterSpacing: 3,
    color: Colors.textPrimary,
  },
  line: {
    width: 120,
    height: 1,
    backgroundColor: Colors.scholars.ibnQayyim,
    opacity: 0.6,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '300',
    color: Colors.scholars.ibnQayyim,
    letterSpacing: 1,
    opacity: 0.85,
  },
});
