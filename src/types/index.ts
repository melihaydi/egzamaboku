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
  swelling: number; // 0 - 100 Ödem (Şişlik)
  pigmentation: number; // 0 - 100 Pigmentasyon Değişimi
  surfaceAreaCm2: number; // Etkilenen alan (cm²)
  scoradIndex: number; // SCORAD Klinik Şiddet Skoru (0-103)
  healingProgression: number; // Baseline'a göre iyileşme yüzdesi %
  confidenceScore: number; // Güven skoru %
  heatMapData: Array<{ x: number; y: number; intensity: number; label: string }>;
  notes: string;
}

export interface HealingScoreData {
  currentScore: number; // 0 - 100 İyileşme Endeksi
  previousScore: number;
  weeklyTrend: number[];
  monthlyTrend: number[];
  recoveryVelocity: number; // puan / hafta
  healingStreakDays: number; // İyileşme serisi (gün)
  riskScore: number; // Alevlenme riski %
  habitFactors: {
    flareSeverity: { weight: number; score: number; impact: 'positive' | 'negative' | 'neutral'; text: string };
    photoTrend: { weight: number; score: number; impact: 'positive' | 'negative' | 'neutral'; text: string };
    medicationAdherence: { weight: number; score: number; impact: 'positive' | 'negative' | 'neutral'; text: string };
    moisturizerConsistency: { weight: number; score: number; impact: 'positive' | 'negative' | 'neutral'; text: string };
    sleepQuality: { weight: number; score: number; impact: 'positive' | 'negative' | 'neutral'; text: string };
    stressLevel: { weight: number; score: number; impact: 'positive' | 'negative' | 'neutral'; text: string };
    waterIntake: { weight: number; score: number; impact: 'positive' | 'negative' | 'neutral'; text: string };
    loggedTriggers: { weight: number; score: number; impact: 'positive' | 'negative' | 'neutral'; text: string };
  };
}

export interface EnvironmentalData {
  city: string;
  temperature: number; // °C
  humidity: number; // % Nem
  uvIndex: number; // 0 - 12
  windSpeed: number; // km/s
  aqi: {
    overall: number; // 0 - 500
    category: 'İyi' | 'Orta' | 'Hassas Gruplar İçin Riskli' | 'Sağlıksız' | 'Çok Sağlıksız';
    pm25: number;
    pm10: number;
    ozone: number;
    no2: number;
  };
  pollen: {
    tree: 'Düşük' | 'Orta' | 'Yüksek' | 'Çok Yüksek';
    grass: 'Düşük' | 'Orta' | 'Yüksek' | 'Çok Yüksek';
    weed: 'Düşük' | 'Orta' | 'Yüksek' | 'Çok Yüksek';
    overallRisk: 'Düşük' | 'Orta' | 'Yüksek' | 'Şiddetli';
  };
  forecast72h: Array<{
    day: string;
    temp: number;
    humidity: number;
    flareRisk: number; // %
    primaryDriver: string;
  }>;
}

export interface IngredientItem {
  name: string;
  category: 'Güvenli (Bariyer Onarıcı)' | 'Tahriş Edici (İrritan)' | 'Alerjen Riskli' | 'Sentetik Parfüm' | 'Kurutucu Alkol' | 'Koruyucu (Korozif)' | 'Sentetik Boya';
  riskLevel: 'Düşük' | 'Orta' | 'Yüksek';
  explanation: string;
}

export interface ProductScanResult {
  id: string;
  productName: string;
  brand: string;
  scannedAt: string;
  compatibilityScore: number; // 0-100
  ratingCategory: 'Mükemmel Uyumlu' | 'Genellikle Uygun' | 'Dikkatli Kullanılmalı' | 'Yüksek Tahriş Riski';
  ingredients: IngredientItem[];
  rawTextScanned: string;
  flaggedCount: number;
}

export interface FoodLogItem {
  id: string;
  name: string;
  category: 'Yüksek Histaminli' | 'Yaygın Alerjen' | 'İşlenmiş Gıda' | 'Katkı / Boya' | 'Güvenli / Anti-Enflamatuar';
  timestamp: string;
  histamineLevel: 'Düşük' | 'Orta' | 'Yüksek';
  possibleFlareLink?: string;
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
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: 'İlaçlar & Biyolojikler' | 'Topikal Tedaviler' | 'Egzama Türleri' | 'Çocuk & Hamilelik' | 'Günlük Bakım';
  summary: string;
  evidenceLevel: 'FDA Onaylı Biyolojik' | 'Klinik Standart Tedavi' | 'Uzman Konsensüsü' | 'Yeni Araştırma';
  content: string;
  keyTakeaways: string[];
  tags: string[];
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
