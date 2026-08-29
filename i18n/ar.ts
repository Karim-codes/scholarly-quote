export default {
  // Tab bar
  tabs: {
    today: 'اليوم',
    browse: 'تصفح',
    saved: 'المحفوظة',
    settings: 'الإعدادات',
  },

  // Today screen
  today: {
    greeting: 'السلام عليكم',
    dailyWisdom: 'حكمة اليوم',
    quoteOfTheDay: 'اقتباس اليوم',
    swipeHint: 'اسحب للمزيد',
    savedQuotes: 'الاقتباسات المحفوظة',
    seeAll: 'عرض الكل',
    recentWisdom: 'حكم حديثة',
    streakLabel: 'أيام متتالية',
    share: 'مشاركة',
    save: 'حفظ',
  },

  // Browse screen
  browse: {
    title: 'تصفح',
    subtitle: 'استكشف الحكمة',
    scholars: 'العلماء',
    topics: 'المواضيع',
    all: 'الكل',
    clearFilter: 'مسح الفلتر',
    quoteCount: '{{count}} اقتباس',
    quoteCount_plural: '{{count}} اقتباسات',
    premium: 'مميز',
  },

  // Saved screen
  saved: {
    title: 'المحفوظة',
    subtitle: '{{count}} اقتباس محفوظ',
    subtitle_plural: '{{count}} اقتباسات محفوظة',
    emptyTitle: 'لا توجد اقتباسات محفوظة بعد',
    emptyDesc: 'اضغط على أيقونة العلامة المرجعية على أي اقتباس لحفظه هنا',
    browseCta: 'تصفح الاقتباسات',
  },

  // Auth
  auth: {
    brand: 'SCHOLAR QUOTE',
    signInTitle: 'مرحباً بعودتك',
    signUpTitle: 'أنشئ حسابك',
    subtitle: 'سجّل الدخول لمزامنة اقتباساتك المحفوظة عبر أجهزتك',
    name: 'الاسم',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    signIn: 'تسجيل الدخول',
    signUp: 'إنشاء حساب',
    toggleToSignUp: 'ليس لديك حساب؟ أنشئ حساباً',
    toggleToSignIn: 'لديك حساب بالفعل؟ سجّل الدخول',
    or: 'أو',
    google: 'المتابعة عبر Google',
    apple: 'المتابعة عبر Apple',
    title: 'تسجيل الدخول',
    notConfigured: 'لم يتم إعداد تسجيل الدخول بعد. أضف مفاتيح Firebase لتفعيل الحسابات.',
    errEmpty: 'الرجاء إدخال البريد الإلكتروني وكلمة المرور.',
    errInvalid: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    errInUse: 'يوجد حساب بالفعل بهذا البريد الإلكتروني.',
    errWeak: 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.',
    errEmail: 'الرجاء إدخال بريد إلكتروني صالح.',
    errNotConfigured: 'لم يتم إعداد تسجيل الدخول بعد. حاول مرة أخرى لاحقاً.',
    errGeneric: 'حدث خطأ ما. الرجاء المحاولة مرة أخرى.',
    googleUnavailable: 'يتطلب تسجيل الدخول عبر Google نسخة تطوير مخصصة أو نسخة إنتاج. تسجيل الدخول بالبريد متاح بعد إعداد Firebase.',
  },

  // Save limit paywall
  saveLimit: {
    title: 'تم بلوغ حد الحفظ',
    message: 'يمكن للحسابات المجانية حفظ ما يصل إلى {{count}} اقتباس. ترقَّ إلى المميز للحفظ غير المحدود والمجموعات.',
    upgrade: 'ترقية',
    notNow: 'ليس الآن',
  },

  // Settings screen
  settings: {
    title: 'الإعدادات',
    guestUser: 'مستخدم زائر',
    signInPrompt: 'سجّل الدخول لمزامنة بياناتك',
    upgradePremium: 'ادعم Scholar Quote',
    premiumDesc: 'ساعدنا في إبقاء التطبيق مجانياً وبدون إعلانات',
    premiumActive: '✦ داعم',
    premiumActiveDesc: 'جزاك الله خيراً على دعمك',
    signOutConfirm: 'هل أنت متأكد أنك تريد تسجيل الخروج؟',
    cancel: 'إلغاء',
    general: 'عام',
    language: 'اللغة',
    notifications: 'الإشعارات',
    appearance: 'المظهر',
    widget: 'الأداة',
    widgetSize: 'حجم الأداة',
    widgetTheme: 'مظهر الأداة',
    support: 'الدعم',
    helpFaq: 'المساعدة والأسئلة الشائعة',
    sendFeedback: 'إرسال ملاحظات',
    rateApp: 'تقييم في متجر التطبيقات',
    shareWithFriends: 'مشاركة مع الأصدقاء',
    about: 'حول',
    aboutApp: 'حول Scholar Quote',
    terms: 'شروط الخدمة',
    privacy: 'سياسة الخصوصية',
    version: 'الإصدار',
    signOut: 'تسجيل الخروج',
    footerDua: 'اللهم اجعلها صدقة جارية',
    english: 'الإنجليزية',
    arabic: 'العربية',
    dark: 'داكن',
    medium: 'متوسط',
    classic: 'كلاسيكي',
  },

  // Support screen (previously premium)
  premium: {
    title: 'SCHOLAR QUOTE',
    subtitle: 'ادعمنا',
    desc: 'هذا التطبيق مجاني بالكامل — لوجه الله.\nساعدنا في استمراره وتطويره.',
    feature1: 'جميع الميزات مجانية — للأبد',
    feature2: 'الأدوات والمظاهر والتذكيرات — كلها لك',
    feature3: 'حفظ غير محدود ومجموعات',
    feature4: 'دعمك يبقي الخوادم تعمل',
    feature5: 'احصل على شارة داعم على ملفك',
    freeNote: 'كل الميزات مجانية. تبرعك يساعدنا في إضافة المزيد من العلماء وإصلاح الأخطاء وإبقاء التطبيق بدون إعلانات.',
    unlockScholars: 'جميع الاقتباسات والعلماء — مجاناً دائماً',
    supporterBadge: '✦ داعم',
    supportPrice: '£2.99',
    oneTime: 'دفعة واحدة — جزاك الله خيراً',
    ctaSupport: 'ادعم بـ £2.99',
    ctaActive: 'شكراً لدعمك ❤️',
    legal: 'سيتم تحصيل الدفع من حساب متجر التطبيقات الخاص بك. هذا شراء لمرة واحدة وليس اشتراكاً.',
    restore: 'استعادة المشتريات',
    successTitle: 'جزاك الله خيراً!',
    successMsg: 'شكراً لدعمك لتطبيق Scholar Quote. لديك الآن شارة داعم.',
    failedTitle: 'لم يكتمل الشراء',
    failedMsg: 'تم إلغاء الشراء أو تعذّر إتمامه. لم يتم تحصيل أي مبلغ.',
    restoredTitle: 'تمت استعادة المشتريات',
    restoredMsg: 'تمت استعادة حالة الداعم الخاصة بك.',
    nothingTitle: 'لا شيء للاستعادة',
    nothingMsg: 'لم نتمكن من العثور على عملية شراء سابقة على هذا الحساب.',
    ok: 'حسناً',
  },

  // Quote detail
  quote: {
    source: 'المصدر',
    scholar: 'العالِم',
    topic: 'الموضوع',
    share: 'مشاركة',
    save: 'حفظ',
    saved: 'محفوظ',
    viewScholar: 'عرض العالِم',
  },

  // Scholar profile
  scholar: {
    quotes: 'الاقتباسات',
    about: 'نبذة',
    era: 'العصر',
    school: 'المذهب',
    totalQuotes: 'عدد الاقتباسات',
  },

  // Topics
  topics: {
    Heart: 'القلب',
    Knowledge: 'العلم',
    Dunya: 'الدنيا',
    Character: 'الأخلاق',
    Spirituality: 'الروحانية',
    Patience: 'الصبر',
    Gratitude: 'الشكر',
    Death: 'الموت',
    Brotherhood: 'الأخوة',
  },

  // Share modal
  share: {
    title: 'مشاركة الاقتباس',
    textOnly: 'نسخ النص',
    textOnlyDesc: 'نسخ نص الاقتباس للرسائل',
    image: 'صورة للمشاركة',
    imageDesc: 'بطاقة جميلة لوسائل التواصل',
    storyExport: 'تصدير كقصة',
    storyExportDesc: 'صورة عمودية 9:16 للقصص وخلفيات الشاشة',
    shareImage: 'مشاركة صورة الاقتباس',
    imageUnavailable: 'يتطلب نسخة تطوير',
    imageUnavailableDesc: 'تصدير الصور غير متاح في Expo Go. شغّل "npx expo run:ios" أو أنشئ بناء EAS لتفعيل هذه الميزة.',
  },

  // Commentary
  commentary: {
    title: 'السياق والشرح',
    noCommentary: 'الشرح قادم قريبًا لهذا الاقتباس.',
    tapToFlip: 'اضغط للسياق',
    tapToReturn: 'اضغط للعودة',
  },

  // Common
  common: {
    appName: 'Scholar Quote',
    back: 'رجوع',
    close: 'إغلاق',
    cancel: 'إلغاء',
  },
};
