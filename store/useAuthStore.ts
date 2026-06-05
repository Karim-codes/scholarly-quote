import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
  type AuthCredential,
  type User,
} from 'firebase/auth';
import { useEffect, useState } from 'react';

import { auth, isFirebaseConfigured } from '@/lib/firebase';

export type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

let currentUser: AuthUser | null = null;
let authReady = false;
let initialized = false;
let listeners: Array<() => void> = [];

function notify() {
  listeners.forEach((l) => l());
}

function toAuthUser(user: User | null): AuthUser | null {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  };
}

/** Begin listening for auth state. Safe to call once at app start. */
export function initAuth(): void {
  if (initialized) return;
  initialized = true;
  if (!auth) {
    authReady = true;
    notify();
    return;
  }
  onAuthStateChanged(auth, (user) => {
    currentUser = toAuthUser(user);
    authReady = true;
    notify();
  });
}

function ensureAuth() {
  if (!auth) {
    throw new Error('not-configured');
  }
  return auth;
}

export async function signUpWithEmail(name: string, email: string, password: string): Promise<void> {
  const a = ensureAuth();
  const cred = await createUserWithEmailAndPassword(a, email.trim(), password);
  if (name.trim()) {
    await updateProfile(cred.user, { displayName: name.trim() });
    currentUser = toAuthUser(cred.user);
    notify();
  }
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  const a = ensureAuth();
  await signInWithEmailAndPassword(a, email.trim(), password);
}

/** Used by Google / Apple flows after obtaining a provider credential. */
export async function signInWithProviderCredential(credential: AuthCredential): Promise<void> {
  const a = ensureAuth();
  await signInWithCredential(a, credential);
}

export async function signOut(): Promise<void> {
  if (!auth) return;
  await fbSignOut(auth);
}

export function useAuth() {
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const listener = () => forceUpdate((n) => n + 1);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  return {
    user: currentUser,
    isSignedIn: Boolean(currentUser),
    authReady,
    isConfigured: isFirebaseConfigured,
  };
}
