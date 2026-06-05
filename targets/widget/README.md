# iOS Widget Setup

The Scholar Quote home-screen widget is built with **SwiftUI + WidgetKit**, linked into the Expo project via [`@bacons/apple-targets`](https://github.com/EvanBacon/expo-apple-targets) so the Swift source lives outside the generated `ios/` folder and survives `expo prebuild --clean`.

## File layout

```
targets/widget/
├── expo-target.config.js       # Plugin config (App Group, colors, frameworks)
├── Info.plist                  # WidgetKit extension point declaration
├── ScholarQuoteWidget.swift    # @main bundle + StaticConfiguration
├── QuoteProvider.swift         # TimelineProvider (reads from App Group)
├── QuoteEntry — declared inside QuoteProvider.swift
├── QuoteWidgetView.swift       # SwiftUI views (medium + large)
├── SharedQuote.swift           # Codable model + UserDefaults loader
└── Color+Hex.swift             # Hex → SwiftUI Color helper
```

## How data flows

1. RN `app/(tabs)/index.tsx` runs `syncDailyQuoteToWidget(dailyQuote)` whenever the daily quote changes.
2. `store/widgetSync.ts` writes a JSON payload into the shared App Group `UserDefaults` (suite `group.com.scholarquote.app`) using `@bacons/apple-targets`'s `ExtensionStorage`, then calls `ExtensionStorage.reloadWidget('ScholarQuoteWidget')`.
3. Swift `QuoteProvider.getTimeline` reads the JSON via `SharedQuote.load()` and returns a `Timeline` entry. Reload policy is `.after(nextMidnight)` as a safety net so the widget rotates daily even if the app never opens.
4. Tapping the widget opens `scholarquote://quote/<id>`, which Expo Router resolves to `app/quote/[id].tsx`.

## Build / run

This widget cannot run in **Expo Go** — it requires a development build.

```bash
# 1. Generate the native iOS project (creates the widget extension target,
#    entitlements, App Group, and links Swift files into Xcode).
npx expo prebuild -p ios --clean

# 2. Run the dev build on a simulator or device.
npx expo run:ios
```

After the app launches once, long-press the home screen → tap **+** → search "Scholar Quote" to add the widget.

## EAS Build / production

`@bacons/apple-targets` writes the entitlements and code-signing config so EAS Build handles the widget extension automatically. You only need to ensure your Apple Developer account has:

- The App Group `group.com.scholarquote.app` registered.
- The provisioning profile for both `com.scholarquote.app` and `com.scholarquote.app.ScholarQuoteWidget` includes that App Group.

EAS will create/sync these on first build if you let it manage credentials.

## Editing the Swift code

Open `xed ios` after a prebuild — Xcode shows the widget under the virtual `expo:targets/widget` group. Saving in Xcode writes to `targets/widget/*` in the repo, **not** to `ios/` (which is regenerated).

## Common issues

- **Widget shows placeholder forever** → the App Group isn't matching. Confirm `app.json` `ios.entitlements`, `targets/widget/expo-target.config.js`, and `SharedQuote.appGroup` all use the same identifier.
- **Build fails with "No such module 'WidgetKit'"** → run `npx expo prebuild -p ios --clean` again; the frameworks list in `expo-target.config.js` must be picked up.
- **SwiftUI preview crashes** → `xcrun simctl --set previews delete all`.
