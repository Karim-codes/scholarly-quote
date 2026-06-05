/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: "widget",
  name: "ScholarQuoteWidget",
  displayName: "Scholar Quote",
  icon: "../../assets/images/icon.png",
  deploymentTarget: "17.0",
  colors: {
    $accent: "#c4a882",
    $widgetBackground: "#0a0a0a",
  },
  entitlements: {
    // Mirror the App Group from the main app so we can share UserDefaults.
    "com.apple.security.application-groups":
      config.ios?.entitlements?.["com.apple.security.application-groups"] ?? [
        "group.com.scholarquote.app",
      ],
  },
  frameworks: ["SwiftUI", "WidgetKit"],
});
