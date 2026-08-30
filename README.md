# Scholar Quote

Scholar Quote is a mobile app for daily wisdom from classical Islamic scholars. It presents carefully organized quotes with Arabic support, source attribution, contextual commentary, saved quotes, sharing tools, and an iOS home-screen widget.

The project is built with Expo, React Native, Expo Router, bundled quote data, Firebase Authentication, and optional RevenueCat support for in-app supporter purchases.

## Highlights

- Daily quote experience with scholar, book, topic, and commentary.
- Swipe left or right on the main card to browse more quotes.
- Arabic and English app copy, with Arabic quote rendering support.
- Browse by scholar or topic.
- Save favorite quotes locally.
- Share quotes as text or designed image cards.
- iOS widget support for the daily quote.
- Firebase-backed sign-in flow, gated behind environment configuration.
- RevenueCat integration layer for future supporter purchases.

## Screens

- Today: daily quote, save, share, commentary, and swipe browsing.
- Browse: filter quotes by scholar or topic.
- Saved: saved quote library.
- Settings: language, quote language, support, feedback, legal links, and account options.

## Tech Stack

- Expo SDK 54
- React Native 0.81
- React 19
- Expo Router
- TypeScript
- Firebase Auth
- i18next / react-i18next
- RevenueCat integration wrapper

## Local Development

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Fill in the values needed for the features you want to test:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=

EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=

EXPO_PUBLIC_REVENUECAT_API_KEY_IOS=
EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID=
```

Start the app:

```bash
npm run start
```

Run platform builds:

```bash
npm run ios
npm run android
```

Run the TypeScript check:

```bash
npx tsc --noEmit
```

## Configuration Notes

- `.env` is intentionally ignored and should never be committed.
- The `EXPO_PUBLIC_*` variables are bundled into client builds, so they must not contain private server secrets, service account JSON, admin tokens, or private keys.
- Firebase and Google sign-in require real provider configuration before production use.
- RevenueCat purchases require `react-native-purchases`, public SDK keys, store products, and the expected `premium` entitlement.
- iOS widget builds require the Apple app group and Apple Developer Team ID to match your Apple Developer account.

## Current Release Checklist

- Add `ios.appleTeamId` in `app.json`.
- Replace the placeholder App Store ID in Settings after the app is created in App Store Connect.
- Confirm `https://wisdom-flow-archive.vercel.app/terms` and `https://wisdom-flow-archive.vercel.app/privacy` are live before release.
- Configure Firebase Auth and Google OAuth clients.
- Configure RevenueCat and store products if supporter purchases are enabled.
- Run `npx expo-doctor` with network access.
- Run a clean iOS and Android build before submitting.
- Review `npm audit` results and address production-relevant dependency issues.

## Ownership And License

This repository is published for visibility and portfolio review only.

All rights are reserved by the project owner. The code, app concept, quote collection, design, branding, and related assets may not be copied, redistributed, resold, republished, or used to create a competing or derivative app without explicit written permission.

Public access to this repository does not grant an open-source license.

## Security

Do not commit credentials, private keys, signing files, service account files, store certificates, or production `.env` files. The project `.gitignore` is configured to exclude common sensitive files, but every commit should still be reviewed before pushing.
