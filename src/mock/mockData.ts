import type { CVAnalysis, EnvironmentalData, HealingScoreData, ProductScanResult, FoodLogItem, SymptomCorrelation, RoutineTask, KnowledgeArticle, FamilyProfile, AuditLogEntry, TreatmentEntry } from '../types';

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
    name: 'Can Yılmaz',
    relationship: 'Kendi Profilim',
    avatarColor: 'from-sky-500 to-indigo-600',
    age: 29,
    eczemaType: 'Atopik Dermatit (Yetişkin)',
    primaryLocations: ['Sol Kol', 'Yüz & Boyun', 'Eller & Bilekler']
  },
  {
    id: 'p-2',
    name: 'Ali Yılmaz',
    relationship: 'Çocuğum',
    avatarColor: 'from-amber-400 to-emerald-500',
    age: 4,
    eczemaType: 'Pediatrik Atopik Egzama',
    primaryLocations: ['Yüz & Boyun', 'Sağ Kol']
  },
  {
    id: 'p-3',
    name: 'Ayşe Yılmaz',
    relationship: 'Ebeveynim',
    avatarColor: 'from-purple-500 to-pink-500',
    age: 68,
    eczemaType: 'Kontakt & Dishidrotik Egzama',
    primaryLocations: ['Eller & Bilekler', 'Bacaklar']
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
    swelling: 5,
    pigmentation: 18,
    surfaceAreaCm2: 14.2,
    scoradIndex: 22.4, // Hafif-Orta SCORAD
    healingProgression: 52, // Baseline'a göre %52 iyileşme
    confidenceScore: 97,
    heatMapData: [
      { x: 35, y: 40, intensity: 0.7, label: 'Eritem (Kızarıklık) Azalma Bölgesi' },
      { x: 50, y: 60, intensity: 0.4, label: 'Kserozis (Kuruluk) Bölgesi' }
    ],
    notes: 'Dupixent + Seramid bariyer krem kullanımının 7. gününde lezyon alanında belirgin gerileme ve kaşıntı azalması.'
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
    swelling: 35,
    pigmentation: 38,
    surfaceAreaCm2: 32.0,
    scoradIndex: 58.6, // Şiddetli Alevlenme
    healingProgression: 0, // Başlangıç baseline
    confidenceScore: 95,
    heatMapData: [
      { x: 38, y: 42, intensity: 0.95, label: 'Akut Enflamatuar Alevlenme Odak Noktası' },
      { x: 52, y: 58, intensity: 0.85, label: 'Derin Çatlama ve Soyulma Bölgesi' }
    ],
    notes: 'Yüksek polen ve kuru rüzgar maruziyeti sonrası gelişen akut alevlenme.'
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
    swelling: 0,
    pigmentation: 12,
    surfaceAreaCm2: 6.8,
    scoradIndex: 14.1,
    healingProgression: 70,
    confidenceScore: 98,
    heatMapData: [
      { x: 45, y: 35, intensity: 0.3, label: 'Hafif Kuruluk Alanı' }
    ],
    notes: 'Boyun bölgesinde cilt bariyeri bütünüyle korundu, kızarıklık geriledi.'
  }
];

export const initialHealingScore: HealingScoreData = {
  currentScore: 86,
  previousScore: 80,
  weeklyTrend: [68, 72, 75, 78, 82, 84, 86],
  monthlyTrend: [55, 62, 68, 74, 78, 82, 86],
  recoveryVelocity: 5.2, // +5.2 puan / hafta
  healingStreakDays: 16,
  riskScore: 14, // %14 Düşük risk
  habitFactors: {
    flareSeverity: { weight: 20, score: 88, impact: 'positive', text: 'Aktif enflamasyonda %48 azalma kaydedildi' },
    photoTrend: { weight: 15, score: 92, impact: 'positive', text: 'Görsel yapay zeka analizinde lezyon alanında %52 küçülme' },
    medicationAdherence: { weight: 15, score: 100, impact: 'positive', text: 'Reçeteli Dupixent ve Takrolimus kullanımına %100 uyum' },
    moisturizerConsistency: { weight: 15, score: 94, impact: 'positive', text: 'Günde ortalama 3.6 kez seramidli bariyer krem uygulandı' },
    sleepQuality: { weight: 10, score: 82, impact: 'positive', text: 'Ortalama 7.8 saat deliksiz uyku (gece kaşıntısı yok)' },
    stressLevel: { weight: 10, score: 72, impact: 'neutral', text: 'Hafta ortası orta düzey iş stresi kaydedildi' },
    waterIntake: { weight: 8, score: 90, impact: 'positive', text: 'Günlük 2.5 Litre su içme hedefi tamamlandı' },
    loggedTriggers: { weight: 7, score: 68, impact: 'negative', text: 'Ortamda yüksek ağaç poleni yoğunluğu saptandı' }
  }
};

export const initialEnvironmental: EnvironmentalData = {
  city: 'İstanbul / Kadıköy',
  temperature: 24,
  humidity: 52, // Dengeli nem
  uvIndex: 5,
  windSpeed: 12,
  aqi: {
    overall: 38,
    category: 'İyi',
    pm25: 7.2,
    pm10: 14.5,
    ozone: 24,
    no2: 10
  },
  pollen: {
    tree: 'Yüksek',
    grass: 'Orta',
    weed: 'Düşük',
    overallRisk: 'Orta'
  },
  forecast72h: [
    { day: 'Bugün', temp: 24, humidity: 52, flareRisk: 18, primaryDriver: 'Yüksek Ağaç Poleni' },
    { day: 'Yarın', temp: 27, humidity: 38, flareRisk: 44, primaryDriver: 'Düşük Nem & Kuru Rüzgar' },
    { day: '3. Gün', temp: 22, humidity: 65, flareRisk: 12, primaryDriver: 'Nem Oranı Dengeli' }
  ]
};

export const initialScannedProducts: ProductScanResult[] = [
  {
    id: 'scan-1',
    productName: 'Atoderm Intensive Baume',
    brand: 'Bioderma Dermatologie',
    scannedAt: '27 Temmuz 2026, 11:20',
    compatibilityScore: 98,
    ratingCategory: 'Mükemmel Uyumlu',
    flaggedCount: 0,
    rawTextScanned: 'İçindekiler: Aqua, Glycerin, Mineral Oil, Helianthus Annuus Seed Oil, Canola Oil, Sucrose Stearate, Tocopherol, Ceramide NP, Phytosphingosine.',
    ingredients: [
      { name: 'Ceramide NP & Phytosphingosine', category: 'Güvenli (Bariyer Onarıcı)', riskLevel: 'Düşük', explanation: 'Cildin hücreler arası lipid yapısını güçlendirir ve nem kaybını önler.' },
      { name: 'Glycerin', category: 'Güvenli (Bariyer Onarıcı)', riskLevel: 'Düşük', explanation: 'Epidermis katmanına su çeken güçlü nem bağlayıcı bileşen.' },
      { name: 'Canola & Sunflower Seed Oil', category: 'Güvenli (Bariyer Onarıcı)', riskLevel: 'Düşük', explanation: 'Doğal Esterler ile yatıştırıcı koruma sağlar.' }
    ]
  },
  {
    id: 'scan-2',
    productName: 'Narenciye Ferahlatıcı Vücut Şampuanı',
    brand: 'GlowFlora Skincare',
    scannedAt: '25 Temmuz 2026, 16:45',
    compatibilityScore: 28,
    ratingCategory: 'Yüksek Tahriş Riski',
    flaggedCount: 4,
    rawTextScanned: 'İçindekiler: Aqua, Sodium Lauryl Sulfate (SLS), Parfum (Fragrance), Limonene, Linalool, Methylisothiazolinone (MIT), CI 19140.',
    ingredients: [
      { name: 'Sodium Lauryl Sulfate (SLS)', category: 'Tahriş Edici (İrritan)', riskLevel: 'Yüksek', explanation: 'Sert sürfaktan; cildin doğal koruyucu yağ tabakasını soyarak egzamayı tetikler.' },
      { name: 'Parfum (Fragrance / Sentetik Esans)', category: 'Sentetik Parfüm', riskLevel: 'Yüksek', explanation: 'Egzamalı ciltlerde kontakt dermatitin 1 numaralı nedenidir.' },
      { name: 'Limonene & Linalool', category: 'Alerjen Riskli', riskLevel: 'Yüksek', explanation: 'Oksitlendiğinde ciddi alerjik reaksiyon oluşturan narenciye bileşenleri.' },
      { name: 'Methylisothiazolinone (MIT)', category: 'Koruyucu (Korozif)', riskLevel: 'Yüksek', explanation: 'Şiddetli hassasiyet oluşturan sentetik koruyucu kimyasal.' }
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

export const initialRoutines: RoutineTask[] = [
  { id: 'r-1', title: 'Seramidli Bariyer Krem Uygulaması (Tüm Vücut)', timeOfDay: 'Sabah', completed: true, category: 'Nemlendirici' },
  { id: 'r-2', title: 'Sabah Biyolojik / Antihistaminik Tedavisi', timeOfDay: 'Sabah', completed: true, category: 'İlaç / Krem' },
  { id: 'r-3', title: 'Öğle Cilt Nem Kontrolü & El Nemlendirme', timeOfDay: 'Öğle', completed: false, category: 'Nemlendirici' },
  { id: 'r-4', title: '500 ml Alkali Filtrelenmiş Su İçilmesi', timeOfDay: 'Öğle', completed: true, category: 'Su Tüketimi' },
  { id: 'r-5', title: 'Ilık Banyo (Maksimum 10–12 Dakika)', timeOfDay: 'Akşam', completed: false, category: 'Banyo', durationMinutes: 10 },
  { id: 'r-6', title: 'Alevlenme Bölgelerine Takrolimus Merhem', timeOfDay: 'Akşam', completed: false, category: 'İlaç / Krem' },
  { id: 'r-7', title: '5 Dakika Diyafram Nefesi (Stres Azaltma)', timeOfDay: 'Gece', completed: false, category: 'Stres Yönetimi' },
  { id: 'r-8', title: 'Gece Yoğun Bakım Merhemi & Pamuklu Eldiven', timeOfDay: 'Gece', completed: false, category: 'Uyku Hazırlığı' }
];

export const initialKnowledgeArticles: KnowledgeArticle[] = [
  {
    id: 'kb-1',
    title: 'Dupilumab (Dupixent): Çift Etkili IL-4/IL-13 İnhibitörü Biyolojik Tedavi',
    category: 'İlaçlar & Biyolojikler',
    summary: 'Dupixent tedavisinin etki mekanizması, klinik EASI-75 başarı oranları ve doz takvimi.',
    evidenceLevel: 'FDA Onaylı Biyolojik',
    content: `Dupilumab (Dupixent), atopik dermatitte sistemik enflamasyon ve kaşıntıyı tetikleyen interlökin-4 (IL-4) ve interlökin-13 (IL-13) sitokin sinyallerini hedef alarak bloke eden insan monoklonal antikorudur.

Klinik çalışmalarda (SOLO 1 & 2), hastaların %70'inden fazlasının 16. haftada EASI-75 (Egzama Alanı ve Şiddet İndeksinde %75 iyileşme) başarısına ulaştığı gösterilmiştir. Geleneksel bağışıklık baskılayıcıların aksine organ toksisitesi riski düşüktür.

**Kritik Bilgiler**:
- 14 günde bir deri altı (subkütan) enjeksiyon şeklinde uygulanır.
- En sık görülen hafif yan etki konjonktivit (göz kuruluğu/kızarıklığı) ve enjeksiyon yeri reaksiyonudur.
- Alevlenme dönemlerinde topikal kortizon veya takrolimus merhemler ile kombine edilebilir.`,
    keyTakeaways: [
      'Kök tip-2 enflamasyon sitokinlerini (IL-4 & IL-13) hedefler',
      '14 günde bir deri altı enjeksiyon olarak uygulanır',
      'Organ yükü düşük, yüksek güvenlik profiline sahiptir'
    ],
    tags: ['Biyolojik Tedavi', 'Dupixent', 'Atopik Dermatit', 'Kök Tedavi']
  },
  {
    id: 'kb-2',
    title: 'Proaktif vs Reaktif Tedavi: Kortizon ve Kalsinörin İnhibitörleri',
    category: 'Topikal Tedaviler',
    summary: 'Haftada 2 gün idame uygulamasının tekrarlayan alevlenmeleri önlemedeki klinik kanıtları.',
    evidenceLevel: 'Klinik Standart Tedavi',
    content: `Proaktif tedavi, lezyonlar klinik olarak iyileşmiş görünse bile haftada 2 gün önceden tutulum gösteren bölgelere kalsinörin inhibitörleri (Takrolimus %0.1 / Pimekrolimus) veya orta etkili kortizonlu kremler uygulanması esasına dayanır.

Araştırmalar, proaktif idame tedavisinin yıllık alevlenme sıklığını %70 oranında azalttığını ve toplam kortizon kullanım miktarını düşürdüğünü kanıtlamıştır.

**Parmak Boğumu Birimi (FTU) Kuralı**:
Bir FTU (yetişkin işaret parmağının ucundan ilk boğuma kadar sıkılan krem miktarı, yaklaşık 0.5 gram), iki yetişkin avuç içi büyüklüğündeki alanı tedavi etmeye yeterlidir.`,
    keyTakeaways: [
      'Haftada 2 gün proaktif uygulama görünmeyen alt enflamasyonu baskılar',
      'Parmak Boğumu Birimi (FTU) kuralı ile doğru dozajlama sağlanır',
      'Kalsinörin inhibitörleri (Takrolimus) ciltte incelme (atrofi) riski oluşturmaz'
    ],
    tags: ['Topikal Kortizon', 'Takrolimus', 'Proaktif Tedavi', 'FTU Dozajı']
  },
  {
    id: 'kb-3',
    title: 'Islak Sargı Tedavisi (Wet Wrap Therapy): Akut Alevlenme Kurtarma Protokolü',
    category: 'Topikal Tedaviler',
    summary: 'Şiddetli ve dirençli egzamalarda saatler içinde kaşıntıyı dindiren yoğun bariyer nemlendirme protokolü.',
    evidenceLevel: 'Klinik Standart Tedavi',
    content: `Islak Sargı Tedavisi (WWT), akut, yaygın veya tedaviye dirençli alevlenmelerde uygulanan yoğun nemlendirme yöntemidir. Epidermisi derinlemesine nemlendirir, topikal kremlerin emilimini kat kat artırır ve buharlaşma soğutması sağlayarak kaşıntı sinir sinyallerini yatıştırır.

**Uygulama Adımları**:
1. 15 dakika Ilık banyoda beklenir (pat dry ile kurulama yapılır).
2. Hekimin önerdiği tedavi edici krem lezyonlara, seramidli yoğun nemlendirici tüm cilde sürülür.
3. Ilık suyla ıslatılıp sıkılmış pamuklu iç katman giydirilir.
4. Üzerine kuru dış giysi katmanı eklenir.
5. 2 ila 8 saat veya gece boyunca ciltte bekletilir.`,
    keyTakeaways: [
      'Sağladığı serinlik ile kaşıntı-kazıma döngüsünü anında kırar',
      'Cilt bariyerinin nem tutma kapasitesini hızla yükseltir',
      'Şiddetli alevlenme dönemlerinde hekim kontrolünde uygulanır'
    ],
    tags: ['Islak Sargı', 'Akut Alevlenme', 'Yoğun Nemlendirme']
  }
];

export const initialAuditLogs: AuditLogEntry[] = [
  { id: 'log-1', timestamp: '27 Temmuz 2026, 17:15', action: 'Sağlık Verisi Eşleşmesi', details: 'Apple Health / Google HealthKit senkronizasyonu tamamlandı: 8.420 adım, 7.8 saat uyku', ipAddress: '127.0.0.1 (Şifreli Oturum)' },
  { id: 'log-2', timestamp: '27 Temmuz 2026, 14:30', action: 'Görsel Yapay Zeka Taraması', details: 'Sol Kol fotoğraf analizi tamamlandı. SCORAD: 22.4, Lezyon Alanı: 14.2 cm²', ipAddress: '127.0.0.1 (Şifreli Oturum)' },
  { id: 'log-3', timestamp: '27 Temmuz 2026, 11:20', action: 'İçerik OCR Taraması', details: 'Bioderma Atoderm ürünü için OCR analizi tamamlandı. Uyum Skoru: %98', ipAddress: '127.0.0.1 (Şifreli Oturum)' }
];
