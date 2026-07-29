// Hafif çok dillilik katmanı: uygulama varsayılan olarak Türkçe kalır, İngilizce'ye
// geçilebilir. Kapsam bilinçli olarak sınırlıdır — kenar çubuğu, üst bar ve her
// sekmenin ana başlığı çevrilir; form alanları ve uzun açıklama metinleri şimdilik
// yalnızca Türkçe'dir (bu, "hepsini derinlemesine çevir" yerine bilinçli bir kapsam kararıdır).

export type Language = 'tr' | 'en';

export type TranslationKey =
  | 'nav.overview' | 'nav.insights' | 'nav.cv' | 'nav.calendar' | 'nav.treatment'
  | 'nav.chat' | 'nav.environmental' | 'nav.scanner' | 'nav.triggers' | 'nav.food'
  | 'nav.routine' | 'nav.journal' | 'nav.security'
  | 'header.badge' | 'header.subtitle' | 'header.voiceAssistant'
  | 'sidebar.modules'
  | 'title.overview' | 'title.insights' | 'title.cv' | 'title.calendar' | 'title.treatment'
  | 'title.chat' | 'title.environmental' | 'title.scanner' | 'title.triggers' | 'title.food'
  | 'title.routine' | 'title.journal' | 'title.security'
  | 'settings.language' | 'settings.languageHint';

export const TRANSLATIONS: Record<Language, Record<TranslationKey, string>> = {
  tr: {
    'nav.overview': 'Alevlenme Raporu',
    'nav.insights': 'İçgörüler',
    'nav.cv': 'Cilt Fotoğraf Analizi',
    'nav.calendar': 'Takvim & Zaman Çizelgesi',
    'nav.treatment': 'Tedavi Geçmişi',
    'nav.chat': 'Sohbet Asistanı',
    'nav.environmental': 'Hava & Çevre Verileri',
    'nav.scanner': 'Ürün İçerik Tarayıcı',
    'nav.triggers': 'Tetikleyici Günlüğü',
    'nav.food': 'Beslenme Asistanı',
    'nav.routine': 'Günlük Bakım Listesi',
    'nav.journal': 'Sağlık Günlüğü',
    'nav.security': 'Gizlilik & Erişilebilirlik',
    'header.badge': 'Cilt Takip',
    'header.subtitle': 'Egzama ve Bariyer Takip Platformu',
    'header.voiceAssistant': 'Sesli Asistan',
    'sidebar.modules': 'Uygulama Modülleri',
    'title.overview': 'Alevlenme Raporu',
    'title.insights': 'İçgörüler',
    'title.cv': 'Cilt Fotoğraf Analizi',
    'title.calendar': 'Takvim & Zaman Çizelgesi',
    'title.treatment': 'Tedavi Geçmişi Kronolojisi',
    'title.chat': 'Sohbet Asistanı',
    'title.environmental': 'Hava & Çevre Verileri',
    'title.scanner': 'Ürün İçerik Tarayıcı',
    'title.triggers': 'Tetikleyici Günlüğü',
    'title.food': 'Beslenme Asistanı',
    'title.routine': 'Günlük Bakım Listesi',
    'title.journal': 'Sağlık Günlüğü',
    'title.security': 'Gizlilik, Güvenlik Logları & Erişilebilirlik Ayarları',
    'settings.language': 'Dil / Language',
    'settings.languageHint': 'Kenar çubuğu, üst bar ve sekme başlıkları seçilen dilde gösterilir; form içerikleri şimdilik Türkçedir.'
  },
  en: {
    'nav.overview': 'Flare Report',
    'nav.insights': 'Insights',
    'nav.cv': 'Skin Photo Analysis',
    'nav.calendar': 'Calendar & Timeline',
    'nav.treatment': 'Treatment History',
    'nav.chat': 'Chat Assistant',
    'nav.environmental': 'Weather & Environment',
    'nav.scanner': 'Product Ingredient Scanner',
    'nav.triggers': 'Trigger Journal',
    'nav.food': 'Nutrition Assistant',
    'nav.routine': 'Daily Care Routine',
    'nav.journal': 'Health Journal',
    'nav.security': 'Privacy & Accessibility',
    'header.badge': 'Skin Tracking',
    'header.subtitle': 'Eczema & Skin Barrier Tracking Platform',
    'header.voiceAssistant': 'Voice Assistant',
    'sidebar.modules': 'App Modules',
    'title.overview': 'Flare Report',
    'title.insights': 'Insights',
    'title.cv': 'Skin Photo Analysis',
    'title.calendar': 'Calendar & Timeline',
    'title.treatment': 'Treatment History Timeline',
    'title.chat': 'Chat Assistant',
    'title.environmental': 'Weather & Environment',
    'title.scanner': 'Product Ingredient Scanner',
    'title.triggers': 'Trigger Journal',
    'title.food': 'Nutrition Assistant',
    'title.routine': 'Daily Care Routine',
    'title.journal': 'Health Journal',
    'title.security': 'Privacy, Security Logs & Accessibility Settings',
    'settings.language': 'Dil / Language',
    'settings.languageHint': 'The sidebar, header, and tab titles switch to the selected language; form content is still Turkish for now.'
  }
};

export function translate(language: Language, key: TranslationKey): string {
  return TRANSLATIONS[language][key] ?? TRANSLATIONS.tr[key] ?? key;
}
