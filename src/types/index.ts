export type BodyLocation = 'Sol Kol' | 'Sağ Kol' | 'Yüz & Boyun' | 'Eller & Bilekler' | 'Göğüs & Sırt' | 'Bacaklar';

export interface CVAnalysis {
  id: string;
  photoUrl: string;
  location: BodyLocation;
  timestamp: string;
  // Aşağıdaki tüm alanlar YALNIZCA fotoğrafın piksel verisinden ölçülür.
  // Kaşıntı, ağrı, uyku gibi öznel belirtiler burada YER ALMAZ; bunlar SymptomEntry ile kullanıcı tarafından girilir.
  redness: number; // 0 - 100 Eritem (Kızarıklık)
  scaling: number; // 0 - 100 Soyulma / Kepeklenme
  swelling: number; // 0 - 100 Ödem (Şişlik)
  crusting: number; // 0 - 100 Kabuklanma
  oozing: number; // 0 - 100 Sızıntı / Akıntı
  pigmentation: number; // 0 - 100 Pigmentasyon Değişimi
  surfaceAreaCm2: number; // Etkilenen alan (cm²)
  confidenceScore: number; // Görüntü kalitesine dayalı güven skoru %
  infectionRisk: 'Düşük' | 'Orta' | 'Yüksek'; // Yalnızca görüntüden: sızıntı + kızarıklık + şişlik sinyaline dayalı
  affectedRegions: Array<{ x: number; y: number; radius: number; severity: number; label: string }>;
  reasoning: string[]; // Her ölçümün hangi somut piksel sinyaline dayandığını açıklayan cümleler
  notes: string;
  analysisMethod: 'canlı-piksel-analizi' | 'örnek-veri';
}

export type FlareSeverityLevel = 'Hafif' | 'Orta' | 'Şiddetli' | 'Çok Şiddetli';

// Kullanıcının KENDİSİNİN girdiği öznel belirti şiddetleri (0-10). Yapay zeka bu değerleri asla tahmin etmez.
export interface SymptomEntry {
  id: string;
  dateISO: string;
  timestamp: string;
  itching: number; // Kaşıntı 0-10
  pain: number; // Ağrı 0-10
  burning: number; // Yanma / Batma 0-10
  dryness: number; // Kuruluk (hissedilen) 0-10
  cracking: number; // Çatlama (hissedilen) 0-10
  bleeding: number; // Kanama 0-10
  sleepImpact: number; // Uykuya etkisi 0-10
  note?: string;
}

export interface EnvironmentalData {
  city: string;
  latitude: number;
  longitude: number;
  temperature: number; // °C
  humidity: number; // % Nem
  uvIndex: number; // 0 - 12
  windSpeed: number; // km/s
  pressure: number; // hPa
  precipitationProbability: number; // %
  aqi: {
    overall: number; // European AQI 0-100+
    category: 'İyi' | 'Orta' | 'Hassas Gruplar İçin Riskli' | 'Sağlıksız' | 'Çok Sağlıksız';
    pm25: number;
    pm10: number;
  };
  pollen: {
    tree: number; // grains/m³
    grass: number;
    weed: number;
    overallRisk: 'Düşük' | 'Orta' | 'Yüksek' | 'Çok Yüksek';
  };
  moldDataAvailable: false; // Açık kaynak ücretsiz API'lerde küf sporu verisi bulunmuyor; dürüstlük için açıkça belirtilir
  forecast: Array<{
    day: string;
    dateISO: string;
    temp: number;
    humidity: number;
    uvIndex: number;
    aqi: number;
    pressure: number;
  }>;
  dataSource: 'canlı-api' | 'yedek-veri';
  fetchedAt: string;
}

export type IngredientCategory =
  | 'Bariyer Onarıcı'
  | 'Parfüm / Fragrance'
  | 'Alkol'
  | 'SLS / Sülfat'
  | 'MIT / MCI'
  | 'Paraben'
  | 'Uçucu Yağ'
  | 'Lanolin'
  | 'Üre'
  | 'Seramid'
  | 'Petrolatum'
  | 'Gliserin'
  | 'Diğer';

export interface IngredientItem {
  name: string;
  category: IngredientCategory;
  riskLevel: 'Düşük' | 'Orta' | 'Yüksek';
  explanation: string;
}

export interface ProductScanResult {
  id: string;
  productName: string;
  brand: string;
  scannedAt: string;
  compatibilityScore: number; // 0-100
  ratingCategory: 'Güvenli' | 'Dikkatli Kullanılmalı' | 'Önerilmez';
  ingredients: IngredientItem[];
  rawTextScanned: string;
  flaggedCount: number;
  scanMethod: 'ocr' | 'metin-girişi';
}

export type FoodRating = 'Güvenli' | 'Bazen Sorunlu' | 'Her Zaman Tetikliyor';

// Kullanıcının kendi besin kaydı: derecelendirme tamamen kullanıcı tarafından yapılır.
export interface FoodItem {
  id: string;
  name: string;
  rating: FoodRating;
  timesLogged: number;
  lastLoggedISO: string;
  notes?: string;
}

export interface Meal {
  id: string;
  name: string;
  dateISO: string;
  foodNames: string[];
  reactionSeverity?: number; // 0-10, kullanıcı isterse girer
  reactionNote?: string;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  notes?: string;
}

// Kullanıcının kendi tetikleyici günlüğü: AI hiçbir tetikleyiciyi otomatik önermez/tahmin etmez.
export type TriggerCategory = 'Gıda' | 'Çevresel' | 'Ürün' | 'Diğer';

export interface TriggerEntry {
  id: string;
  name: string;
  category: TriggerCategory;
  dateISO: string;
  severity: number; // 0-10, kullanıcının kendi değerlendirmesi
  reasonNote: string; // Kullanıcının bunun bir tetikleyici olduğunu düşünme nedeni
}

export interface RoutineTask {
  id: string;
  title: string;
  timeOfDay: 'Sabah' | 'Öğle' | 'Akşam' | 'Gece';
  completed: boolean;
  category: 'Nemlendirici' | 'İlaç / Krem' | 'Su Tüketimi' | 'Stres Yönetimi' | 'Banyo' | 'Uyku Hazırlığı';
  durationMinutes?: number;
  reminderTime?: string; // "HH:mm"
  order: number;
}

export type CalendarEventType = 'flare' | 'photo' | 'medication' | 'injection' | 'doctorVisit' | 'missedMoisturizer' | 'note';

export interface CalendarEvent {
  id: string;
  dateISO: string; // YYYY-MM-DD
  type: CalendarEventType;
  title: string;
  description?: string;
}

export interface FamilyProfile {
  id: string;
  name: string;
  relationship: 'Kendi Profilim' | 'Çocuğum' | 'Ebeveynim' | 'Eşim';
  avatarColor: string;
  avatarUrl?: string; // Kullanıcı tarafından yüklenen profil fotoğrafı (base64 data URL)
  age: number;
  eczemaType: string;
  primaryLocations: BodyLocation[];
}

export interface TreatmentEntry {
  id: string;
  medicationName: string; // Örn: 'Dupixent (Dupilumab)'
  drugClass: string; // Örn: 'Biyolojik Tedavi (IL-4 / IL-13 İnhibitörü)'
  route: string; // Örn: 'Subkütan Enjeksiyon (14 Günde Bir)'
  bodyArea?: BodyLocation;
  startDate: string; // Örn: 'Şubat 2026'
  endDate: string | null; // null = halen devam ediyor
  durationLabel: string; // Örn: '5 Aydır Devam Ediyor', '1.5 Yıl (18 Ay)'
  status: 'Devam Ediyor' | 'Sonlandırıldı';
  reasonForChange?: string; // Bir sonraki tedaviye neden geçildiği
  notes?: string;
}

export type JournalCategory = 'Alerji' | 'Kişisel Not' | 'Doktor Notu' | 'Tıbbi Geçmiş';

export interface JournalEntry {
  id: string;
  category: JournalCategory;
  title: string;
  content: string;
  date: string;
  severity?: 'Hafif' | 'Orta' | 'Şiddetli'; // yalnızca Alerji kategorisi için
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  urgent?: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  ipAddress: string;
}
