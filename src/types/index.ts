export type BodyLocation = 'Sol Kol' | 'Sağ Kol' | 'Yüz & Boyun' | 'Eller & Bilekler' | 'Göğüs & Sırt' | 'Bacaklar';

export interface CVAnalysis {
  id: string;
  photoUrl: string;
  location: BodyLocation;
  timestamp: string;
  redness: number; // 0 - 100 Eritem (Kızarıklık)
  dryness: number; // 0 - 100 Kserozis (Kuruluk)
  scaling: number; // 0 - 100 Soyulma / Kepeklenme
  cracking: number; // 0 - 100 Çatlama (Fissür)
  oozing: number; // 0 - 100 Sızıntı / Akıntı
  swelling: number; // 0 - 100 Ödem (Şişlik)
  pigmentation: number; // 0 - 100 Pigmentasyon Değişimi
  surfaceAreaCm2: number; // Etkilenen alan (cm²)
  scoradIndex: number; // SCORAD Klinik Şiddet Skoru (0-103)
  healingProgression: number; // Baseline'a göre iyileşme yüzdesi %
  confidenceScore: number; // Güven skoru %
  infectionRisk: 'Düşük' | 'Orta' | 'Yüksek';
  affectedRegions: Array<{ x: number; y: number; radius: number; severity: number; label: string }>;
  notes: string;
  analysisMethod: 'canlı-piksel-analizi' | 'simüle';
}

export type FlareSeverityLevel = 'Hafif' | 'Orta' | 'Şiddetli' | 'Çok Şiddetli';

export interface FlareScoreData {
  currentScore: number; // 0 - 100, yüksek = daha kötü alevlenme
  severityLevel: FlareSeverityLevel;
  previousScore: number;
  weeklyTrend: number[];
  monthlyTrend: number[];
  factors: {
    itching: { weight: number; score: number; impact: 'positive' | 'negative' | 'neutral'; text: string };
    dryness: { weight: number; score: number; impact: 'positive' | 'negative' | 'neutral'; text: string };
    redness: { weight: number; score: number; impact: 'positive' | 'negative' | 'neutral'; text: string };
    sleepQuality: { weight: number; score: number; impact: 'positive' | 'negative' | 'neutral'; text: string };
    moisturizerUsage: { weight: number; score: number; impact: 'positive' | 'negative' | 'neutral'; text: string };
    medicationAdherence: { weight: number; score: number; impact: 'positive' | 'negative' | 'neutral'; text: string };
    weather: { weight: number; score: number; impact: 'positive' | 'negative' | 'neutral'; text: string };
    stress: { weight: number; score: number; impact: 'positive' | 'negative' | 'neutral'; text: string };
    diet: { weight: number; score: number; impact: 'positive' | 'negative' | 'neutral'; text: string };
  };
}

export interface EnvironmentalData {
  city: string;
  latitude: number;
  longitude: number;
  temperature: number; // °C
  humidity: number; // % Nem
  uvIndex: number; // 0 - 12
  windSpeed: number; // km/s
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
  forecast72h: Array<{
    day: string;
    dateISO: string;
    temp: number;
    humidity: number;
    uvIndex: number;
    aqi: number;
    flareRisk: number; // %
    primaryDriver: string;
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

export interface FoodLogItem {
  id: string;
  name: string;
  category: 'Yüksek Histaminli' | 'Yaygın Alerjen' | 'İşlenmiş Gıda' | 'Katkı / Boya' | 'Güvenli / Anti-Enflamatuar';
  timestamp: string;
  histamineLevel: 'Düşük' | 'Orta' | 'Yüksek';
  possibleFlareLink?: string;
}

export interface FoodCatalogItem {
  id: string;
  name: string;
  group: 'Tetikleyici Olabilir' | 'Cilt Dostu';
  flareRisk?: number; // 0-100, yalnızca tetikleyici grubu için
  benefit?: string; // yalnızca cilt dostu grubu için
  rationale: string;
  recommendation: string;
}

export interface SymptomCorrelation {
  foodName: string;
  lagHours: number;
  symptomIncrease: number; // +1 ile +10
  confidence: number; // %
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
