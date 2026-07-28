import type {
  CVAnalysis,
  EnvironmentalData,
  FlareScoreData,
  ProductScanResult,
  FoodLogItem,
  FoodCatalogItem,
  SymptomCorrelation,
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
    startDate: 'Şubat 2026',
    endDate: null,
    durationLabel: '5 Aydır Devam Ediyor',
    status: 'Devam Ediyor',
    reasonForChange: 'Cibinqo ile kısmi yanıt sonrası hedefe yönelik biyolojik tedaviye geçildi.',
    notes: 'Enjeksiyon bölgesinde hafif reaksiyon dışında yan etki bildirilmedi. İyileşme skorunda istikrarlı artış gözleniyor.'
  },
  {
    id: 'tx-3',
    medicationName: 'Cibinqo (Abrosinib / Abrocitinib)',
    drugClass: 'JAK1 İnhibitörü (Oral Hedefe Yönelik Tedavi)',
    route: 'Oral Tablet (Günde 1 Kez)',
    startDate: 'Ağustos 2024',
    endDate: 'Şubat 2026',
    durationLabel: '1.5 Yıl (18 Ay)',
    status: 'Sonlandırıldı',
    reasonForChange: 'Uzun süreli kullanım sonrası doktor kontrolünde biyolojik tedaviye geçiş kararı alındı.',
    notes: 'Siklosporine kıyasla daha iyi tolere edildi; düzenli kan tahlili (lipid profili, tam kan sayımı) takibi yapıldı.'
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
    reasonForChange: 'Uzun süreli steroid kullanımının yan etki riski nedeniyle steroid koruyucu (steroid-sparing) sistemik tedaviye geçildi.',
    notes: 'Akut alevlenme dönemlerinde kısa kürler halinde kullanıldı; sürdürülebilir bir idame tedavisi olmadığı için sistemik alternatiflere yönlenildi.'
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
    dryness: 35,
    scaling: 20,
    cracking: 10,
    oozing: 2,
    swelling: 5,
    pigmentation: 18,
    surfaceAreaCm2: 14.2,
    scoradIndex: 22.4,
    healingProgression: 52,
    confidenceScore: 91,
    infectionRisk: 'Düşük',
    affectedRegions: [
      { x: 38, y: 42, radius: 14, severity: 0.4, label: 'Hafif Kızarıklık Bölgesi' },
      { x: 55, y: 60, radius: 10, severity: 0.3, label: 'Kuruluk Bölgesi' }
    ],
    notes: 'Dupixent + seramid bariyer krem kullanımının 7. gününde lezyon alanında belirgin gerileme ve kaşıntı azalması.',
    analysisMethod: 'simüle'
  },
  {
    id: 'cv-2',
    photoUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
    location: 'Sol Kol',
    timestamp: '18 Temmuz 2026, 11:15',
    redness: 75,
    dryness: 82,
    scaling: 68,
    cracking: 42,
    oozing: 18,
    swelling: 35,
    pigmentation: 38,
    surfaceAreaCm2: 32.0,
    scoradIndex: 58.6,
    healingProgression: 0,
    confidenceScore: 88,
    infectionRisk: 'Orta',
    affectedRegions: [
      { x: 40, y: 44, radius: 20, severity: 0.9, label: 'Belirgin Eritem Bölgesi' },
      { x: 58, y: 55, radius: 16, severity: 0.75, label: 'Derin Çatlama ve Soyulma Bölgesi' }
    ],
    notes: 'Yüksek polen ve kuru rüzgar maruziyeti sonrası gelişen akut alevlenme.',
    analysisMethod: 'simüle'
  },
  {
    id: 'cv-3',
    photoUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
    location: 'Yüz & Boyun',
    timestamp: '26 Temmuz 2026, 16:40',
    redness: 20,
    dryness: 25,
    scaling: 12,
    cracking: 0,
    oozing: 0,
    swelling: 0,
    pigmentation: 12,
    surfaceAreaCm2: 6.8,
    scoradIndex: 14.1,
    healingProgression: 70,
    confidenceScore: 95,
    infectionRisk: 'Düşük',
    affectedRegions: [
      { x: 46, y: 36, radius: 10, severity: 0.25, label: 'Hafif Kuruluk Alanı' }
    ],
    notes: 'Boyun bölgesinde cilt bariyeri bütünüyle korundu, kızarıklık geriledi.',
    analysisMethod: 'simüle'
  }
];

export const initialFlareScore: FlareScoreData = {
  currentScore: 22,
  severityLevel: 'Hafif',
  previousScore: 28,
  weeklyTrend: [45, 40, 36, 32, 28, 25, 22],
  monthlyTrend: [58, 52, 46, 40, 34, 28, 22],
  factors: {
    itching: { weight: 18, score: 24, impact: 'positive', text: 'Son 3 gündür kaşıntı seviyesi 10 üzerinden ortalama 2.1' },
    dryness: { weight: 14, score: 30, impact: 'positive', text: 'Düzenli nemlendirme ile kuruluk hissi azaldı' },
    redness: { weight: 14, score: 22, impact: 'positive', text: 'Görsel analizde kızarıklıkta %52 azalma tespit edildi' },
    sleepQuality: { weight: 10, score: 18, impact: 'positive', text: 'Ortalama 7.8 saat deliksiz uyku (gece kaşıntısı yok)' },
    moisturizerUsage: { weight: 12, score: 15, impact: 'positive', text: 'Günde ortalama 3.6 kez seramidli bariyer krem uygulandı' },
    medicationAdherence: { weight: 12, score: 8, impact: 'positive', text: 'Dupixent ve reçeteli topikal tedaviye %100 uyum' },
    weather: { weight: 8, score: 48, impact: 'negative', text: 'Bahçelievler bölgesinde düşük nem ve yüksek ağaç poleni' },
    stress: { weight: 6, score: 40, impact: 'neutral', text: 'Hafta ortası orta düzey iş stresi kaydedildi' },
    diet: { weight: 6, score: 20, impact: 'positive', text: 'Yüksek histaminli gıda tüketimi bu hafta düşük seyretti' }
  }
};

export const initialEnvironmental: EnvironmentalData = {
  city: DEFAULT_LOCATION.name,
  latitude: DEFAULT_LOCATION.latitude,
  longitude: DEFAULT_LOCATION.longitude,
  temperature: 26,
  humidity: 42,
  uvIndex: 6,
  windSpeed: 14,
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
  forecast72h: [
    { day: 'Bugün', dateISO: new Date().toISOString().slice(0, 10), temp: 26, humidity: 42, uvIndex: 6, aqi: 45, flareRisk: 32, primaryDriver: 'Düşük Nem' },
    { day: 'Yarın', dateISO: new Date(Date.now() + 86400000).toISOString().slice(0, 10), temp: 28, humidity: 36, uvIndex: 7, aqi: 50, flareRisk: 44, primaryDriver: 'Düşük Nem & Kuru Hava' },
    { day: '3. Gün', dateISO: new Date(Date.now() + 172800000).toISOString().slice(0, 10), temp: 24, humidity: 55, uvIndex: 5, aqi: 38, flareRisk: 20, primaryDriver: 'Dengeli Koşullar' }
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

export const initialFoodLogs: FoodLogItem[] = [
  { id: 'f-1', name: 'Eski Kars Peyniri & Şarküteri Sucuk', category: 'Yüksek Histaminli', timestamp: '26 Temmuz 2026, 19:30', histamineLevel: 'Yüksek', possibleFlareLink: '12 saat sonra +2 kaşıntı artışı ile eşleşti' },
  { id: 'f-2', name: 'Zeytinyağlı Ev Yapımı Sebze Çorbası', category: 'Güvenli / Anti-Enflamatuar', timestamp: '27 Temmuz 2026, 08:30', histamineLevel: 'Düşük' },
  { id: 'f-3', name: 'Fırınlanmış Somon Balığı & Haşlanmış Brokoli', category: 'Güvenli / Anti-Enflamatuar', timestamp: '27 Temmuz 2026, 13:00', histamineLevel: 'Düşük' }
];

export const initialCorrelations: SymptomCorrelation[] = [
  { foodName: 'Eski / Olgunlaşmış Peynirler', lagHours: 12, symptomIncrease: 3.4, confidence: 89 },
  { foodName: 'Şarküteri & Nitratlı Etler', lagHours: 18, symptomIncrease: 4.2, confidence: 93 },
  { foodName: 'Sentetik Renklendiricili Atıştırmalıklar', lagHours: 24, symptomIncrease: 2.9, confidence: 81 }
];

export const initialFoodCatalog: FoodCatalogItem[] = [
  { id: 'fc-1', name: 'Fast Food', group: 'Tetikleyici Olabilir', flareRisk: 78, rationale: 'Yüksek doymuş yağ ve rafine karbonhidrat içeriği sistemik enflamasyonu artırabilir.', recommendation: 'Tüketimi sınırlayın; belirtilerinizle ilişkisini Beslenme Günlüğü ile takip edin.' },
  { id: 'fc-2', name: 'Şekerli Gıdalar', group: 'Tetikleyici Olabilir', flareRisk: 70, rationale: 'Yüksek glisemik indeks, ileri glikasyon son ürünleri (AGE) yoluyla kolajen ve cilt bariyerini olumsuz etkileyebilir.', recommendation: 'Rafine şeker yerine düşük glisemik alternatifleri tercih edin.' },
  { id: 'fc-3', name: 'Çikolata', group: 'Tetikleyici Olabilir', flareRisk: 55, rationale: 'Bazı bireylerde kakao içeriğindeki bileşikler histamin salınımını tetikleyebilir.', recommendation: 'Bireysel toleransınızı gözlemleyin; herkeste aynı etkiyi yapmaz.' },
  { id: 'fc-4', name: 'Gazlı İçecekler (Soda)', group: 'Tetikleyici Olabilir', flareRisk: 60, rationale: 'Yüksek şeker ve fosforik asit içeriği enflamatuar yükü artırabilir.', recommendation: 'Su veya bitki çayları ile değiştirin.' },
  { id: 'fc-5', name: 'Yoğun İşlenmiş Gıdalar', group: 'Tetikleyici Olabilir', flareRisk: 72, rationale: 'Katkı maddeleri, koruyucular ve yapay boyalar hassas bireylerde tetikleyici olabilir.', recommendation: 'Etiketleri kontrol edin; taze/az işlenmiş alternatifleri tercih edin.' },
  { id: 'fc-6', name: 'Baharatlı Yiyecekler', group: 'Tetikleyici Olabilir', flareRisk: 48, rationale: 'Kapsaisin gibi bileşikler bazı kişilerde terlemeyi ve yüzeysel kızarıklığı artırabilir.', recommendation: 'Şiddetli alevlenme dönemlerinde tüketimi azaltmayı deneyin.' },
  { id: 'fc-7', name: 'Alkol', group: 'Tetikleyici Olabilir', flareRisk: 65, rationale: 'Vazodilatasyon (damar genişlemesi) yoluyla kızarıklığı ve kaşıntıyı artırabilir, uyku kalitesini bozabilir.', recommendation: 'Tüketimi sınırlayın, özellikle alevlenme dönemlerinde kaçının.' },
  { id: 'fc-8', name: 'Enerji İçecekleri', group: 'Tetikleyici Olabilir', flareRisk: 58, rationale: 'Yüksek kafein ve şeker kombinasyonu stres hormonlarını ve enflamasyonu artırabilir.', recommendation: 'Doğal enerji kaynaklarını (yeterli uyku, dengeli beslenme) tercih edin.' },
  { id: 'fc-9', name: 'Somon', group: 'Cilt Dostu', benefit: 'Omega-3 yağ asitleri (EPA/DHA) enflamasyonu azaltmaya ve cilt bariyerini desteklemeye yardımcı olabilir.', rationale: 'Klinik çalışmalarda omega-3 alımının cilt bariyer fonksiyonunu desteklediği gösterilmiştir.', recommendation: 'Haftada 2-3 porsiyon yağlı balık tüketimi önerilir.' },
  { id: 'fc-10', name: 'Omega-3 Kaynağı Gıdalar (Ceviz, Keten Tohumu)', group: 'Cilt Dostu', benefit: 'Anti-enflamatuar yağ asitleri sağlar.', rationale: 'Omega-3/omega-6 dengesi, vücuttaki genel enflamatuar yükü etkileyebilir.', recommendation: 'Günlük beslenmeye bir avuç ceviz veya 1 yemek kaşığı keten tohumu eklenebilir.' },
  { id: 'fc-11', name: 'Yoğurt', group: 'Cilt Dostu', benefit: 'Probiyotikler bağırsak-cilt eksenini destekleyerek bağışıklık dengesine katkı sağlayabilir.', rationale: 'Bazı araştırmalar bağırsak mikrobiyotası ile atopik dermatit şiddeti arasında ilişki olduğunu öne sürmektedir.', recommendation: 'Şekersiz, doğal yoğurt tercih edilmelidir.' },
  { id: 'fc-12', name: 'Kefir', group: 'Cilt Dostu', benefit: 'Zengin probiyotik çeşitliliği bağırsak sağlığını destekler.', rationale: 'Fermente süt ürünleri mikrobiyota çeşitliliğini artırabilir.', recommendation: 'Günlük rutine küçük bir porsiyon eklenebilir.' },
  { id: 'fc-13', name: 'Ceviz', group: 'Cilt Dostu', benefit: 'Omega-3, E vitamini ve çinko içeriğiyle cilt bariyerini destekler.', rationale: 'E vitamini antioksidan etkisiyle oksidatif stresi azaltabilir.', recommendation: 'Günde bir avuç (yaklaşık 30g) tüketim yeterlidir.' },
  { id: 'fc-14', name: 'Avokado', group: 'Cilt Dostu', benefit: 'Sağlıklı tekli doymamış yağlar ve E vitamini cilt nemini destekler.', rationale: 'İçerdiği karotenoidler ve yağ asitleri cilt bariyer lipidlerine katkıda bulunabilir.', recommendation: 'Salata veya ana öğünlere eklenebilir.' },
  { id: 'fc-15', name: 'Yumurta', group: 'Cilt Dostu', benefit: 'Yüksek kaliteli protein ve biotin cilt onarımını destekler.', rationale: 'Protein, yeni cilt hücrelerinin (keratinosit) yapımı için temel yapı taşıdır.', recommendation: 'Bilinen bir yumurta alerjisi yoksa dengeli beslenmenin bir parçası olabilir.' },
  { id: 'fc-16', name: 'Yeşil Yapraklı Sebzeler', group: 'Cilt Dostu', benefit: 'Antioksidanlar (A, C, E vitamini) oksidatif stresi azaltmaya yardımcı olabilir.', rationale: 'Antioksidan açısından zengin beslenme genel enflamasyon yükünü azaltabilir.', recommendation: 'Her öğünde bir porsiyon sebze tüketimi hedeflenebilir.' }
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
  { id: 'cal-1', dateISO: '2026-07-27', type: 'photo', title: 'Sol Kol fotoğraf taraması', description: 'SCORAD 22.4, %52 iyileşme' },
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
  { id: 'log-1', timestamp: '27 Temmuz 2026, 17:15', action: 'Sağlık Verisi Eşleşmesi', details: 'Apple Health / Google HealthKit senkronizasyonu tamamlandı: 8.420 adım, 7.8 saat uyku', ipAddress: '127.0.0.1 (Şifreli Oturum)' },
  { id: 'log-2', timestamp: '27 Temmuz 2026, 14:30', action: 'Görsel Yapay Zeka Taraması', details: 'Sol Kol fotoğraf analizi tamamlandı. SCORAD: 22.4, Lezyon Alanı: 14.2 cm²', ipAddress: '127.0.0.1 (Şifreli Oturum)' },
  { id: 'log-3', timestamp: '27 Temmuz 2026, 11:20', action: 'İçerik OCR Taraması', details: 'Bioderma Atoderm ürünü için OCR analizi tamamlandı. Uyum Skoru: %96', ipAddress: '127.0.0.1 (Şifreli Oturum)' }
];
