import * as SQLite from 'expo-sqlite';

import { Colors } from '@/constants/Colors';
import { Book, Quote, Scholar, Topic } from '@/constants/Types';

// ─── Database singleton ──────────────────────────────────────
let _db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync('scholar_quotes.db');
  await _db.execAsync('PRAGMA journal_mode = WAL;');
  await createTables(_db);
  await seedIfEmpty(_db);
  return _db;
}

// ─── Schema ──────────────────────────────────────────────────
async function createTables(db: SQLite.SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS scholars (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      shortName TEXT NOT NULL,
      nameAr TEXT NOT NULL,
      era TEXT NOT NULL,
      school TEXT NOT NULL,
      bio TEXT NOT NULL,
      accentColor TEXT NOT NULL,
      isPremium INTEGER NOT NULL DEFAULT 0,
      initials TEXT NOT NULL,
      quoteCount INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      titleAr TEXT NOT NULL,
      scholarId TEXT NOT NULL,
      yearWritten TEXT,
      FOREIGN KEY (scholarId) REFERENCES scholars(id)
    );

    CREATE TABLE IF NOT EXISTS quotes (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      textAr TEXT,
      scholarId TEXT NOT NULL,
      bookId TEXT NOT NULL,
      topic TEXT NOT NULL,
      isPremium INTEGER NOT NULL DEFAULT 0,
      isVerified INTEGER NOT NULL DEFAULT 1,
      commentary TEXT,
      commentaryAr TEXT,
      FOREIGN KEY (scholarId) REFERENCES scholars(id),
      FOREIGN KEY (bookId) REFERENCES books(id)
    );
  `);
}

// ─── Seed data ───────────────────────────────────────────────
async function seedIfEmpty(db: SQLite.SQLiteDatabase) {
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM scholars'
  );
  if (row && row.count > 0) return; // already seeded

  // Scholars
  for (const s of SEED_SCHOLARS) {
    await db.runAsync(
      `INSERT OR IGNORE INTO scholars (id, name, shortName, nameAr, era, school, bio, accentColor, isPremium, initials, quoteCount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      s.id, s.name, s.shortName, s.nameAr, s.era, s.school, s.bio,
      s.accentColor, s.isPremium ? 1 : 0, s.initials, s.quoteCount
    );
  }

  // Books
  for (const b of SEED_BOOKS) {
    await db.runAsync(
      `INSERT OR IGNORE INTO books (id, title, titleAr, scholarId, yearWritten)
       VALUES (?, ?, ?, ?, ?)`,
      b.id, b.title, b.titleAr, b.scholarId, b.yearWritten ?? null
    );
  }

  // Quotes
  for (const q of SEED_QUOTES) {
    await db.runAsync(
      `INSERT OR IGNORE INTO quotes (id, text, textAr, scholarId, bookId, topic, isPremium, isVerified, commentary, commentaryAr)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      q.id, q.text, q.textAr ?? null, q.scholarId, q.bookId, q.topic,
      q.isPremium ? 1 : 0, q.isVerified ? 1 : 0,
      q.commentary ?? null, q.commentaryAr ?? null
    );
  }
}

// ─── Query helpers ───────────────────────────────────────────

export async function getAllScholars(): Promise<Scholar[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>('SELECT * FROM scholars');
  return rows.map(mapScholar);
}

export async function getScholarByIdAsync(id: string): Promise<Scholar | undefined> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<any>('SELECT * FROM scholars WHERE id = ?', id);
  return row ? mapScholar(row) : undefined;
}

export async function getAllBooks(): Promise<Book[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>('SELECT * FROM books');
  return rows.map(mapBook);
}

export async function getBookByIdAsync(id: string): Promise<Book | undefined> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<any>('SELECT * FROM books WHERE id = ?', id);
  return row ? mapBook(row) : undefined;
}

export async function getAllQuotes(): Promise<Quote[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>(`
    SELECT q.*, s.name as scholarName, s.shortName as scholarShortName,
           s.nameAr as scholarNameAr, s.era, s.school, s.bio,
           s.accentColor, s.isPremium as scholarIsPremium, s.initials, s.quoteCount,
           b.title as bookTitle, b.titleAr as bookTitleAr, b.yearWritten
    FROM quotes q
    LEFT JOIN scholars s ON q.scholarId = s.id
    LEFT JOIN books b ON q.bookId = b.id
  `);
  return rows.map(mapQuoteWithRelations);
}

export async function getQuoteByIdAsync(id: string): Promise<Quote | undefined> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<any>(`
    SELECT q.*, s.name as scholarName, s.shortName as scholarShortName,
           s.nameAr as scholarNameAr, s.era, s.school, s.bio,
           s.accentColor, s.isPremium as scholarIsPremium, s.initials, s.quoteCount,
           b.title as bookTitle, b.titleAr as bookTitleAr, b.yearWritten
    FROM quotes q
    LEFT JOIN scholars s ON q.scholarId = s.id
    LEFT JOIN books b ON q.bookId = b.id
    WHERE q.id = ?
  `, id);
  return row ? mapQuoteWithRelations(row) : undefined;
}

export async function getQuotesByScholarAsync(scholarId: string): Promise<Quote[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>(`
    SELECT q.*, s.name as scholarName, s.shortName as scholarShortName,
           s.nameAr as scholarNameAr, s.era, s.school, s.bio,
           s.accentColor, s.isPremium as scholarIsPremium, s.initials, s.quoteCount,
           b.title as bookTitle, b.titleAr as bookTitleAr, b.yearWritten
    FROM quotes q
    LEFT JOIN scholars s ON q.scholarId = s.id
    LEFT JOIN books b ON q.bookId = b.id
    WHERE q.scholarId = ?
  `, scholarId);
  return rows.map(mapQuoteWithRelations);
}

export async function getQuotesByTopicAsync(topic: Topic): Promise<Quote[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>(`
    SELECT q.*, s.name as scholarName, s.shortName as scholarShortName,
           s.nameAr as scholarNameAr, s.era, s.school, s.bio,
           s.accentColor, s.isPremium as scholarIsPremium, s.initials, s.quoteCount,
           b.title as bookTitle, b.titleAr as bookTitleAr, b.yearWritten
    FROM quotes q
    LEFT JOIN scholars s ON q.scholarId = s.id
    LEFT JOIN books b ON q.bookId = b.id
    WHERE q.topic = ?
  `, topic);
  return rows.map(mapQuoteWithRelations);
}

export async function getFreeQuotesAsync(): Promise<Quote[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>(`
    SELECT q.*, s.name as scholarName, s.shortName as scholarShortName,
           s.nameAr as scholarNameAr, s.era, s.school, s.bio,
           s.accentColor, s.isPremium as scholarIsPremium, s.initials, s.quoteCount,
           b.title as bookTitle, b.titleAr as bookTitleAr, b.yearWritten
    FROM quotes q
    LEFT JOIN scholars s ON q.scholarId = s.id
    LEFT JOIN books b ON q.bookId = b.id
    WHERE q.isPremium = 0
  `);
  return rows.map(mapQuoteWithRelations);
}

export async function getDailyQuoteAsync(date: Date = new Date()): Promise<Quote> {
  const allQuotes = await getAllQuotes();
  const withCommentary = allQuotes.filter((q) => q.commentary);
  const pool = withCommentary.length > 0 ? withCommentary : allQuotes;
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const index = dayOfYear % pool.length;
  return pool[index];
}

export async function getFreeScolarsAsync(): Promise<Scholar[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>('SELECT * FROM scholars WHERE isPremium = 0');
  return rows.map(mapScholar);
}

export async function getPremiumScholarsAsync(): Promise<Scholar[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>('SELECT * FROM scholars WHERE isPremium = 1');
  return rows.map(mapScholar);
}

export async function getBooksByScholarAsync(scholarId: string): Promise<Book[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM books WHERE scholarId = ?', scholarId
  );
  return rows.map(mapBook);
}

// ─── Row mappers ─────────────────────────────────────────────

function mapScholar(row: any): Scholar {
  return {
    id: row.id,
    name: row.name,
    shortName: row.shortName,
    nameAr: row.nameAr,
    era: row.era,
    school: row.school,
    bio: row.bio,
    accentColor: row.accentColor,
    isPremium: !!row.isPremium,
    initials: row.initials,
    quoteCount: row.quoteCount,
  };
}

function mapBook(row: any): Book {
  return {
    id: row.id,
    title: row.title,
    titleAr: row.titleAr,
    scholarId: row.scholarId,
    yearWritten: row.yearWritten ?? undefined,
  };
}

function mapQuoteWithRelations(row: any): Quote {
  return {
    id: row.id,
    text: row.text,
    textAr: row.textAr ?? undefined,
    scholarId: row.scholarId,
    bookId: row.bookId,
    topic: row.topic as Topic,
    isPremium: !!row.isPremium,
    isVerified: !!row.isVerified,
    commentary: row.commentary ?? undefined,
    commentaryAr: row.commentaryAr ?? undefined,
    scholar: row.scholarName ? {
      id: row.scholarId,
      name: row.scholarName,
      shortName: row.scholarShortName,
      nameAr: row.scholarNameAr,
      era: row.era,
      school: row.school,
      bio: row.bio,
      accentColor: row.accentColor,
      isPremium: !!row.scholarIsPremium,
      initials: row.initials,
      quoteCount: row.quoteCount,
    } : undefined,
    book: row.bookTitle ? {
      id: row.bookId,
      title: row.bookTitle,
      titleAr: row.bookTitleAr,
      scholarId: row.scholarId,
      yearWritten: row.yearWritten ?? undefined,
    } : undefined,
  };
}

// ═══════════════════════════════════════════════════════════════
// SEED DATA — All scholars, books, and quotes
// When you add new quotes, add them to these arrays.
// On first launch (or after clearing app data) the DB will seed.
// ═══════════════════════════════════════════════════════════════

const SEED_SCHOLARS: Scholar[] = [
  {
    id: 'ibn-qayyim',
    name: 'Ibn Qayyim al-Jawziyyah',
    shortName: 'Ibn Qayyim',
    nameAr: 'ابن قيم الجوزية',
    era: '1292–1350 CE',
    school: 'Hanbali',
    bio: 'One of the most influential Islamic scholars, a student of Ibn Taymiyyah. Known for his profound works on the purification of the soul and the journey to Allah.',
    accentColor: Colors.scholars.ibnQayyim,
    isPremium: false,
    initials: 'IQ',
    quoteCount: 16,
  },
  {
    id: 'imam-shafii',
    name: "Imam al-Shafi'i",
    shortName: "al-Shafi'i",
    nameAr: 'الإمام الشافعي',
    era: '767–820 CE',
    school: "Shafi'i",
    bio: "The founder of the Shafi'i school of jurisprudence. A master of Arabic poetry and Islamic law who unified diverse legal traditions.",
    accentColor: Colors.scholars.imamShafii,
    isPremium: false,
    initials: 'IS',
    quoteCount: 12,
  },
  {
    id: 'imam-ali',
    name: 'Imam Ali ibn Abi Talib',
    shortName: 'Imam Ali',
    nameAr: 'الإمام علي بن أبي طالب',
    era: '601–661 CE',
    school: 'Companion of the Prophet ﷺ',
    bio: 'The fourth Rightly Guided Caliph, cousin and son-in-law of the Prophet Muhammad ﷺ. Known as the Gate of Knowledge.',
    accentColor: Colors.scholars.imamAli,
    isPremium: false,
    initials: 'AA',
    quoteCount: 12,
  },
  {
    id: 'ghazali',
    name: 'Imam al-Ghazali',
    shortName: 'al-Ghazali',
    nameAr: 'الإمام الغزالي',
    era: '1058–1111 CE',
    school: "Shafi'i",
    bio: "Known as Hujjat al-Islam (Proof of Islam). His magnum opus Ihya Ulum al-Din revived the Islamic sciences and bridged law with spirituality.",
    accentColor: Colors.scholars.ghazali,
    isPremium: false,
    initials: 'AG',
    quoteCount: 10,
  },
  {
    id: 'ibn-taymiyyah',
    name: 'Ibn Taymiyyah',
    shortName: 'Ibn Taymiyyah',
    nameAr: 'ابن تيمية',
    era: '1263–1328 CE',
    school: 'Hanbali',
    bio: 'A towering scholar of Islamic theology and jurisprudence. Known for his intellectual courage and prolific writing, even while imprisoned.',
    accentColor: Colors.scholars.ibnTaymiyyah,
    isPremium: false,
    initials: 'IT',
    quoteCount: 9,
  },
  {
    id: 'imam-nawawi',
    name: 'Imam al-Nawawi',
    shortName: 'al-Nawawi',
    nameAr: 'الإمام النووي',
    era: '1233–1277 CE',
    school: "Shafi'i",
    bio: 'Compiler of the famous Forty Hadith collection and Riyad al-Salihin. A scholar who accomplished monumental work in a short life of 44 years.',
    accentColor: Colors.scholars.imamNawawi,
    isPremium: false,
    initials: 'AN',
    quoteCount: 8,
  },
];

const SEED_BOOKS: Book[] = [
  { id: 'madarij', title: 'Madarij al-Salikin', titleAr: 'مدارج السالكين', scholarId: 'ibn-qayyim', yearWritten: '1340 CE' },
  { id: 'fawaid', title: 'Al-Fawaid', titleAr: 'الفوائد', scholarId: 'ibn-qayyim' },
  { id: 'jawab-kafi', title: 'Al-Jawab al-Kafi', titleAr: 'الجواب الكافي', scholarId: 'ibn-qayyim' },
  { id: 'zad-maad', title: "Zad al-Ma'ad", titleAr: 'زاد المعاد', scholarId: 'ibn-qayyim' },
  { id: 'ighathat', title: 'Ighathat al-Lahfan', titleAr: 'إغاثة اللهفان', scholarId: 'ibn-qayyim' },
  { id: 'diwan-shafii', title: 'Diwan al-Shafi\'i', titleAr: 'ديوان الشافعي', scholarId: 'imam-shafii' },
  { id: 'risala', title: 'Al-Risala', titleAr: 'الرسالة', scholarId: 'imam-shafii' },
  { id: 'nahj-balagha', title: 'Nahj al-Balagha', titleAr: 'نهج البلاغة', scholarId: 'imam-ali' },
  { id: 'ghurar', title: 'Ghurar al-Hikam', titleAr: 'غرر الحكم', scholarId: 'imam-ali' },
  { id: 'ihya', title: "Ihya Ulum al-Din", titleAr: 'إحياء علوم الدين', scholarId: 'ghazali' },
  { id: 'kimiya', title: "Kimiya-yi Sa'adat", titleAr: 'كيمياء السعادة', scholarId: 'ghazali' },
  { id: 'munqidh', title: 'Al-Munqidh min al-Dalal', titleAr: 'المنقذ من الضلال', scholarId: 'ghazali' },
  { id: 'fatawa', title: 'Majmu al-Fatawa', titleAr: 'مجموع الفتاوى', scholarId: 'ibn-taymiyyah' },
  { id: 'uboodiyyah', title: 'Al-Uboodiyyah', titleAr: 'العبودية', scholarId: 'ibn-taymiyyah' },
  { id: 'riyad', title: 'Riyad al-Salihin', titleAr: 'رياض الصالحين', scholarId: 'imam-nawawi' },
  { id: 'adhkar', title: 'Al-Adhkar', titleAr: 'الأذكار', scholarId: 'imam-nawawi' },
];

const SEED_QUOTES: Quote[] = [
  // Ibn Qayyim al-Jawziyyah
  { id: 'q1', text: 'The heart was only created for the remembrance of Allah. If it is occupied with anything else, it will never find peace.', textAr: 'القلب لم يُخلق إلا لذكر الله، فإن اشتغل بغيره فلن يجد سكينةً أبدًا.', scholarId: 'ibn-qayyim', bookId: 'madarij', topic: 'Heart', isPremium: false, isVerified: true, commentary: 'Ibn al-Qayyim teaches that the human heart has a God-shaped void that nothing worldly can fill. No amount of wealth, status, or relationships can substitute for a living connection with the Divine. True inner calm comes only through dhikr — the conscious remembrance of Allah in daily life.', commentaryAr: 'يُعلّمنا ابن القيّم أن في القلب فراغًا لا يملؤه شيء من الدنيا، ولا مال ولا جاه ولا علاقات. السكينة الحقيقية لا تأتي إلا بالذكر — أي استحضار الله في كل لحظة من حياتنا اليومية.' },
  { id: 'q2', text: 'Patience is of three kinds: patience in obeying Allah, patience in not disobeying Allah, and patience in accepting the decree of Allah.', textAr: 'الصبر ثلاثة أنواع: صبر على طاعة الله، وصبر عن معصية الله، وصبر على أقدار الله.', scholarId: 'ibn-qayyim', bookId: 'madarij', topic: 'Patience', isPremium: false, isVerified: true, commentary: 'This is Ibn al-Qayyim\'s famous threefold framework of patience (sabr). It\'s not just about enduring hardship — it also means persisting in worship when motivation fades, and resisting temptation when sin is easy. Mastering all three forms is what elevates a believer\'s spiritual rank.', commentaryAr: 'هذا إطار ابن القيم الثلاثي الشهير للصبر. فالصبر ليس تحمّل المشقة فحسب، بل يشمل المداومة على العبادة حين يضعف الدافع، ومقاومة الإغراء حين تسهل المعصية. إتقان الأنواع الثلاثة هو ما يرفع مقام المؤمن.' },
  { id: 'q3', text: 'The worst of sicknesses is the attachment to this world, and the best of cures is the attachment to the Hereafter.', textAr: 'أشد الأمراض التعلق بالدنيا، وأنجع الدواء التعلق بالآخرة.', scholarId: 'ibn-qayyim', bookId: 'fawaid', topic: 'Dunya', isPremium: false, isVerified: true, commentary: 'Ibn al-Qayyim frames worldly attachment as a spiritual illness. The "cure" is not abandoning the world entirely, but reorienting the heart so that the Hereafter — not wealth, fame, or comfort — becomes its true anchor and aspiration.', commentaryAr: 'يصوّر ابن القيم التعلق بالدنيا كمرض روحي. والعلاج ليس هجر الدنيا كليًّا، بل إعادة توجيه القلب ليكون مرساه الحقيقي الآخرة لا المال ولا الشهرة ولا الراحة.' },
  { id: 'q4', text: 'Every sin is a result of putting this world before the Hereafter. And every act of obedience is a result of putting the Hereafter before this world.', textAr: 'كل معصية أصلها تقديم الدنيا على الآخرة، وكل طاعة أصلها تقديم الآخرة على الدنيا.', scholarId: 'ibn-qayyim', bookId: 'fawaid', topic: 'Spirituality', isPremium: false, isVerified: true, commentary: 'A simple but profound diagnostic: every moral choice boils down to prioritisation. When we place temporary pleasure above eternal consequence, sin follows naturally. When the Hereafter takes precedence, obedience flows with ease.', commentaryAr: 'تشخيص بسيط لكنه عميق: كل خيار أخلاقي يرجع إلى ترتيب الأولويات. حين نقدّم المتعة العابرة على العاقبة الأبدية تأتي المعصية طبيعيًّا، وحين تتقدم الآخرة تتدفق الطاعة بسهولة.' },
  { id: 'q5', text: 'Gratitude is built upon five pillars: submission to Allah, love of Him, acknowledgement of His blessings, praising Him for them, and not using them to disobey Him.', textAr: 'الشكر مبني على خمسة أركان: خضوعك للمشكور، وحبك له، واعترافك بنعمته، وثناؤك عليه بها، وأن لا تستعملها فيما يكره.', scholarId: 'ibn-qayyim', bookId: 'madarij', topic: 'Gratitude', isPremium: false, isVerified: true, commentary: 'Ibn al-Qayyim elevates gratitude beyond a mere "thank you." True shukr is a five-part practice encompassing humility before Allah, heartfelt love, conscious recognition of blessings, vocal praise, and — critically — using every gift in a way that pleases the Giver.', commentaryAr: 'يرتقي ابن القيم بالشكر إلى ما هو أبعد من كلمة شكر عابرة. الشكر الحقيقي ممارسة من خمسة أركان: التواضع لله، والحب القلبي، والاعتراف بالنعم، والثناء عليها، واستعمالها فيما يُرضي المنعم.' },
  { id: 'q6', text: 'If you want to know where you stand with Allah, look at where He has placed you.', textAr: 'إذا أردت أن تعرف منزلتك عند الله، فانظر أين أنزلك.', scholarId: 'ibn-qayyim', bookId: 'fawaid', topic: 'Spirituality', isPremium: false, isVerified: true, commentary: 'A call to self-awareness: your current spiritual state — the company you keep, the deeds you do, the state of your heart — is a mirror reflecting your relationship with Allah. It is both a reality check and an invitation to strive higher.', commentaryAr: 'دعوة للوعي الذاتي: حالتك الروحية الراهنة — رفقتك وأعمالك وحال قلبك — مرآة تعكس علاقتك بالله. إنها محاسبة للنفس ودعوة للارتقاء.' },
  { id: 'q7', text: 'The heart is like a bird: love is its head and its two wings are hope and fear.', textAr: 'القلب كالطائر: الحب رأسه، وجناحاه الرجاء والخوف.', scholarId: 'ibn-qayyim', bookId: 'madarij', topic: 'Heart', isPremium: false, isVerified: true, commentary: 'This elegant metaphor captures the balance every believer needs. Love of Allah is the driving force; hope (raja) and fear (khawf) are the two wings that keep the spiritual journey steady. Lose one wing and the bird spirals downward.', commentaryAr: 'استعارة بليغة تجسّد التوازن الذي يحتاجه كل مؤمن. حب الله هو القوة الدافعة، والرجاء والخوف جناحان يحفظان توازن الرحلة الروحية. فقدان أحدهما يجعل الطائر يتهاوى.' },
  { id: 'q8', text: 'Knowledge is what benefits, not what is merely memorised.', textAr: 'العلم ما نفع، لا ما حُفظ.', scholarId: 'ibn-qayyim', bookId: 'fawaid', topic: 'Knowledge', isPremium: false, isVerified: true, commentary: 'A rebuke to hollow scholarship. Memorising texts without transforming one\'s character and actions is not true knowledge in Islam. Beneficial knowledge is that which softens the heart, improves behaviour, and draws a person closer to Allah.', commentaryAr: 'توبيخ للعلم الأجوف. حفظ النصوص دون تحويل الأخلاق والأفعال ليس علمًا حقيقيًّا في الإسلام. العلم النافع هو ما يُليّن القلب ويحسّن السلوك ويقرّب العبد من الله.' },
  { id: 'q9', text: 'Sins have many side-effects. One of them is that they steal knowledge from you.', textAr: 'للذنوب آثار كثيرة، منها: أنها تسرق منك العلم.', scholarId: 'ibn-qayyim', bookId: 'jawab-kafi', topic: 'Knowledge', isPremium: false, isVerified: true, commentary: 'Ibn al-Qayyim links moral conduct directly to intellectual clarity. Persistent sin clouds the mind, weakens memory, and removes the light (nur) of understanding. Purity of action and purity of insight go hand in hand.', commentaryAr: 'يربط ابن القيم السلوك الأخلاقي بالوضوح الذهني مباشرةً. الذنب المتواصل يُعتم العقل ويُضعف الذاكرة ويسلب نور الفهم. طهارة العمل وطهارة البصيرة لا ينفصلان.' },
  { id: 'q10', text: 'Remembrance of death is the demolisher of pleasures and the separator of gatherings.', textAr: 'ذكر الموت هادم اللذات ومفرّق الجماعات.', scholarId: 'ibn-qayyim', bookId: 'zad-maad', topic: 'Death', isPremium: false, isVerified: true, commentary: 'Rooted in the hadith of the Prophet ﷺ, this reminder is not morbid but motivational. By keeping death in mind, fleeting pleasures lose their grip and the believer refocuses on what truly lasts — deeds that accompany the soul beyond the grave.', commentaryAr: 'مستمدّ من حديث النبي ﷺ، هذا التذكير ليس كئيبًا بل تحفيزي. باستحضار الموت تفقد الملذّات العابرة سطوتها ويعيد المؤمن تركيزه على ما يبقى — الأعمال التي ترافق الروح بعد القبر.' },
  { id: 'q11', text: 'The most beloved deed to Allah is the most constant, even if it is small.', textAr: 'أحب الأعمال إلى الله أدومها وإن قلّ.', scholarId: 'ibn-qayyim', bookId: 'ighathat', topic: 'Spirituality', isPremium: false, isVerified: true, commentary: 'Echoing the hadith of the Prophet ﷺ, Ibn al-Qayyim emphasises consistency over intensity. A small daily act of worship — even two extra minutes of dhikr — is more beloved to Allah than sporadic bursts of devotion followed by neglect.', commentaryAr: 'يؤكد ابن القيم — بصدى حديث النبي ﷺ — أن المداومة أهم من الكثرة. عمل صغير يومي — حتى دقيقتان من الذكر — أحبّ إلى الله من اجتهاد متقطع يعقبه إهمال.' },
  { id: 'q12', text: 'Whoever desires to purify his heart, let him prefer Allah to his desires.', textAr: 'من أراد تصفية قلبه فليؤثر الله على شهواته.', scholarId: 'ibn-qayyim', bookId: 'ighathat', topic: 'Heart', isPremium: false, isVerified: true, commentary: 'Heart purification (tazkiyat al-qalb) is a central theme in Islam. Ibn al-Qayyim\'s prescription is deceptively simple: whenever desire and divine command conflict, choose Allah. Each such choice polishes the heart and restores its spiritual clarity.', commentaryAr: 'تزكية القلب موضوع محوري في الإسلام. وصفة ابن القيم بسيطة في ظاهرها عميقة في جوهرها: كلما تعارضت الشهوة مع أمر الله، اختر الله. كل اختيار كهذا يصقل القلب ويعيد صفاءه الروحي.' },
  { id: 'q44', text: 'As long as you keep knocking at the door of Allah, He will surely open it for you.', textAr: 'ما دمت تقرع باب الله، فلا بد أن يُفتح لك.', scholarId: 'ibn-qayyim', bookId: 'madarij', topic: 'Spirituality', isPremium: false, isVerified: true, commentary: 'A message of unwavering hope in du\'a (supplication). Ibn al-Qayyim assures the believer that persistence in calling upon Allah is never wasted — the door may not open on our schedule, but it will open. The key is to never stop knocking.', commentaryAr: 'رسالة أمل ثابتة في الدعاء. يطمئن ابن القيم المؤمن أن المثابرة في دعاء الله لا تضيع أبدًا — قد لا يُفتح الباب وفق جدولنا لكنه سيُفتح حتمًا. المفتاح ألا تتوقف عن القرع.' },
  { id: 'q45', text: 'Reflection is the journey of the heart through the realities of things.', textAr: 'التفكر سياحة القلب في حقائق الأشياء.', scholarId: 'ibn-qayyim', bookId: 'fawaid', topic: 'Knowledge', isPremium: false, isVerified: true, commentary: 'Tafakkur (deep reflection) is portrayed as a spiritual voyage. Unlike idle daydreaming, it is a purposeful journey where the heart travels inward to uncover the deeper truths behind creation, events, and divine wisdom.', commentaryAr: 'يُصوَّر التفكر كرحلة روحية. على خلاف أحلام اليقظة، هو سياحة هادفة يرحل فيها القلب باطنيًّا لاكتشاف الحقائق الأعمق وراء الخلق والأحداث والحكمة الإلهية.' },
  { id: 'q46', text: 'The more the heart loves Allah, the more it devotes itself to His worship.', textAr: 'كلما ازداد القلب حبًا لله، ازداد له عبودية.', scholarId: 'ibn-qayyim', bookId: 'madarij', topic: 'Heart', isPremium: false, isVerified: true, commentary: 'Love and worship form a virtuous cycle. The deeper the love, the sweeter the worship; and the more sincere the worship, the deeper the love grows. Ibn al-Qayyim shows that devotion born from love is never a burden.', commentaryAr: 'الحب والعبادة يشكّلان حلقة فاضلة. كلما عمق الحب حلت العبادة، وكلما أخلصت العبادة نما الحب. يبيّن ابن القيم أن العبادة النابعة من الحب لا تكون عبئًا أبدًا.' },
  { id: 'q47', text: 'Trials are a medicine for the diseases of the heart.', textAr: 'البلاء دواء لأمراض القلوب.', scholarId: 'ibn-qayyim', bookId: 'jawab-kafi', topic: 'Patience', isPremium: false, isVerified: true, commentary: 'A radical reframe: hardship is not punishment but treatment. Just as bitter medicine heals the body, trials burn away arrogance, heedlessness, and attachment — leaving the heart healthier and more attuned to Allah.', commentaryAr: 'إعادة صياغة جذرية: المشقة ليست عقوبة بل علاج. كما يشفي الدواء المرّ الجسد، يحرق البلاء الكبر والغفلة والتعلق — فيترك القلب أصحّ وأقرب إلى الله.' },

  // Imam al-Shafi'i
  { id: 'q13', text: 'My heart is at ease knowing that what was meant for me will never miss me, and that what misses me was never meant for me.', textAr: 'قلبي مطمئن لأن ما قُدِّر لي لن يُخطئني، وما أخطأني لم يكن قط مقدَّرًا لي.', scholarId: 'imam-shafii', bookId: 'diwan-shafii', topic: 'Patience', isPremium: false, isVerified: true, commentary: 'Imam al-Shafi\'i distills the Islamic concept of qadar (divine decree) into a powerful affirmation. By internalising that every provision, opportunity, and trial is precisely calibrated by Allah, anxiety over missed chances dissolves and is replaced by trust (tawakkul).', commentaryAr: 'يختصر الإمام الشافعي مفهوم القدر الإسلامي في عبارة بليغة. حين نستوعب أن كل رزق وفرصة وابتلاء مُقدَّر بدقة من الله، يتبدد القلق على ما فات ويحل محله التوكل.' },
  { id: 'q14', text: 'The one who cannot tolerate the bitterness of seeking knowledge will live in the humiliation of ignorance for the rest of his life.', textAr: 'من لم يتحمل مرارة التعلم عاش على ذل الجهل طوال حياته.', scholarId: 'imam-shafii', bookId: 'diwan-shafii', topic: 'Knowledge', isPremium: false, isVerified: true, commentary: 'Learning requires sacrifice — late nights, difficult texts, humbling oneself before teachers. Imam al-Shafi\'i argues the temporary pain of study is nothing compared to the permanent shame of remaining ignorant.', commentaryAr: 'التعلم يتطلب تضحية — سهر ونصوص صعبة وتواضع أمام المعلمين. يرى الإمام الشافعي أن ألم الدراسة المؤقت لا يُقارن بعار البقاء في الجهل الدائم.' },
  { id: 'q15', text: 'Be hard on yourself, easy on others.', textAr: 'كن صارمًا مع نفسك، متساهلًا مع غيرك.', scholarId: 'imam-shafii', bookId: 'diwan-shafii', topic: 'Character', isPremium: false, isVerified: true, commentary: 'A concise ethical rule: hold yourself to the highest standard while extending grace to others. This prevents both self-indulgence and harshness toward people — two traps that undermine good character.', commentaryAr: 'قاعدة أخلاقية موجزة: حاسب نفسك بأعلى المعايير وتسامح مع غيرك. هذا يمنع التساهل مع الذات والقسوة على الناس — فخّان يقوّضان حسن الخلق.' },
  { id: 'q16', text: 'I never debated anyone with the intention of defeating them. I only debated with the intention that the truth might become clear.', textAr: 'ما جادلت أحدًا قط بنية الغلبة، وإنما جادلت بنية أن تتضح الحقيقة.', scholarId: 'imam-shafii', bookId: 'risala', topic: 'Character', isPremium: false, isVerified: true, commentary: 'A model for every discussion: the goal is truth, not victory. Imam al-Shafi\'i was renowned for saying he wished the truth would emerge even if from his opponent\'s mouth. This removes ego from discourse and keeps sincerity intact.', commentaryAr: 'نموذج لكل حوار: الهدف الحقيقة لا الانتصار. اشتهر الإمام الشافعي بقوله إنه يتمنى ظهور الحق ولو على لسان خصمه. هذا يُزيل الأنا من النقاش ويحفظ الإخلاص.' },
  { id: 'q17', text: 'When you see a person given silence and solitude, then draw near to him for he is being given wisdom.', textAr: 'إذا رأيت شخصًا أُعطي الصمت والخلوة، فاقترب منه فإنه يُلقَّن الحكمة.', scholarId: 'imam-shafii', bookId: 'diwan-shafii', topic: 'Knowledge', isPremium: false, isVerified: true, commentary: 'Silence and solitude are not signs of emptiness but of divine instruction. The one who cultivates quiet reflection is often being taught by Allah directly through insight and inspiration (ilham).', commentaryAr: 'الصمت والخلوة ليسا علامة فراغ بل تعليم إلهي. من يزرع التأمل الهادئ غالبًا ما يُعلَّم من الله مباشرة عبر البصيرة والإلهام.' },
  { id: 'q18', text: 'Let the days do what they will, and be content when destiny decrees. Do not grieve over the events of the night, for the events of this world are not everlasting.', textAr: 'دع الأيام تفعل ما تشاء وطب نفسًا حين يقضي الحكم، ولا تجزع لحوادث الليل، فحوادث الدنيا لا تدوم.', scholarId: 'imam-shafii', bookId: 'diwan-shafii', topic: 'Patience', isPremium: false, isVerified: true, commentary: 'From Imam al-Shafi\'i\'s famous poem. Its message: surrender to the flow of divine decree with a tranquil heart. Nothing in this world — good or bad — is permanent, so neither cling to joy nor despair in hardship.', commentaryAr: 'من قصيدة الإمام الشافعي الشهيرة. رسالتها: استسلم لمجرى القدر بقلب مطمئن. لا شيء في الدنيا — خيرًا أو شرًا — يدوم، فلا تتشبث بالفرح ولا تيأس في الشدة.' },
  { id: 'q19', text: 'This world is only a moment. Make it a moment of obedience.', textAr: 'الدنيا لحظة فاجعلها لحظة طاعة.', scholarId: 'imam-shafii', bookId: 'diwan-shafii', topic: 'Dunya', isPremium: false, isVerified: true, commentary: 'Life\'s brevity is distilled into five words of Arabic. Imam al-Shafi\'i urges us to fill this fleeting moment with worship and good deeds rather than wasting it on what perishes.', commentaryAr: 'يختزل الإمام الشافعي قصر الحياة في كلمات معدودة. يحثنا على ملء هذه اللحظة العابرة بالعبادة والعمل الصالح بدل إهدارها فيما يفنى.' },
  { id: 'q20', text: 'The real brotherhood is the one where your brother puts you before himself.', textAr: 'الأخوة الحقيقية هي التي يُقدّمك فيها أخوك على نفسه.', scholarId: 'imam-shafii', bookId: 'diwan-shafii', topic: 'Brotherhood', isPremium: false, isVerified: true, commentary: 'True Islamic brotherhood (ukhuwwa) goes beyond pleasantries. It means ithar — selflessly preferring your brother\'s needs over your own. This was the hallmark of the Ansar with the Muhajirun in Madinah.', commentaryAr: 'الأخوة الإسلامية الحقيقية تتجاوز المجاملات. إنها الإيثار — تقديم حاجة أخيك على حاجتك. هذا كان شعار الأنصار مع المهاجرين في المدينة.' },
  { id: 'q48', text: 'Time is like a sword: if you do not cut it, it cuts you.', textAr: 'الوقت كالسيف، إن لم تقطعه قطعك.', scholarId: 'imam-shafii', bookId: 'diwan-shafii', topic: 'Dunya', isPremium: false, isVerified: true, commentary: 'A vivid warning about wasted time. If you don\'t use your moments productively — "cutting" them into purposeful segments — time itself becomes a weapon that destroys your potential and shortens your opportunity.', commentaryAr: 'تحذير حي من إضاعة الوقت. إن لم تستثمر لحظاتك بإنتاجية — "تقطعها" إلى أجزاء هادفة — يصبح الوقت نفسه سلاحًا يدمر إمكاناتك ويقلّص فرصك.' },
  { id: 'q49', text: 'Whoever does not taste the humiliation of learning for an hour will swallow the humiliation of ignorance forever.', textAr: 'من لم يذق ذلّ التعلم ساعة، تجرّع ذلّ الجهل أبدًا.', scholarId: 'imam-shafii', bookId: 'diwan-shafii', topic: 'Knowledge', isPremium: false, isVerified: true, commentary: 'Learning demands humility — admitting what you don\'t know and sitting at the feet of those who do. This brief discomfort is nothing compared to the lifelong disgrace of remaining ignorant by choice.', commentaryAr: 'التعلم يتطلب تواضعًا — الاعتراف بما لا تعلم والجلوس عند أقدام من يعلم. هذا الانزعاج القصير لا يُقارن بعار البقاء جاهلًا بالاختيار مدى الحياة.' },
  { id: 'q50', text: 'Let not your tongue mention the faults of another, for you yourself are made of faults and others have tongues.', textAr: 'لسانك لا تذكر به عورة امرئٍ، فكلك عوراتٌ وللناس ألسنُ.', scholarId: 'imam-shafii', bookId: 'diwan-shafii', topic: 'Character', isPremium: false, isVerified: true, commentary: 'A poetic warning against backbiting (ghiba). Everyone has flaws; exposing others\' faults only invites the same treatment in return. The wise person covers others\' shortcomings and focuses on correcting their own.', commentaryAr: 'تحذير شعري من الغيبة. كل إنسان معيوب، وكشف عيوب الآخرين لا يجلب إلا المعاملة بالمثل. الحكيم يستر عيوب غيره ويركز على إصلاح نفسه.' },
  { id: 'q51', text: 'The more I increase in knowledge, the more I realise how ignorant I am.', textAr: 'كلما ازددت علمًا، زادني علمًا بجهلي.', scholarId: 'imam-shafii', bookId: 'risala', topic: 'Knowledge', isPremium: false, isVerified: false },

  // Imam Ali ibn Abi Talib
  { id: 'q21', text: 'Do not let your difficulties fill you with anxiety. After all, it is only in the darkest nights that stars shine more brightly.', textAr: 'لا تدع همومك تملؤك قلقًا، فالنجوم لا تضيء إلا في أشد الليالي ظلامًا.', scholarId: 'imam-ali', bookId: 'nahj-balagha', topic: 'Patience', isPremium: false, isVerified: true, commentary: 'Imam Ali uses a vivid metaphor from nature: stars are always present, but they become visible only against a dark sky. Likewise, a person\'s inner strengths — faith, resilience, character — emerge most clearly during times of hardship, not ease.', commentaryAr: 'يستخدم الإمام علي استعارة بليغة من الطبيعة: النجوم موجودة دائمًا لكنها لا تُرى إلا في الظلام. كذلك قوى الإنسان الداخلية — الإيمان والصبر والخُلُق — لا تظهر بجلاء إلا في أوقات الشدة لا الرخاء.' },
  { id: 'q22', text: 'The tongue is like a lion. If you let it loose, it will wound someone.', textAr: 'اللسان كالأسد، إن أطلقته جرح.', scholarId: 'imam-ali', bookId: 'nahj-balagha', topic: 'Character', isPremium: false, isVerified: true },
  { id: 'q23', text: 'People are enemies of what they are ignorant of.', textAr: 'الناس أعداء ما جهلوا.', scholarId: 'imam-ali', bookId: 'nahj-balagha', topic: 'Knowledge', isPremium: false, isVerified: true },
  { id: 'q24', text: 'Detachment is not that you should own nothing, but that nothing should own you.', textAr: 'الزهد ليس أن لا تملك شيئًا، بل ألا يملكك شيء.', scholarId: 'imam-ali', bookId: 'nahj-balagha', topic: 'Dunya', isPremium: false, isVerified: true },
  { id: 'q25', text: 'A friend cannot be considered a friend unless he is tested on three occasions: in time of need, behind your back, and after your death.', textAr: 'لا يُعدّ الصديق صديقًا حتى يُختبر في ثلاثة مواقف: عند الحاجة، وفي غيابك، وبعد وفاتك.', scholarId: 'imam-ali', bookId: 'nahj-balagha', topic: 'Brotherhood', isPremium: false, isVerified: true },
  { id: 'q26', text: 'Be like the flower that gives its fragrance even to the hand that crushes it.', textAr: 'كن كالزهرة التي تُعطي عطرها حتى لليد التي تسحقها.', scholarId: 'imam-ali', bookId: 'nahj-balagha', topic: 'Character', isPremium: false, isVerified: true },
  { id: 'q27', text: 'The richest of the rich is the one who is not a prisoner to greed.', textAr: 'أغنى الأغنياء من لم يكن الطمع أسيره.', scholarId: 'imam-ali', bookId: 'nahj-balagha', topic: 'Dunya', isPremium: false, isVerified: true },
  { id: 'q28', text: 'Stubbornness destroys good counsel.', textAr: 'العناد يُفسد حسن الرأي.', scholarId: 'imam-ali', bookId: 'nahj-balagha', topic: 'Character', isPremium: false, isVerified: true },
  { id: 'q52', text: 'The tongue of the wise is behind his heart, and the heart of the fool is behind his tongue.', textAr: 'لسان العاقل وراء قلبه، وقلب الأحمق وراء لسانه.', scholarId: 'imam-ali', bookId: 'nahj-balagha', topic: 'Character', isPremium: false, isVerified: true },
  { id: 'q53', text: 'Knowledge is better than wealth: knowledge guards you, while you must guard wealth.', textAr: 'العلم خير من المال: العلم يحرسك وأنت تحرس المال.', scholarId: 'imam-ali', bookId: 'nahj-balagha', topic: 'Knowledge', isPremium: false, isVerified: true },
  { id: 'q54', text: 'People are asleep, and when they die they awaken.', textAr: 'الناس نيام، فإذا ماتوا انتبهوا.', scholarId: 'imam-ali', bookId: 'ghurar', topic: 'Death', isPremium: false, isVerified: false },
  { id: 'q55', text: 'Do not let your behaviour towards others be a debt you would be unwilling to repay.', textAr: 'لا تعامل الناس إلا بما تحب أن يعاملوك به.', scholarId: 'imam-ali', bookId: 'ghurar', topic: 'Brotherhood', isPremium: false, isVerified: false },

  // Imam al-Ghazali
  { id: 'q29', text: 'Knowledge without action is vanity, and action without knowledge is insanity.', textAr: 'العلم بلا عمل جنون، والعمل بلا علم لا يكون.', scholarId: 'ghazali', bookId: 'ihya', topic: 'Knowledge', isPremium: false, isVerified: true, commentary: 'Al-Ghazali warns against two extremes: the armchair scholar who hoards information but never lives by it, and the zealous activist who acts without understanding. True Islamic scholarship demands that knowledge and practice walk hand in hand — each is incomplete without the other.', commentaryAr: 'يحذر الغزالي من طرفين: عالمٌ يكنز المعرفة دون أن يعمل بها، وناشطٌ متحمس يعمل دون فهم. العلم الإسلامي الحقيقي يقتضي أن يسير العلم والعمل جنبًا إلى جنب — فكل منهما ناقص بدون الآخر.' },
  { id: 'q30', text: 'The happiness of the drop is to die in the river.', textAr: 'سعادة القطرة أن تفنى في النهر.', scholarId: 'ghazali', bookId: 'kimiya', topic: 'Spirituality', isPremium: false, isVerified: true },
  { id: 'q31', text: 'Do not allow your heart to take pleasure in the praises of people, nor be saddened by their condemnation.', textAr: 'لا تدع قلبك ينتشي بمدح الناس، ولا يحزن بذمّهم.', scholarId: 'ghazali', bookId: 'ihya', topic: 'Heart', isPremium: false, isVerified: true },
  { id: 'q32', text: 'Each of your breaths is a priceless jewel, since each of them is irreplaceable and once gone, can never be retrieved.', textAr: 'كل نَفَس من أنفاسك جوهرة لا تُقدَّر، إذ لا بديل له، وإذا ذهب لم يعد أبدًا.', scholarId: 'ghazali', bookId: 'ihya', topic: 'Death', isPremium: false, isVerified: true },
  { id: 'q33', text: 'The way to paradise is an uphill climb whereas hell is downhill. Hence, there is a struggle to get to paradise and no struggle to get to hell.', textAr: 'طريق الجنة صعود وطريق جهنم هبوط، ومن ثمّ يشق بلوغ الجنة ولا يشق بلوغ النار.', scholarId: 'ghazali', bookId: 'kimiya', topic: 'Spirituality', isPremium: false, isVerified: true },
  { id: 'q34', text: 'To get what you love, you must first be patient with what you hate.', textAr: 'للحصول على ما تحب، عليك أولًا أن تصبر على ما تكره.', scholarId: 'ghazali', bookId: 'ihya', topic: 'Patience', isPremium: false, isVerified: true },
  { id: 'q56', text: 'Whoever knows himself, truly knows his Lord.', textAr: 'من عرف نفسه، فقد عرف ربه.', scholarId: 'ghazali', bookId: 'kimiya', topic: 'Spirituality', isPremium: false, isVerified: false },
  { id: 'q57', text: 'The heart is a polished mirror, and sins are the rust that veils it.', textAr: 'القلب مرآة مجلوّة، والذنوب صدأ يعلوها.', scholarId: 'ghazali', bookId: 'ihya', topic: 'Heart', isPremium: false, isVerified: true },
  { id: 'q58', text: 'Patience is the pillar upon which faith stands.', textAr: 'الصبر دعامةٌ يقوم عليها الإيمان.', scholarId: 'ghazali', bookId: 'ihya', topic: 'Patience', isPremium: false, isVerified: true },
  { id: 'q59', text: 'A man\'s true wealth is the good he sends forward for the Hereafter.', textAr: 'إنما غنى المرء بما يقدّمه من خير لآخرته.', scholarId: 'ghazali', bookId: 'ihya', topic: 'Character', isPremium: false, isVerified: true },

  // Ibn Taymiyyah
  { id: 'q35', text: 'What can my enemies do to me? My paradise is in my heart, it goes with me wherever I go.', textAr: 'ماذا يصنع أعدائي بي؟ جنتي في صدري، تسير معي حيثما ذهبت.', scholarId: 'ibn-taymiyyah', bookId: 'fatawa', topic: 'Heart', isPremium: false, isVerified: true, commentary: 'Ibn Taymiyyah reportedly said this while imprisoned in the Citadel of Damascus. His point is radical: external captivity cannot touch a heart that is free through its connection with Allah. True imprisonment is spiritual — when the heart is enslaved by worldly desires rather than devoted to God.', commentaryAr: 'قالها ابن تيمية وهو سجين في قلعة دمشق. فكرته جذرية: الأسر الخارجي لا يمسّ قلبًا حرًّا بصلته بالله. السجن الحقيقي روحي — حين يُستعبَد القلب بشهوات الدنيا بدلًا من التعلق بالله.' },
  { id: 'q36', text: 'The one who is imprisoned is the one whose heart is imprisoned from Allah, and the captive is the one whose desires have enslaved him.', textAr: 'المحبوس من حُبس قلبه عن ربه، والمأسور من أسره هواه.', scholarId: 'ibn-taymiyyah', bookId: 'uboodiyyah', topic: 'Spirituality', isPremium: false, isVerified: true },
  { id: 'q37', text: 'People worship their desires and call it worship of God.', textAr: 'الناس يعبدون أهواءهم ويسمّون ذلك عبادة الله.', scholarId: 'ibn-taymiyyah', bookId: 'fatawa', topic: 'Dunya', isPremium: false, isVerified: true },
  { id: 'q38', text: 'Gratitude brings more blessings, and ingratitude brings calamity.', textAr: 'الشكر يزيد النعم، والكفر يجلب النقم.', scholarId: 'ibn-taymiyyah', bookId: 'fatawa', topic: 'Gratitude', isPremium: false, isVerified: true },
  { id: 'q39', text: 'Truly in the heart there is a void that cannot be removed except with the company of Allah.', textAr: 'في القلب خَلَّة لا يسدّها شيء إلا صحبة الله.', scholarId: 'ibn-taymiyyah', bookId: 'fatawa', topic: 'Heart', isPremium: false, isVerified: true },
  { id: 'q60', text: 'The one who truly knows Allah recognises Him in ease and in hardship alike.', textAr: 'العارف بالله يعرفه في الرخاء والشدة سواء.', scholarId: 'ibn-taymiyyah', bookId: 'fatawa', topic: 'Spirituality', isPremium: false, isVerified: true },
  { id: 'q61', text: 'Faith increases with obedience and decreases with disobedience.', textAr: 'الإيمان يزيد بالطاعة وينقص بالمعصية.', scholarId: 'ibn-taymiyyah', bookId: 'fatawa', topic: 'Knowledge', isPremium: false, isVerified: true },
  { id: 'q62', text: 'Whoever relies sincerely upon Allah, Allah is sufficient for him.', textAr: 'من توكّل على الله حقَّ توكله، كفاه الله.', scholarId: 'ibn-taymiyyah', bookId: 'fatawa', topic: 'Heart', isPremium: false, isVerified: true },
  { id: 'q63', text: 'The reality of patience is to restrain the soul from despair and complaint.', textAr: 'حقيقة الصبر حبس النفس عن الجزع والشكوى.', scholarId: 'ibn-taymiyyah', bookId: 'uboodiyyah', topic: 'Patience', isPremium: false, isVerified: true },

  // Imam al-Nawawi
  { id: 'q40', text: 'The one who guides to something good has a reward similar to that of its doer.', textAr: 'الدالّ على الخير كفاعله.', scholarId: 'imam-nawawi', bookId: 'riyad', topic: 'Brotherhood', isPremium: false, isVerified: true },
  { id: 'q41', text: 'Make your gatherings places of remembrance, not places of heedlessness.', textAr: 'اجعل مجالسك مجالس ذكر لا مجالس غفلة.', scholarId: 'imam-nawawi', bookId: 'adhkar', topic: 'Spirituality', isPremium: false, isVerified: true },
  { id: 'q42', text: 'From the perfection of one\'s Islam is leaving that which does not concern him.', textAr: 'من حسن إسلام المرء تركه ما لا يعنيه.', scholarId: 'imam-nawawi', bookId: 'riyad', topic: 'Character', isPremium: false, isVerified: true },
  { id: 'q43', text: 'Beware of sitting idle, for indeed it is disgrace and regret. But take provision, for the best provision is righteousness.', textAr: 'إياك والكسل فإنه عار وندامة، وتزوّد فإن خير الزاد التقوى.', scholarId: 'imam-nawawi', bookId: 'riyad', topic: 'Dunya', isPremium: false, isVerified: true },
  { id: 'q64', text: 'Sincerity is to seek by your obedience the face of Allah alone.', textAr: 'الإخلاص أن تقصد بطاعتك وجه الله وحده.', scholarId: 'imam-nawawi', bookId: 'riyad', topic: 'Spirituality', isPremium: false, isVerified: true },
  { id: 'q65', text: 'Guarding the tongue is the foundation of every good.', textAr: 'حفظ اللسان أصل كل خير.', scholarId: 'imam-nawawi', bookId: 'adhkar', topic: 'Character', isPremium: false, isVerified: false },
  { id: 'q66', text: 'The heart finds no rest except in the remembrance and gratitude of its Lord.', textAr: 'لا يطمئن القلب إلا بذكر ربه وشكره.', scholarId: 'imam-nawawi', bookId: 'adhkar', topic: 'Gratitude', isPremium: false, isVerified: false },
  { id: 'q67', text: 'Knowledge without sincerity is a tree that bears no fruit.', textAr: 'العلم بلا إخلاص شجرة بلا ثمر.', scholarId: 'imam-nawawi', bookId: 'riyad', topic: 'Knowledge', isPremium: false, isVerified: false },
];
