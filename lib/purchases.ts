import { Platform } from 'react-native';

/**
 * In-app purchase integration layer (RevenueCat).
 *
 * This module is the single integration point for premium purchases. It is
 * designed to work in three environments:
 *
 *   1. Production build with `react-native-purchases` installed + API keys set
 *      → real RevenueCat purchases & entitlement checks.
 *   2. Expo Go / development (module not installed)
 *      → a safe simulated purchase so the paywall + gating can be tested.
 *
 * To go live:
 *   - `npx expo install react-native-purchases`
 *   - Add your RevenueCat public SDK keys below (or via app config / env).
 *   - Create an entitlement called `premium` and `lifetime` / `monthly`
 *     products in RevenueCat that map to the App Store / Play Store products.
 */

export type PlanId = 'lifetime' | 'monthly';

// RevenueCat public SDK keys — replace with your real keys before launch.
const REVENUECAT_API_KEY_IOS = '';
const REVENUECAT_API_KEY_ANDROID = '';

// The entitlement identifier configured in the RevenueCat dashboard.
const ENTITLEMENT_ID = 'premium';

// Map our internal plan ids to RevenueCat product identifiers.
const PRODUCT_IDS: Record<PlanId, string> = {
  lifetime: 'scholar_quote_lifetime',
  monthly: 'scholar_quote_monthly',
};

let Purchases: any = null;
let configured = false;

function loadSdk(): any {
  if (Purchases) return Purchases;
  try {
    // Lazy require so Expo Go (without the native module) doesn't crash.
    Purchases = require('react-native-purchases').default;
  } catch {
    Purchases = null;
  }
  return Purchases;
}

function entitlementActive(customerInfo: any): boolean {
  try {
    return Boolean(customerInfo?.entitlements?.active?.[ENTITLEMENT_ID]);
  } catch {
    return false;
  }
}

/**
 * Configure the SDK. Returns the current entitlement status when the real SDK
 * is available, or `null` when running in the simulated environment.
 */
export async function configurePurchases(): Promise<boolean | null> {
  const sdk = loadSdk();
  if (!sdk) return null;

  const apiKey = Platform.OS === 'ios' ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;
  if (!apiKey) return null;

  try {
    if (!configured) {
      sdk.configure({ apiKey });
      configured = true;
    }
    const customerInfo = await sdk.getCustomerInfo();
    return entitlementActive(customerInfo);
  } catch {
    return null;
  }
}

/**
 * Purchase a plan. Returns true when the premium entitlement becomes active.
 * Falls back to a simulated success when the native SDK is unavailable.
 */
export async function purchaseEntitlement(plan: PlanId): Promise<boolean> {
  const sdk = loadSdk();

  // Simulated purchase for Expo Go / dev — lets us test gating end-to-end.
  if (!sdk || !configured) {
    return true;
  }

  try {
    const offerings = await sdk.getOfferings();
    const packages: any[] = offerings?.current?.availablePackages ?? [];
    const target =
      packages.find((p: any) => p?.product?.identifier === PRODUCT_IDS[plan]) ?? packages[0];
    if (!target) return false;

    const { customerInfo } = await sdk.purchasePackage(target);
    return entitlementActive(customerInfo);
  } catch (e: any) {
    // User cancelled or purchase failed.
    return false;
  }
}

/**
 * Restore previous purchases. Returns true when premium is active afterwards.
 */
export async function restoreEntitlement(): Promise<boolean> {
  const sdk = loadSdk();
  if (!sdk || !configured) return false;

  try {
    const customerInfo = await sdk.restorePurchases();
    return entitlementActive(customerInfo);
  } catch {
    return false;
  }
}
