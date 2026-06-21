import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const USER_NAME_KEY = '@scholar_quote_user_name';
const ONBOARDED_KEY = '@scholar_quote_onboarded';

let userName = '';
let hasOnboarded = false;
let initialized = false;
let listeners: Array<() => void> = [];

function notify() {
  listeners.forEach((l) => l());
}

export async function initUserStore(): Promise<void> {
  if (initialized) return;
  initialized = true;
  try {
    const [name, onboarded] = await Promise.all([
      AsyncStorage.getItem(USER_NAME_KEY),
      AsyncStorage.getItem(ONBOARDED_KEY),
    ]);
    if (name) userName = name;
    if (onboarded === 'true') hasOnboarded = true;
  } catch (_) {}
  notify();
}

export async function setUserName(name: string): Promise<void> {
  userName = name.trim();
  await AsyncStorage.setItem(USER_NAME_KEY, userName);
  notify();
}

export async function completeOnboarding(name: string): Promise<void> {
  await setUserName(name);
  hasOnboarded = true;
  await AsyncStorage.setItem(ONBOARDED_KEY, 'true');
  notify();
}

export function getUserName(): string {
  return userName;
}

export function getHasOnboarded(): boolean {
  return hasOnboarded;
}

export function useUser() {
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const listener = () => forceUpdate((n) => n + 1);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  const updateName = useCallback(async (name: string) => {
    await setUserName(name);
  }, []);

  return {
    name: userName,
    hasOnboarded,
    updateName,
  };
}
