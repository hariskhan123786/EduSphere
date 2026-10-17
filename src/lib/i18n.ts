/**
 * EduSphere AI - Enterprise Internationalization & RTL Localization Engine
 * Supports English, Urdu (اردو), and Arabic (العربية) with auto-RTL direction switching.
 */

export type Language = "en" | "ur" | "ar";

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  searchPlaceholder: string;
  notifications: string;
  securityCenter: string;
  analytics: string;
  importCenter: string;
  documentGenerator: string;
  approvals: string;
  sessions: string;
  students: string;
  teachers: string;
  attendance: string;
  fees: string;
  results: string;
  timetable: string;
  library: string;
  transport: string;
  hostel: string;
  payroll: string;
  settings: string;
  logout: string;
  offlineMode: string;
  onlineMode: string;
  syncNow: string;
  quickActions: string;
  totalStudents: string;
  totalRevenue: string;
  attendanceRate: string;
  pendingApprovals: string;
  save: string;
  cancel: string;
  confirm: string;
  downloadPdf: string;
  print: string;
}

const translations: Record<Language, TranslationDictionary> = {
  en: {
    appName: "EduSphere AI",
    tagline: "Enterprise School Management Cloud & Desktop ERP",
    searchPlaceholder: "Search students, teachers, fees, vouchers (Ctrl+K)...",
    notifications: "Notifications",
    securityCenter: "Security Center",
    analytics: "Advanced Analytics",
    importCenter: "Data Import Center",
    documentGenerator: "Document Generator",
    approvals: "Approval Workflows",
    sessions: "Academic Sessions",
    students: "Students",
    teachers: "Faculty & Staff",
    attendance: "Attendance Register",
    fees: "Fee Vouchers & Ledger",
    results: "Exam Results & Marks",
    timetable: "Class Timetables",
    library: "Library Catalog",
    transport: "Transport Routes",
    hostel: "Hostel Management",
    payroll: "Staff Payroll",
    settings: "Campus Settings",
    logout: "Sign Out",
    offlineMode: "Offline Mode (Local SQLite)",
    onlineMode: "Cloud Synchronized",
    syncNow: "Sync Now",
    quickActions: "Quick Actions",
    totalStudents: "Total Enrolled",
    totalRevenue: "Fee Collection (PKR)",
    attendanceRate: "Overall Attendance",
    pendingApprovals: "Pending Approvals",
    save: "Save Changes",
    cancel: "Cancel",
    confirm: "Confirm Action",
    downloadPdf: "Download PDF",
    print: "Print Document",
  },
  ur: {
    appName: "ایجو سفیئر اے آئی",
    tagline: "جدید تعلیمی ادارہ جاتی انتظامی نظام برائے پاکستان",
    searchPlaceholder: "طلباء، اساتذہ، فیس چالان تلاش کریں (Ctrl+K)...",
    notifications: "اطلاعات و نوٹس",
    securityCenter: "سیکیورٹی و سیشنز",
    analytics: "جامع اعداد و شمار",
    importCenter: "ڈیٹا امپورٹ سینٹر",
    documentGenerator: "دستاویزات جنریٹر",
    approvals: "منظوری کے مراحل",
    sessions: "تعلیمی سیشنز",
    students: "طلباء و طالبات",
    teachers: "اساتذہ و عملہ",
    attendance: "حاضری رجسٹر",
    fees: "فیس واؤچرز و کھاتہ",
    results: "امتحانی نتائج و نمبرات",
    timetable: "ٹائم ٹیبل و شیڈول",
    library: "کتب خانہ",
    transport: "ٹرانسپورٹ روٹس",
    hostel: "ہاسٹل رومز",
    payroll: "تنخواہ جات",
    settings: "اسکول سیٹنگز",
    logout: "لاگ آؤٹ",
    offlineMode: "آف لائن موڈ (مقامی ڈیٹا بیس)",
    onlineMode: "کلاؤڈ آن لائن",
    syncNow: "ابھی ہم آہنگ کریں",
    quickActions: "فوری اقدامات",
    totalStudents: "کل داخل طلباء",
    totalRevenue: "کل وصول شدہ فیس (روپے)",
    attendanceRate: "مجموعی حاضری کا تناسب",
    pendingApprovals: "زیر التواء منظوریاں",
    save: "محفوظ کریں",
    cancel: "منسوخ",
    confirm: "تصدیق کریں",
    downloadPdf: "پی ڈی ایف ڈاؤن لوڈ",
    print: "پرنٹ کریں",
  },
  ar: {
    appName: "إيديوسفير للذكاء الاصطناعي",
    tagline: "النظام الشامل لإدارة المدارس والمؤسسات التعليمية",
    searchPlaceholder: "البحث عن الطلاب، المعلمين، الفواتير (Ctrl+K)...",
    notifications: "الإشعارات والتنبيهات",
    securityCenter: "مركز الأمان والجلسات",
    analytics: "التحليلات المتقدمة",
    importCenter: "مركز استيراد البيانات",
    documentGenerator: "منشئ الوثائق والشهادات",
    approvals: "سير الموافقات",
    sessions: "الفصول الأكاديمية",
    students: "الطلاب والطالبات",
    teachers: "هيئة التدريس",
    attendance: "سجل الحضور والغياب",
    fees: "إدارة الرسوم المدرسية",
    results: "النتائج والدرجات",
    timetable: "جدول الحصص",
    library: "المكتبة المدرسية",
    transport: "المواصلات والحافلات",
    hostel: "السكن الداخلي",
    payroll: "الرواتب والمستحقات",
    settings: "إعدادات المؤسسة",
    logout: "تسجيل الخروج",
    offlineMode: "الوضع غير المتصل (SQLite)",
    onlineMode: "متصل بالسحابة",
    syncNow: "مزامنة الآن",
    quickActions: "إجراءات سريعة",
    totalStudents: "إجمالي الطلاب",
    totalRevenue: "إجمالي التحصيل",
    attendanceRate: "نسبة الحضور العامة",
    pendingApprovals: "الموافقات المعلقة",
    save: "حفظ التغييرات",
    cancel: "إلغاء",
    confirm: "تأكيد",
    downloadPdf: "تحميل PDF",
    print: "طباعة الوثيقة",
  }
};

export const RTL_LANGUAGES: Language[] = ["ur", "ar"];

export function getLanguage(): Language {
  const saved = localStorage.getItem("edusphere_lang") as Language;
  if (saved && (saved === "en" || saved === "ur" || saved === "ar")) {
    return saved;
  }
  return "en";
}

export function setLanguage(lang: Language): void {
  localStorage.setItem("edusphere_lang", lang);
  const isRtl = RTL_LANGUAGES.includes(lang);
  document.documentElement.dir = isRtl ? "rtl" : "ltr";
  document.documentElement.lang = lang;
  window.dispatchEvent(new Event("languagechange"));
}

export function useTranslation() {
  const currentLang = getLanguage();
  const isRtl = RTL_LANGUAGES.includes(currentLang);
  const t = translations[currentLang] || translations.en;

  return {
    t,
    lang: currentLang,
    isRtl,
    setLang: setLanguage
  };
}
