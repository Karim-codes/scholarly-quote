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
    upgradePremium: 'الترقية للمميز',
    premiumDesc: 'أدوات الشاشة، بطاقات للمشاركة، حفظ غير محدود',
    premiumActive: 'المميز مُفعّل',
    premiumActiveDesc: 'شكراً لدعمك',
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

  // Premium screen
  premium: {
    title: 'SCHOLAR QUOTE',
    subtitle: 'المميز',
    desc: 'افتح التجربة الكاملة وادعم التطبيق',
    feature1: 'أدوات الشاشة الرئيسية — بكل الأحجام والمظاهر',
    feature2: 'بطاقات اقتباس جميلة للمشاركة',
    feature3: 'حفظ غير محدود ومجموعات مخصصة',
    feature4: 'تذكيرات يومية للتأمل',
    feature5: 'ادعم التطبيق — بدون إعلانات أبداً',
    unlockScholars: 'جميع العلماء متاحون — دائماً مجاناً',
    bestValue: 'أفضل قيمة',
    lifetime: 'مدى الحياة',
    monthly: 'شهري',
    lifetimePrice: '£14.99',
    monthlyPrice: '£2.99',
    oneTime: 'دفعة واحدة',
    perMonth: 'شهرياً',
    savings: 'يستحق في ٥ أشهر',
    ctaLifetime: 'احصل على الوصول مدى الحياة',
    ctaMonthly: 'اشترك شهرياً',
    ctaActive: 'أنت مشترك مميز — شكراً لك!',
    legal: 'سيتم تحصيل الدفع من حساب متجر التطبيقات الخاص بك. تتجدد الاشتراكات تلقائياً ما لم يتم إلغاؤها قبل ٢٤ ساعة على الأقل من نهاية الفترة الحالية.',
    restore: 'استعادة المشتريات',
    successTitle: 'مرحباً بك في المميز',
    successMsg: 'شكراً لدعمك. تم فتح جميع الميزات المميزة الآن.',
    failedTitle: 'لم يكتمل الشراء',
    failedMsg: 'تم إلغاء الشراء أو تعذّر إتمامه. لم يتم تحصيل أي مبلغ.',
    restoredTitle: 'تمت استعادة المشتريات',
    restoredMsg: 'تمت استعادة وصولك المميز.',
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
    textOnly: 'نص فقط',
    textOnlyDesc: 'نسخ نص الاقتباس للرسائل',
    image: 'صورة للمشاركة',
    imageDesc: 'بطاقة جميلة لوسائل التواصل',
    shareImage: 'مشاركة صورة الاقتباس',
  },

  // Common
  common: {
    appName: 'Scholar Quote',
    back: 'رجوع',
    close: 'إغلاق',
    cancel: 'إلغاء',
  },
};
