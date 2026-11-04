// المحتوى الرسمي المستخرج من كتاب الدراسات الاجتماعية — الصف السادس — ص 67-69
// الدرس التاسع: الجوانب الحضارية للدولتين السعوديتين الأولى والثانية

export const IMAGES = {
  saudiFlagArch:
    "https://images.pexels.com/photos/39470815/pexels-photo-39470815.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  taifArches:
    "https://images.pexels.com/photos/10965881/pexels-photo-10965881.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  ahsaRuins:
    "https://images.pexels.com/photos/33368098/pexels-photo-33368098.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  desertGate:
    "https://images.pexels.com/photos/4513501/pexels-photo-4513501.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  kaabaDoor:
    "https://images.pexels.com/photos/35574033/pexels-photo-35574033.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  kaabaCloth:
    "https://images.pexels.com/photos/39054248/pexels-photo-39054248.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  kaabaGolden:
    "https://images.pexels.com/photos/35525075/pexels-photo-35525075.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  manuscripts:
    "https://images.pexels.com/photos/12278950/pexels-photo-12278950.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  arabicScript:
    "https://images.pexels.com/photos/34652787/pexels-photo-34652787.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  islamicLibrary:
    "https://images.pexels.com/photos/31679266/pexels-photo-31679266.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  adobeRiyadh:
    "https://images.pexels.com/photos/1588096/pexels-photo-1588096.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  fortGate:
    "https://images.pexels.com/photos/28042551/pexels-photo-28042551.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  desertFort:
    "https://images.pexels.com/photos/36395574/pexels-photo-36395574.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  mudHouse:
    "https://images.pexels.com/photos/18508733/pexels-photo-18508733.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  mosqueInterior:
    "https://images.pexels.com/photos/39977274/pexels-photo-39977274.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  horsemen:
    "https://images.pexels.com/photos/19515212/pexels-photo-19515212.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
};

export const LESSON_INTRO =
  "إن تأسيس أي دولة قوية نابع من إرثها الحضاري وقوتها في أنظمتها السياسية، والاقتصادية، والاجتماعية، والدينية.";
export const LESSON_QUESTION =
  "فما أبرز الجوانب الحضارية للدولتين السعوديتين الأولى والثانية؟";

export type AxisKey =
  | "admin"
  | "education"
  | "social"
  | "security"
  | "haramain"
  | "army"
  | "umran";

export interface Axis {
  key: AxisKey;
  number: number;
  title: string;
  page: string;
  subtitle: string;
  icon: string;
  color: string;
  points: { term: string; desc: string }[];
}

export const AXES: Axis[] = [
  {
    key: "admin",
    number: 1,
    title: "الإدارة والحكم",
    page: "صفحة 67",
    subtitle: "تأسست الدولة السعودية على نظام إداري واضح، قائم على أسس، منها:",
    icon: "🏛️",
    color: "#0b6e3f",
    points: [
      { term: "البيعة", desc: "جزء أساسي من نظام الحكم" },
      { term: "ولاية العهد", desc: "للمساندة في إدارة الدولة" },
      { term: "تعيين أمراء الدولة وقضاتها", desc: "لإدارة شؤون البلاد والقضاء بين الناس" },
      { term: "بيت المال", desc: "لموارد الدولة ومصروفاتها" },
    ],
  },
  {
    key: "education",
    number: 2,
    title: "التعليم",
    page: "صفحة 67",
    subtitle: "ازدهر التعليم في أنحاء الدولة السعودية، ومن مظاهره:",
    icon: "📚",
    color: "#86683a",
    points: [
      { term: "عقد المجالس العلمية", desc: "بمشاركة أئمة الدولة" },
      { term: "إنشاء دُور العلم والمكتبات", desc: "لنشر العلم والمعرفة" },
      { term: "رعاية العلماء وتشجيعهم", desc: "تقديرًا لمكانتهم ودورهم" },
      { term: "التوسع في التأليف ونسخ الكتب", desc: "لحفظ العلم ونقله" },
    ],
  },
  {
    key: "social",
    number: 3,
    title: "الخدمات الاجتماعية",
    page: "صفحة 68",
    subtitle: "اعتنت الدولة السعودية بالمجتمع وخدمته بما يأتي:",
    icon: "🤝",
    color: "#1e8a55",
    points: [
      { term: "إنشاء الأوقاف والأسبلة", desc: "لخدمة المحتاجين" },
      { term: "توزيع الإعانات", desc: "لمساعدة الأسر وطلبة العلم" },
      { term: "إعانة الشباب على الزواج", desc: "تيسيرًا لبدء حياتهم الأسرية" },
    ],
  },
  {
    key: "security",
    number: 4,
    title: "الأمن",
    page: "صفحة 68",
    subtitle: "نشرت الدولة السعودية الأمن بما يأتي:",
    icon: "🛡️",
    color: "#095c35",
    points: [
      { term: "تطبيق الشريعة الإسلامية", desc: "والعدل والحزم" },
      { term: "إنشاء مجموعات لحفظ الأمن", desc: "لحماية الناس وممتلكاتهم" },
      { term: "تعيين أمراء في أنحاء الدولة", desc: "لإقامة الأمن وإدارة شؤون المواطنين" },
      { term: "تطوير نظام العسس ليلًا", desc: "للحراسة والتفقد في الليل" },
    ],
  },
  {
    key: "haramain",
    number: 5,
    title: "خدمة الحرمين الشريفين",
    page: "صفحة 69",
    subtitle: "من أشرَف جوانب الحضارة السعودية خدمة الحرمين الشريفين:",
    icon: "🕋",
    color: "#a8864a",
    points: [
      {
        term: "بدء الصناعة الوطنية لكسوة الكعبة المشرفة",
        desc: "في عهد الإمام سعود بن عبدالعزيز الذي أمر بحياكتها في الأحساء",
      },
      { term: "توفير الأمن والخدمات للحجاج", desc: "لأداء مناسكهم بطمأنينة وأمان" },
    ],
  },
  {
    key: "army",
    number: 6,
    title: "الجيش",
    page: "صفحة 69",
    subtitle: "نظّم أئمة الدولة السعودية الجانب العسكري من أجل توحيد الوطن، ومن أبرز مظاهره:",
    icon: "⚔️",
    color: "#063d23",
    points: [
      { term: "النداء", desc: "لإخبار جميع البلدات من أجل المشاركة في حملات توحيد الدولة والدفاع عنها" },
      { term: "التجمع بعد النداء", desc: "في مكان محدد للتحرك العسكري" },
      { term: "الراية السعودية الخضراء", desc: "وعليها شعار التوحيد تتقدم الجيش" },
      { term: "التحرك العسكري", desc: "في مجموعات منتظمة" },
      { term: "إنشاء سجلات", desc: "لأفراد الجيش والفرسان" },
      { term: "القيادة", desc: "برئاسة إمام الدولة أو من يكلفه بذلك" },
    ],
  },
  {
    key: "umran",
    number: 7,
    title: "العمران",
    page: "صفحة 69",
    subtitle: "اشتهرت الدولة السعودية بالعمران، ومن مظاهره:",
    icon: "🏰",
    color: "#4fa374",
    points: [
      { term: "بناء الأسوار وأبراج الحماية", desc: "لحماية المدن والبلدات" },
      { term: "بناء قصور الحكم", desc: "مثل قصر سلوى" },
      { term: "بناء دُور الضيافة", desc: "واستقبال الزائرين" },
      { term: "بناء البوابات", desc: "وإنشاء نظام الدخول إلى المدن والبلدات" },
    ],
  },
];

export const SUBALAT_MUDI = {
  title: "سبالة موضي",
  source: "بطاقة للاطلاع — صفحة 68",
  text: "أسسها الإمام عبدالعزيز بن محمد بن سعود في الطريف بالدرعية، وقفًا خاصًّا للمحتاجين وطلبة العلم، باسم والدته موضي بنت أبي وطبان. وما تزال معالم هذا الموقع باقية، ورُمّم ضمن مشروع الطريف.",
  points: [
    "المؤسس: الإمام عبدالعزيز بن محمد بن سعود",
    "المكان: حي الطريف بالدرعية",
    "الهدف: وقف للمحتاجين وطلبة العلم",
    "سُميت باسم: موضي بنت أبي وطبان (والدة الإمام)",
    "حالتها اليوم: ما تزال معالمها باقية ورُممت ضمن مشروع الطريف",
  ],
};

export interface StationMeta {
  n: number;
  title: string;
  subtitle: string;
  icon: string;
  axis?: string;
  type: string;
  color: string;
  minutes: number;
}

export const STATIONS: StationMeta[] = [
  { n: 1, title: "اكتشف حضارة وطنك", subtitle: "تهيئة وعصف ذهني", icon: "🧭", type: "تهيئة", color: "#0b6e3f", minutes: 10 },
  { n: 2, title: "الإدارة والحكم", subtitle: "البيعة • ولاية العهد • بيت المال", icon: "🏛️", axis: "admin", type: "مطابقة", color: "#095c35", minutes: 12 },
  { n: 3, title: "التعليم", subtitle: "المجالس العلمية ودُور العلم", icon: "📚", axis: "education", type: "تصنيف + نشاط الكتاب", color: "#86683a", minutes: 15 },
  { n: 4, title: "الخدمات الاجتماعية", subtitle: "الأوقاف والأسبلة والإعانات", icon: "🤝", axis: "social", type: "تصنيف", color: "#1e8a55", minutes: 12 },
  { n: 5, title: "نشاط سبالة موضي", subtitle: "نشاط الكتاب الثاني — وصف الصور", icon: "🕌", axis: "social", type: "وصف صور", color: "#a8864a", minutes: 20 },
  { n: 6, title: "الأمن", subtitle: "العدل والعسس وحفظ الأمن", icon: "🛡️", axis: "security", type: "مواقف", color: "#063d23", minutes: 12 },
  { n: 7, title: "خدمة الحرمين الشريفين", subtitle: "كسوة الكعبة وخدمة الحجاج", icon: "🕋", axis: "haramain", type: "اختيار وصح/خطأ", color: "#4fa374", minutes: 12 },
  { n: 8, title: "الجيش", subtitle: "النداء والراية والتحرك", icon: "⚔️", axis: "army", type: "ترتيب", color: "#084e2d", minutes: 15 },
  { n: 9, title: "العمران والاختبار الختامي", subtitle: "الأسوار والقصور + الاختبار الشامل", icon: "🏰", axis: "umran", type: "مطابقة + اختبار", color: "#0b6e3f", minutes: 25 },
  { n: 10, title: "حصاد الرحلة وشهادة الإنجاز", subtitle: "الخريطة والتأمل والشهادة", icon: "🎓", type: "تتويج", color: "#c9a86a", minutes: 10 },
];

export const GLOSSARY = [
  { term: "البيعة", def: "جزء أساسي من نظام الحكم في الدولة السعودية" },
  { term: "ولاية العهد", def: "للمساندة في إدارة الدولة" },
  { term: "بيت المال", def: "لموارد الدولة ومصروفاتها" },
  { term: "الأوقاف", def: "أملاك خُصصت لخدمة المحتاجين وطلبة العلم" },
  { term: "الأسبلة", def: "أماكن توفير الماء والخدمة للمحتاجين" },
  { term: "نظام العسس", def: "نظام الحراسة والتفقد ليلًا لحفظ الأمن" },
  { term: "الراية السعودية", def: "راية خضراء عليها شعار التوحيد تتقدم الجيش" },
  { term: "قصور الحكم", def: "مقار إدارة الدولة مثل قصر سلوى" },
  { term: "سبالة موضي", def: "وقف في الطريف بالدرعية أسسه الإمام عبدالعزيز بن محمد بن سعود" },
  { term: "قصر سلوى", def: "من قصور الحكم في الدرعية" },
];

// بنك الأسئلة الرسمي — مرتبط حرفيًا بمحتوى الكتاب ص 67-69
export interface BankQuestion {
  id: string;
  axis: AxisKey | "general";
  axisLabel: string;
  type: "mcq" | "true_false" | "matching" | "ordering" | "classification" | "short" | "image_desc" | "audio";
  difficulty: "تذكر" | "فهم" | "تطبيق" | "استنتاج";
  points: number;
  question: string;
  options?: string[];
  correct?: string | string[] | Record<string, string> | string[][];
  pairs?: { q: string; a: string }[];
  orderItems?: string[];
  categories?: { name: string; items: string[] }[];
  explanation: string;
  image?: string;
}

export const QUESTION_BANK: BankQuestion[] = [
  {
    id: "q1", axis: "admin", axisLabel: "الإدارة والحكم", type: "mcq", difficulty: "تذكر", points: 1,
    question: "ما الجزء الأساسي من نظام الحكم في الدولة السعودية الأولى والثانية؟",
    options: ["البيعة", "السوق", "الرحلات", "الزراعة"],
    correct: "البيعة",
    explanation: "البيعة جزء أساسي من نظام الحكم كما ورد في الكتاب صفحة 67.",
  },
  {
    id: "q2", axis: "admin", axisLabel: "الإدارة والحكم", type: "mcq", difficulty: "فهم", points: 1,
    question: "ما وظيفة «بيت المال» في الدولة السعودية؟",
    options: ["موارد الدولة ومصروفاتها", "تعليم الصغار", "بناء الأسوار", "حراسة الليل"],
    correct: "موارد الدولة ومصروفاتها",
    explanation: "بيت المال لموارد الدولة ومصروفاتها — صفحة 67.",
  },
  {
    id: "q3", axis: "admin", axisLabel: "الإدارة والحكم", type: "true_false", difficulty: "فهم", points: 1,
    question: "كانت ولاية العهد في الدولة السعودية للمساندة في إدارة الدولة.",
    options: ["صواب", "خطأ"],
    correct: "صواب",
    explanation: "صواب — ولاية العهد للمساندة في إدارة الدولة (ص 67).",
  },
  {
    id: "q4", axis: "education", axisLabel: "التعليم", type: "mcq", difficulty: "تذكر", points: 1,
    question: "من مظاهر ازدهار التعليم في الدولة السعودية:",
    options: ["عقد المجالس العلمية بمشاركة أئمة الدولة", "إغلاق المكتبات", "منع التأليف", "إهمال العلماء"],
    correct: "عقد المجالس العلمية بمشاركة أئمة الدولة",
    explanation: "من مظاهر التعليم: عقد المجالس العلمية بمشاركة أئمة الدولة (ص 67).",
  },
  {
    id: "q5", axis: "education", axisLabel: "التعليم", type: "true_false", difficulty: "تذكر", points: 1,
    question: "أنشأت الدولة السعودية دُور العلم والمكتبات ورعت العلماء وشجعتهم.",
    options: ["صواب", "خطأ"],
    correct: "صواب",
    explanation: "صواب — إنشاء دُور العلم والمكتبات ورعاية العلماء وتشجيعهم (ص 67).",
  },
  {
    id: "q6", axis: "social", axisLabel: "الخدمات الاجتماعية", type: "mcq", difficulty: "فهم", points: 1,
    question: "أنشأت الدولة السعودية الأوقاف والأسبلة من أجل:",
    options: ["خدمة المحتاجين", "تزيين المدن فقط", "جمع الضرائب", "بناء السفن"],
    correct: "خدمة المحتاجين",
    explanation: "إنشاء الأوقاف والأسبلة لخدمة المحتاجين (ص 68).",
  },
  {
    id: "q7", axis: "social", axisLabel: "الخدمات الاجتماعية", type: "mcq", difficulty: "تذكر", points: 1,
    question: "من أسس «سبالة موضي» في الطريف بالدرعية؟",
    options: ["الإمام عبدالعزيز بن محمد بن سعود", "الإمام سعود بن عبدالعزيز", "الإمام محمد بن سعود", "الإمام فيصل بن تركي"],
    correct: "الإمام عبدالعزيز بن محمد بن سعود",
    explanation: "أسسها الإمام عبدالعزيز بن محمد بن سعود وقفًا للمحتاجين وطلبة العلم (ص 68).",
  },
  {
    id: "q8", axis: "social", axisLabel: "الخدمات الاجتماعية", type: "true_false", difficulty: "فهم", points: 1,
    question: "وزعت الدولة السعودية الإعانات لمساعدة الأسر وطلبة العلم، وأعانت الشباب على الزواج.",
    options: ["صواب", "خطأ"],
    correct: "صواب",
    explanation: "صواب — توزيع الإعانات ومساعدة الأسر وطلبة العلم وإعانة الشباب على الزواج (ص 68).",
  },
  {
    id: "q9", axis: "security", axisLabel: "الأمن", type: "mcq", difficulty: "تذكر", points: 1,
    question: "بماذا نشرت الدولة السعودية الأمن؟",
    options: ["تطبيق الشريعة الإسلامية والعدل والحزم", "إهمال القضاء", "ترك الحراسة", "منع السفر"],
    correct: "تطبيق الشريعة الإسلامية والعدل والحزم",
    explanation: "نشرت الأمن بتطبيق الشريعة الإسلامية والعدل والحزم (ص 68).",
  },
  {
    id: "q10", axis: "security", axisLabel: "الأمن", type: "mcq", difficulty: "فهم", points: 1,
    question: "ما «نظام العسس» الذي طورته الدولة السعودية؟",
    options: ["نظام الحراسة ليلًا", "نظام الري نهارًا", "نظام البيع في السوق", "نظام بناء البيوت"],
    correct: "نظام الحراسة ليلًا",
    explanation: "طورت الدولة نظام العسس ليلًا لحفظ الأمن (ص 68).",
  },
  {
    id: "q11", axis: "haramain", axisLabel: "خدمة الحرمين", type: "mcq", difficulty: "تذكر", points: 1,
    question: "في عهد أي إمام بدأت الصناعة الوطنية لكسوة الكعبة المشرفة؟",
    options: ["الإمام سعود بن عبدالعزيز", "الإمام عبدالله بن سعود", "الإمام تركي بن عبدالله", "الإمام عبدالرحمن بن فيصل"],
    correct: "الإمام سعود بن عبدالعزيز",
    explanation: "بدأت في عهد الإمام سعود بن عبدالعزيز الذي أمر بحياكتها في الأحساء (ص 69).",
  },
  {
    id: "q12", axis: "haramain", axisLabel: "خدمة الحرمين", type: "mcq", difficulty: "فهم", points: 1,
    question: "أين أمر الإمام سعود بن عبدالعزيز بحياكة كسوة الكعبة؟",
    options: ["في الأحساء", "في مصر", "في الشام", "في اليمن"],
    correct: "في الأحساء",
    explanation: "أمر بحياكتها في الأحساء — بداية الصناعة الوطنية للكسوة (ص 69).",
  },
  {
    id: "q13", axis: "army", axisLabel: "الجيش", type: "mcq", difficulty: "تذكر", points: 1,
    question: "ما أول خطوات التعبئة العسكرية في الدولة السعودية؟",
    options: ["النداء لإخبار جميع البلدات", "بناء القصور", "نسخ الكتب", "توزيع الإعانات"],
    correct: "النداء لإخبار جميع البلدات",
    explanation: "النداء لإخبار جميع البلدات للمشاركة في حملات التوحيد والدفاع (ص 69).",
  },
  {
    id: "q14", axis: "army", axisLabel: "الجيش", type: "true_false", difficulty: "فهم", points: 1,
    question: "كانت الراية السعودية الخضراء وعليها شعار التوحيد تتقدم الجيش.",
    options: ["صواب", "خطأ"],
    correct: "صواب",
    explanation: "صواب — الراية الخضراء بشعار التوحيد تتقدم الجيش (ص 69).",
  },
  {
    id: "q15", axis: "army", axisLabel: "الجيش", type: "mcq", difficulty: "فهم", points: 1,
    question: "بقيادة من كان الجيش في الدولة السعودية؟",
    options: ["إمام الدولة أو من يكلفه بذلك", "أمير السوق", "كبير الكتّاب", "شيخ القبيلة فقط"],
    correct: "إمام الدولة أو من يكلفه بذلك",
    explanation: "القيادة برئاسة إمام الدولة أو من يكلفه بذلك (ص 69).",
  },
  {
    id: "q16", axis: "umran", axisLabel: "العمران", type: "mcq", difficulty: "تذكر", points: 1,
    question: "اذكر مثالًا على قصور الحكم التي بنتها الدولة السعودية:",
    options: ["قصر سلوى", "قصر الحمراء", "قصر فرساي", "قصر باكنغهام"],
    correct: "قصر سلوى",
    explanation: "بناء قصور الحكم مثل قصر سلوى (ص 69).",
  },
  {
    id: "q17", axis: "umran", axisLabel: "العمران", type: "true_false", difficulty: "فهم", points: 1,
    question: "بنت الدولة السعودية الأسوار وأبراج الحماية والبوابات ونظمت الدخول إلى المدن.",
    options: ["صواب", "خطأ"],
    correct: "صواب",
    explanation: "صواب — بناء الأسوار وأبراج الحماية والبوابات ونظام الدخول (ص 69).",
  },
  {
    id: "q18", axis: "general", axisLabel: "مراجعة شاملة", type: "mcq", difficulty: "استنتاج", points: 2,
    question: "لماذا يُعد الاهتمام بالجوانب الحضارية دليلًا على قوة الدولة؟",
    options: [
      "لأن قوة الدولة نابعة من إرثها الحضاري وأنظمتها",
      "لأن القوة في كثرة الحروب فقط",
      "لأن الحضارة أمر ثانوي",
      "لأن الأنظمة تُضعف الدولة",
    ],
    correct: "لأن قوة الدولة نابعة من إرثها الحضاري وأنظمتها",
    explanation: "مقدمة الدرس: تأسيس أي دولة قوية نابع من إرثها الحضاري وقوتها في أنظمتها.",
  },
];

export const FINAL_QUIZ_IDS = ["q1","q2","q4","q5","q6","q7","q9","q10","q11","q12","q13","q14","q16","q17","q18"];
