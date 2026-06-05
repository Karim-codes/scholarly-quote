import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { configurePurchases, purchaseEntitlement, restoreEntitlement, type PlanId } from '@/lib/purchases';

// ─── Persistence keys ────────────────────────────────────────
const SAVED_KEY = '@scholar_quote_saved_ids';
const PREMIUM_KEY = '@scholar_quote_premium';
const STREAK_KEY = '@scholar_quote_streak';

// Free tier limit — premium unlocks unlimited saves.
export const FREE_SAVE_LIMIT = 20;

// ─── Shared in-memory state ──────────────────────────────────
let savedQuoteIds: Set<string> = new Set();
let isPremiumUser = false;
let streakState = { current: 0, longest: 0, lastOpen: '' };
let initialized = false;

let listeners: Array<() => void> = [];
function notify() {
  listeners.forEach((l) => l());
}

// Shared subscription hook so any component re-renders on state changes.
function useStoreSubscription() {
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const listener = () => forceUpdate((n) => n + 1);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);
}

// ─── Streak helpers ──────────────────────────────────────────
function dayString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function recordOpen() {
  const today = dayString(new Date());
  if (streakState.lastOpen === today) return;
  const yesterday = dayString(new Date(Date.now() - 86_400_000));
  streakState.current = streakState.lastOpen === yesterday ? streakState.current + 1 : 1;
  if (streakState.current > streakState.longest) {
    streakState.longest = streakState.current;
  }
  streakState.lastOpen = today;
  AsyncStorage.setItem(STREAK_KEY, JSON.stringify(streakState)).catch(() => {});
}

// ─── Init (call once at app start) ───────────────────────────
export async function initAppStore(): Promise<void> {
  if (initialized) return;
  initialized = true;
  try {
    const [savedRaw, premiumRaw, streakRaw] = await Promise.all([
      AsyncStorage.getItem(SAVED_KEY),
      AsyncStorage.getItem(PREMIUM_KEY),
      AsyncStorage.getItem(STREAK_KEY),
    ]);
    if (savedRaw) {
      savedQuoteIds = new Set(JSON.parse(savedRaw) as string[]);
    }
    if (premiumRaw === 'true') isPremiumUser = true;
    if (streakRaw) streakState = { ...streakState, ...JSON.parse(streakRaw) };
  } catch (_) {}

  recordOpen();
  notify();

  // Initialise the IAP SDK and reconcile entitlement in the background.
  configurePurchases()
    .then((active) => {
      if (typeof active === 'boolean' && active !== isPremiumUser) {
        setPremiumState(active);
      }
    })
    .catch(() => {});
}

function persistSaved() {
  AsyncStorage.setItem(SAVED_KEY, JSON.stringify(Array.from(savedQuoteIds))).catch(() => {});
}

function setPremiumState(value: boolean) {
  isPremiumUser = value;
  AsyncStorage.setItem(PREMIUM_KEY, value ? 'true' : 'false').catch(() => {});
  notify();
}

// ─── Saved quotes ────────────────────────────────────────────
export type ToggleResult = { ok: boolean; limitReached?: boolean };

export function useSavedQuotes() {
  useStoreSubscription();

  const toggleSave = useCallback((quoteId: string): ToggleResult => {
    if (savedQuoteIds.has(quoteId)) {
      savedQuoteIds.delete(quoteId);
      persistSaved();
      notify();
      return { ok: true };
    }
    // Enforce free-tier save limit.
    if (!isPremiumUser && savedQuoteIds.size >= FREE_SAVE_LIMIT) {
      return { ok: false, limitReached: true };
    }
    savedQuoteIds.add(quoteId);
    persistSaved();
    notify();
    return { ok: true };
  }, []);

  const isSaved = useCallback((quoteId: string) => savedQuoteIds.has(quoteId), []);
  const getSavedIds = useCallback(() => Array.from(savedQuoteIds), []);

  return {
    toggleSave,
    isSaved,
    getSavedIds,
    savedCount: savedQuoteIds.size,
    saveLimit: FREE_SAVE_LIMIT,
    isAtLimit: !isPremiumUser && savedQuoteIds.size >= FREE_SAVE_LIMIT,
  };
}

// ─── Premium entitlement ─────────────────────────────────────
export function usePremium() {
  useStoreSubscription();

  const purchase = useCallback(async (plan: PlanId): Promise<boolean> => {
    const success = await purchaseEntitlement(plan);
    if (success) setPremiumState(true);
    return success;
  }, []);

  const restore = useCallback(async (): Promise<boolean> => {
    const active = await restoreEntitlement();
    setPremiumState(active);
    return active;
  }, []);

  return {
    isPremium: isPremiumUser,
    purchase,
    restore,
  };
}

export function getIsPremium(): boolean {
  return isPremiumUser;
}

// ─── Streak ──────────────────────────────────────────────────
export function useStreak() {
  useStoreSubscription();
  return {
    currentStreak: streakState.current,
    longestStreak: streakState.longest,
  };
}
