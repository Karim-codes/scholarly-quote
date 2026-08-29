export default {
  // Tab bar
  tabs: {
    today: 'Today',
    browse: 'Browse',
    saved: 'Saved',
    settings: 'Settings',
  },

  // Today screen
  today: {
    greeting: 'Assalamu Alaikum',
    dailyWisdom: 'DAILY WISDOM',
    quoteOfTheDay: 'Quote of the Day',
    swipeHint: 'Swipe for more',
    savedQuotes: 'Saved Quotes',
    seeAll: 'See All',
    recentWisdom: 'Recent Wisdom',
    streakLabel: 'day streak',
    share: 'Share',
    save: 'Save',
  },

  // Browse screen
  browse: {
    title: 'Browse',
    subtitle: 'Explore the wisdom',
    scholars: 'SCHOLARS',
    topics: 'TOPICS',
    all: 'All',
    clearFilter: 'Clear filter',
    quoteCount: '{{count}} quote',
    quoteCount_plural: '{{count}} quotes',
    premium: 'PREMIUM',
  },

  // Saved screen
  saved: {
    title: 'Saved',
    subtitle: '{{count}} quote saved',
    subtitle_plural: '{{count}} quotes saved',
    emptyTitle: 'No saved quotes yet',
    emptyDesc: 'Tap the bookmark icon on any quote to save it here',
    browseCta: 'Browse Quotes',
  },

  // Auth
  auth: {
    brand: 'SCHOLAR QUOTE',
    signInTitle: 'Welcome back',
    signUpTitle: 'Create your account',
    subtitle: 'Sign in to sync your saved quotes across devices',
    name: 'Name',
    email: 'Email',
    password: 'Password',
    signIn: 'Sign In',
    signUp: 'Create Account',
    toggleToSignUp: "Don't have an account? Sign up",
    toggleToSignIn: 'Already have an account? Sign in',
    or: 'OR',
    google: 'Continue with Google',
    apple: 'Continue with Apple',
    title: 'Sign In',
    notConfigured: 'Sign-in is not yet configured. Add your Firebase keys to enable accounts.',
    errEmpty: 'Please enter your email and password.',
    errInvalid: 'Incorrect email or password.',
    errInUse: 'An account already exists with this email.',
    errWeak: 'Password should be at least 6 characters.',
    errEmail: 'Please enter a valid email address.',
    errNotConfigured: 'Sign-in is not configured yet. Please try again later.',
    errGeneric: 'Something went wrong. Please try again.',
    googleUnavailable: 'Google sign-in needs a custom development or production build. Email sign-in is available once Firebase is configured.',
  },

  // Save limit paywall
  saveLimit: {
    title: 'Save limit reached',
    message: 'Free accounts can save up to {{count}} quotes. Upgrade to Premium for unlimited saves and collections.',
    upgrade: 'Upgrade',
    notNow: 'Not now',
  },

  // Settings screen
  settings: {
    title: 'Settings',
    guestUser: 'Guest User',
    signInPrompt: 'Sign in to sync your data',
    upgradePremium: 'Support Scholar Quote',
    premiumDesc: 'Help keep the app free & ad-free',
    premiumActive: '✦ Supporter',
    premiumActiveDesc: 'Jazākallāhu khayran for your support',
    signOutConfirm: 'Are you sure you want to sign out?',
    cancel: 'Cancel',
    general: 'General',
    language: 'Language',
    notifications: 'Notifications',
    appearance: 'Appearance',
    widget: 'Widget',
    widgetSize: 'Widget Size',
    widgetTheme: 'Widget Theme',
    support: 'Support',
    helpFaq: 'Help & FAQ',
    sendFeedback: 'Send Feedback',
    rateApp: 'Rate on App Store',
    shareWithFriends: 'Share with Friends',
    about: 'About',
    aboutApp: 'About Scholar Quote',
    terms: 'Terms of Service',
    privacy: 'Privacy Policy',
    version: 'Version',
    signOut: 'Sign Out',
    footerDua: 'May Allah make it a sadaqah jariyah',
    english: 'English',
    arabic: 'Arabic',
    dark: 'Dark',
    medium: 'Medium',
    classic: 'Classic',
  },

  // Support screen (previously premium)
  premium: {
    title: 'SCHOLAR QUOTE',
    subtitle: 'SUPPORT US',
    desc: 'This app is completely free — for the sake of Allah.\nHelp us keep it running and growing.',
    feature1: 'All features are free — forever',
    feature2: 'Widgets, themes, reminders — all yours',
    feature3: 'Unlimited saves & collections',
    feature4: 'Your support keeps servers running',
    feature5: 'Earn a Supporter badge on your profile',
    freeNote: 'Every feature is free. Your donation helps us add more scholars, fix bugs, and keep the app ad-free.',
    unlockScholars: 'ALL QUOTES & SCHOLARS — ALWAYS FREE',
    supporterBadge: '✦ SUPPORTER',
    supportPrice: '£2.99',
    oneTime: 'One-time — jazākAllāhu khayran',
    ctaSupport: 'Support for £2.99',
    ctaActive: 'Thank you for your support ❤️',
    legal: 'Payment will be charged through your App Store account. This is a one-time purchase, not a subscription.',
    restore: 'Restore Purchases',
    successTitle: 'Jazākallāhu Khayran!',
    successMsg: 'Thank you for supporting Scholar Quote. You now have a Supporter badge.',
    failedTitle: 'Purchase Incomplete',
    failedMsg: 'The purchase was cancelled or could not be completed. No charge was made.',
    restoredTitle: 'Purchases Restored',
    restoredMsg: 'Your supporter status has been restored.',
    nothingTitle: 'Nothing to Restore',
    nothingMsg: 'We couldn\'t find a previous purchase on this account.',
    ok: 'OK',
  },

  // Quote detail
  quote: {
    source: 'SOURCE',
    scholar: 'SCHOLAR',
    topic: 'TOPIC',
    share: 'Share',
    save: 'Save',
    saved: 'Saved',
    viewScholar: 'View scholar',
  },

  // Scholar profile
  scholar: {
    quotes: 'QUOTES',
    about: 'ABOUT',
    era: 'Era',
    school: 'School',
    totalQuotes: 'Total Quotes',
  },

  // Topics
  topics: {
    Heart: 'Heart',
    Knowledge: 'Knowledge',
    Dunya: 'Dunya',
    Character: 'Character',
    Spirituality: 'Spirituality',
    Patience: 'Patience',
    Gratitude: 'Gratitude',
    Death: 'Death',
    Brotherhood: 'Brotherhood',
  },

  // Share modal
  share: {
    title: 'Share Quote',
    textOnly: 'Copy Text',
    textOnlyDesc: 'Copy quote text for messaging',
    image: 'Shareable Image',
    imageDesc: 'Beautiful card for social media',
    storyExport: 'Export Story Style',
    storyExportDesc: 'Vertical 9:16 image for Stories & wallpapers',
    shareImage: 'Share Quote Image',
    imageUnavailable: 'Development Build Required',
    imageUnavailableDesc: 'Image export is not available in Expo Go. Run "npx expo run:ios" or create an EAS build to enable this feature.',
  },

  // Commentary
  commentary: {
    title: 'Context & Commentary',
    noCommentary: 'Commentary coming soon for this quote.',
    tapToFlip: 'Tap for context',
    tapToReturn: 'Tap to return',
  },

  // Common
  common: {
    appName: 'Scholar Quote',
    back: 'Back',
    close: 'Close',
    cancel: 'Cancel',
  },
};
