import type {
  CVAnalysis,
  EnvironmentalData,
  SymptomEntry,
  ProductScanResult,
  FoodItem,
  Meal,
  Recipe,
  TriggerEntry,
  RoutineTask,
  FamilyProfile,
  AuditLogEntry,
  TreatmentEntry,
  ChatMessage,
  CalendarEvent,
  JournalEntry
} from '../types';
import { DEFAULT_LOCATION } from '../lib/weatherService';

export const initialChatMessages: ChatMessage[] = [
  {
    id: 'chat-welcome',
    role: 'assistant',
    text: 'Merhaba! Egzama, cilt bakımı, tetikleyiciler veya kullandığın tedaviler (Dupixent, Cibinqo, Siklosporin, Prednizon vb.) hakkında ne sormak istersin?',
    timestamp: new Date().toLocaleString('tr-TR')
  }
];

// Kronolojik Tedavi Geçmişi (en güncel en üstte): Prednizon → Siklosporin (2 Ay) → Cibinqo (1.5 Yıl) → Dupixent (5 Aydır Devam Ediyor)
export const initialTreatmentHistory: TreatmentEntry[] = [
  {
    id: 'tx-4',
    medicationName: 'Dupixent (Dupilumab)',
    drugClass: 'Biyolojik Tedavi (IL-4 / IL-13 İnhibitörü)',
    route: 'Subkütan Enjeksiyon (14 Günde Bir)',
    bodyArea: 'Sol Kol',
    startDate: 'Şubat 2026',
    endDate: null,
    durationLabel: '5 Aydır Devam Ediyor',
    status: 'Devam Ediyor',
    reasonForChange: 'Cibinqo ile kısmi yanıt sonrası hedefe yönelik biyolojik tedaviye geçildi.',
    notes: 'Enjeksiyon bölgesinde hafif reaksiyon dışında yan etki bildirilmedi.'
  },
  {
    id: 'tx-3',
    medicationName: 'Cibinqo (Abrosinib / Abrocitinib)',
    drugClass: 'JAK1 İnhibitörü (Oral Hedefe Yönelik Tedavi)',
    route: 'Oral Tablet (Günde 1 Kez)',
    bodyArea: 'Yüz & Boyun',
    startDate: 'Ağustos 2024',
    endDate: 'Şubat 2026',
    durationLabel: '1.5 Yıl (18 Ay)',
    status: 'Sonlandırıldı',
    reasonForChange: 'Uzun süreli kullanım sonrası doktor kontrolünde biyolojik tedaviye geçiş kararı alındı.',
    notes: 'Siklosporine kıyasla daha iyi tolere edildi; düzenli kan tahlili takibi yapıldı.'
  },
  {
    id: 'tx-2',
    medicationName: 'Siklosporin (Cyclosporine)',
    drugClass: 'Sistemik İmmünsüpresan (Kalsinörin İnhibitörü)',
    route: 'Oral Kapsül',
    startDate: 'Haziran 2024',
    endDate: 'Ağustos 2024',
    durationLabel: '2 Ay',
    status: 'Sonlandırıldı',
    reasonForChange: 'Böbrek fonksiyonu ve tansiyon takibi gerektirdiğinden kısa sürede oral JAK inhibitörüne geçildi.',
    notes: 'Kısa vadede etkili alevlenme kontrolü sağladı; uzun vadeli kullanım için uygun görülmedi.'
  },
  {
    id: 'tx-1',
    medicationName: 'Prednizon (Oral Kortikosteroid)',
    drugClass: 'Sistemik Kortikosteroid',
    route: 'Oral Tablet (Kısa Süreli Kür)',
    startDate: 'Öncesi (Tarih Netleştirilmedi)',
    endDate: 'Haziran 2024',
    durationLabel: 'Kısa Süreli Kürler Halinde',
    status: 'Sonlandırıldı',
    reasonForChange: 'Uzun süreli steroid kullanımının yan etki riski nedeniyle steroid koruyucu sistemik tedaviye geçildi.',
    notes: 'Akut alevlenme dönemlerinde kısa kürler halinde kullanıldı.'
  }
];

export const initialProfiles: FamilyProfile[] = [
  {
    id: 'p-1',
    name: 'Melike Doğan',
    relationship: 'Kendi Profilim',
    avatarColor: 'from-neutral-700 to-neutral-900',
    age: 25,
    eczemaType: 'Atopik Dermatit (Orta-Şiddetli)',
    primaryLocations: ['Sol Kol', 'Yüz & Boyun', 'Eller & Bilekler']
  }
];

export const initialCVHistory: CVAnalysis[] = [
  {
    id: 'cv-1',
    photoUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
    location: 'Sol Kol',
    timestamp: '27 Temmuz 2026, 09:30',
    redness: 28,
    scaling: 24,
    swelling: 5,
    crusting: 6,
    oozing: 2,
    pigmentation: 18,
    surfaceAreaCm2: 14.2,
    confidenceScore: 91,
    infectionRisk: 'Düşük',
    affectedRegions: [
      { x: 38, y: 42, radius: 14, severity: 0.4, label: 'Hafif Kızarıklık Bölgesi' },
      { x: 55, y: 60, radius: 10, severity: 0.3, label: 'Hafif Kızarıklık Bölgesi' }
    ],
    reasoning: [
      'Kızarıklık %28: kırmızı kanal, yeşil/mavi ortalamasının hafifçe üzerinde ölçüldü.',
      'Soyulma görünümü %24: orta düzey doku pürüzlülüğü tespit edildi.',
      'Etkilenen alan 14.2 cm²: karenin küçük bir bölümünde kızarıklık eşiği aşıldı.'
    ],
    notes: 'Dupixent + seramid bariyer krem kullanımının 7. gününde lezyon alanında görsel gerileme.',
    analysisMethod: 'örnek-veri'
  },
  {
    id: 'cv-2',
    photoUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
    location: 'Sol Kol',
    timestamp: '18 Temmuz 2026, 11:15',
    redness: 75,
    scaling: 62,
    swelling: 35,
    crusting: 30,
    oozing: 18,
    pigmentation: 38,
    surfaceAreaCm2: 32.0,
    confidenceScore: 88,
    infectionRisk: 'Orta',
    affectedRegions: [
      { x: 40, y: 44, radius: 20, severity: 0.9, label: 'Belirgin Eritem Bölgesi' },
      { x: 58, y: 55, radius: 16, severity: 0.75, label: 'Belirgin Eritem Bölgesi' }
    ],
    reasoning: [
      'Kızarıklık %75: geniş bir alanda güçlü kırmızı kanal baskınlığı ölçüldü.',
      'Kabuklanma %30: koyu tonlu bölgelerde belirgin kenar/kontrast geçişleri tespit edildi.',
      'Etkilenen alan 32.0 cm²: karenin büyük bölümünde kızarıklık eşiği aşıldı.'
    ],
    notes: 'Yüksek polen ve kuru rüzgar maruziyeti sonrası gelişen akut alevlenme.',
    analysisMethod: 'örnek-veri'
  },
  {
    id: 'cv-3',
    photoUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
    location: 'Yüz & Boyun',
    timestamp: '26 Temmuz 2026, 16:40',
    redness: 20,
    scaling: 16,
    swelling: 0,
    crusting: 0,
    oozing: 0,
    pigmentation: 12,
    surfaceAreaCm2: 6.8,
    confidenceScore: 95,
    infectionRisk: 'Düşük',
    affectedRegions: [
      { x: 46, y: 36, radius: 10, severity: 0.25, label: 'Hafif Kızarıklık Bölgesi' }
    ],
    reasoning: [
      'Kızarıklık %20: sınırlı bir alanda hafif kırmızı kanal baskınlığı ölçüldü.',
      'Etkilenen alan 6.8 cm²: karenin küçük bir kısmında eşik aşıldı.'
    ],
    notes: 'Boyun bölgesinde cilt bariyeri bütünüyle korundu.',
    analysisMethod: 'örnek-veri'
  }
];

export const initialSymptomEntries: SymptomEntry[] = [
  { id: 'sym-1', dateISO: '2026-07-27', timestamp: '27 Temmuz 2026, 09:00', itching: 2, pain: 1, burning: 1, dryness: 3, cracking: 1, bleeding: 0, sleepImpact: 1, note: 'İyi bir gece uykusu, kaşıntı minimal.' },
  { id: 'sym-2', dateISO: '2026-07-20', timestamp: '20 Temmuz 2026, 08:30', itching: 4, pain: 2, burning: 2, dryness: 4, cracking: 2, bleeding: 0, sleepImpact: 3 },
  { id: 'sym-3', dateISO: '2026-07-18', timestamp: '18 Temmuz 2026, 22:10', itching: 8, pain: 5, burning: 6, dryness: 7, cracking: 4, bleeding: 1, sleepImpact: 8, note: 'Alevlenme gecesi, uyuyamadım.' }
];

export const initialEnvironmental: EnvironmentalData = {
  city: DEFAULT_LOCATION.name,
  latitude: DEFAULT_LOCATION.latitude,
  longitude: DEFAULT_LOCATION.longitude,
  temperature: 26,
  humidity: 42,
  uvIndex: 6,
  windSpeed: 14,
  pressure: 1013,
  precipitationProbability: 5,
  aqi: {
    overall: 45,
    category: 'Orta',
    pm25: 18,
    pm10: 32
  },
  pollen: {
    tree: 2,
    grass: 6,
    weed: 1,
    overallRisk: 'Orta'
  },
  moldDataAvailable: false,
  forecast: [
    { day: 'Bugün', dateISO: new Date().toISOString().slice(0, 10), temp: 26, humidity: 42, uvIndex: 6, aqi: 45, pressure: 1013 },
    { day: 'Yarın', dateISO: new Date(Date.now() + 86400000).toISOString().slice(0, 10), temp: 28, humidity: 36, uvIndex: 7, aqi: 50, pressure: 1011 },
    { day: '3. Gün', dateISO: new Date(Date.now() + 172800000).toISOString().slice(0, 10), temp: 24, humidity: 55, uvIndex: 5, aqi: 38, pressure: 1015 }
  ],
  dataSource: 'yedek-veri',
  fetchedAt: new Date().toLocaleString('tr-TR')
};

export const initialScannedProducts: ProductScanResult[] = [
  {
    id: 'scan-1',
    productName: 'Atoderm Intensive Baume',
    brand: 'Bioderma Dermatologie',
    scannedAt: '27 Temmuz 2026, 11:20',
    compatibilityScore: 96,
    ratingCategory: 'Güvenli',
    flaggedCount: 0,
    scanMethod: 'metin-girişi',
    rawTextScanned: 'İçindekiler: Aqua, Glycerin, Mineral Oil, Helianthus Annuus Seed Oil, Canola Oil, Sucrose Stearate, Tocopherol, Ceramide NP, Phytosphingosine.',
    ingredients: [
      { name: 'Ceramide NP & Phytosphingosine', category: 'Seramid', riskLevel: 'Düşük', explanation: 'Cildin hücreler arası lipid yapısını güçlendirir ve nem kaybını önler.' },
      { name: 'Glycerin', category: 'Gliserin', riskLevel: 'Düşük', explanation: 'Epidermis katmanına su çeken güçlü nem bağlayıcı bileşen.' },
      { name: 'Canola & Sunflower Seed Oil', category: 'Bariyer Onarıcı', riskLevel: 'Düşük', explanation: 'Doğal esterler ile yatıştırıcı koruma sağlar.' }
    ]
  },
  {
    id: 'scan-2',
    productName: 'Narenciye Ferahlatıcı Vücut Şampuanı',
    brand: 'GlowFlora Skincare',
    scannedAt: '25 Temmuz 2026, 16:45',
    compatibilityScore: 26,
    ratingCategory: 'Önerilmez',
    flaggedCount: 4,
    scanMethod: 'metin-girişi',
    rawTextScanned: 'İçindekiler: Aqua, Sodium Lauryl Sulfate (SLS), Parfum (Fragrance), Limonene, Linalool, Methylisothiazolinone (MIT), CI 19140.',
    ingredients: [
      { name: 'Sodium Lauryl Sulfate (SLS)', category: 'SLS / Sülfat', riskLevel: 'Yüksek', explanation: 'Sert sürfaktan; cildin doğal koruyucu yağ tabakasını soyarak bariyeri zayıflatır.' },
      { name: 'Parfum (Fragrance)', category: 'Parfüm / Fragrance', riskLevel: 'Yüksek', explanation: 'Egzamalı ciltlerde kontakt dermatitin en sık nedenlerinden biridir.' },
      { name: 'Limonene & Linalool', category: 'Uçucu Yağ', riskLevel: 'Yüksek', explanation: 'Oksitlendiğinde alerjik reaksiyon riski taşıyan narenciye bileşenleri.' },
      { name: 'Methylisothiazolinone (MIT)', category: 'MIT / MCI', riskLevel: 'Yüksek', explanation: 'Şiddetli kontakt hassasiyeti oluşturabilen sentetik koruyucu.' }
    ]
  }
];

export const initialTriggerEntries: TriggerEntry[] = [
  { id: 'trig-1', name: 'Eski Kars Peyniri', category: 'Gıda', dateISO: '2026-07-26', severity: 6, reasonNote: 'Yedikten yaklaşık 12 saat sonra sol kolumda kaşıntı belirgin arttı.' },
  { id: 'trig-2', name: 'Yeni Çamaşır Deterjanı', category: 'Ürün', dateISO: '2026-07-15', severity: 4, reasonNote: 'Deterjan değiştirdikten sonraki hafta boyunca giysi temas bölgelerinde kızarıklık oldu.' }
];

export const initialFoodItems: FoodItem[] = [
  { id: 'food-1', name: 'Yumurta', rating: 'Güvenli', timesLogged: 5, lastLoggedISO: '2026-07-27' },
  { id: 'food-2', name: 'Domates', rating: 'Bazen Sorunlu', timesLogged: 3, lastLoggedISO: '2026-07-22', notes: 'Bazen yedikten sonra hafif kızarıklık oluyor, her zaman değil.' },
  { id: 'food-3', name: 'Yer Fıstığı', rating: 'Her Zaman Tetikliyor', timesLogged: 2, lastLoggedISO: '2026-06-10', notes: 'İkisinde de belirgin kaşıntı ve kızarıklık oldu.' }
];

export const initialMeals: Meal[] = [
  { id: 'meal-1', name: 'Kahvaltı', dateISO: '2026-07-27', foodNames: ['Yumurta', 'Tam Tahıllı Ekmek', 'Zeytin'], reactionSeverity: 0 },
  { id: 'meal-2', name: 'Akşam Yemeği', dateISO: '2026-07-22', foodNames: ['Domates Salatası', 'Izgara Tavuk'], reactionSeverity: 3, reactionNote: 'Yemekten birkaç saat sonra hafif kaşıntı.' }
];

export const initialRecipes: Recipe[] = [
  { id: 'recipe-1', name: 'Zeytinyağlı Sebze Çorbası', ingredients: ['Havuç', 'Kabak', 'Soğan', 'Zeytinyağı', 'Tuz'], notes: 'Genellikle iyi tolere ediyorum.' }
];

export const initialRoutines: RoutineTask[] = [
  { id: 'r-1', title: 'Seramidli Bariyer Krem Uygulaması (Tüm Vücut)', timeOfDay: 'Sabah', completed: true, category: 'Nemlendirici', order: 0 },
  { id: 'r-2', title: 'Sabah Biyolojik / Antihistaminik Tedavisi', timeOfDay: 'Sabah', completed: true, category: 'İlaç / Krem', order: 1 },
  { id: 'r-3', title: 'Öğle Cilt Nem Kontrolü & El Nemlendirme', timeOfDay: 'Öğle', completed: false, category: 'Nemlendirici', order: 0 },
  { id: 'r-4', title: '500 ml Su İçilmesi', timeOfDay: 'Öğle', completed: true, category: 'Su Tüketimi', order: 1 },
  { id: 'r-5', title: 'Ilık Banyo (Maksimum 10–12 Dakika)', timeOfDay: 'Akşam', completed: false, category: 'Banyo', durationMinutes: 10, order: 0 },
  { id: 'r-6', title: 'Alevlenme Bölgelerine Takrolimus Merhem', timeOfDay: 'Akşam', completed: false, category: 'İlaç / Krem', order: 1 },
  { id: 'r-7', title: '5 Dakika Diyafram Nefesi (Stres Azaltma)', timeOfDay: 'Gece', completed: false, category: 'Stres Yönetimi', order: 0 },
  { id: 'r-8', title: 'Gece Yoğun Bakım Merhemi & Pamuklu Eldiven', timeOfDay: 'Gece', completed: false, category: 'Uyku Hazırlığı', order: 1 }
];

export const initialCalendarEvents: CalendarEvent[] = [
  { id: 'cal-1', dateISO: '2026-07-27', type: 'photo', title: 'Sol Kol fotoğraf taraması', description: 'Etkilenen alan: 14.2 cm²' },
  { id: 'cal-2', dateISO: '2026-07-20', type: 'injection', title: 'Dupixent Enjeksiyonu', description: '14 günlük idame dozu' },
  { id: 'cal-3', dateISO: '2026-07-18', type: 'flare', title: 'Orta Şiddetli Alevlenme', description: 'Yüksek polen sonrası sol kolda alevlenme' },
  { id: 'cal-4', dateISO: '2026-07-06', type: 'injection', title: 'Dupixent Enjeksiyonu', description: '14 günlük idame dozu' },
  { id: 'cal-5', dateISO: '2026-06-30', type: 'note', title: 'Genel Not', description: 'Yeni nemlendirici denenmeye başlandı (Atoderm Intensive Baume)' }
];

export const initialJournalEntries: JournalEntry[] = [
  { id: 'j-1', category: 'Alerji', title: 'Ağaç Poleni', content: 'İlkbahar/yaz aylarında ağaç poleni yoğunluğu arttığında kaşıntı ve kızarıklıkta artış gözlendi.', date: 'Mayıs 2025', severity: 'Orta' },
  { id: 'j-2', category: 'Tıbbi Geçmiş', title: 'Tanı Süreci', content: 'Çocukluktan beri devam eden atopik dermatit; yetişkinlikte orta-şiddetli seyre ilerledi.', date: '2020' },
  { id: 'j-3', category: 'Doktor Notu', title: 'Son Kontrol Özeti', content: 'Dupixent tedavisine yanıt olumlu; bir sonraki kontrolde kan tahlili tekrarlanacak.', date: 'Temmuz 2026' },
  { id: 'j-4', category: 'Kişisel Not', title: 'Gözlem', content: 'Yeterli uyku alınan günlerde ertesi gün kaşıntı belirgin şekilde azalıyor.', date: 'Temmuz 2026' }
];

export const initialAuditLogs: AuditLogEntry[] = [
  { id: 'log-2', timestamp: '27 Temmuz 2026, 14:30', action: 'Görsel Analiz', details: 'Sol Kol fotoğraf analizi tamamlandı. Etkilenen Alan: 14.2 cm²' },
  { id: 'log-3', timestamp: '27 Temmuz 2026, 11:20', action: 'İçerik OCR Taraması', details: 'Bioderma Atoderm ürünü için OCR analizi tamamlandı. Uyum Skoru: %96' }
];
