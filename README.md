# DermIQ - Akıllı Egzama ve Cilt Sağlığı Platformu

> **Yapay Zeka Destekli Bilgisayarlı Görü (Computer Vision), Çevresel Alevlenme Tahmini, İçerik OCR Tarayıcısı ve Klinik Takip Platformu**

![DermIQ Platform](https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&q=80)

---

## 🌟 Öne Çıkan Özellikler

### 1. 🔍 Görsel Yapay Zeka (Computer Vision) & Isı Haritaları
- **Çoklu Vücut Bölgesi Taraması**: Sol Kol, Sağ Kol, Yüz & Boyun, Eller, Göğüs/Sırt ve Bacaklar.
- **Canlı Cihaz Kamerası (WebCam)**: Tarayıcı üzerinden doğrudan kamera görüntüsü alarak anlık cilt taraması.
- **Öncesi / Sonrası Split Karşılaştırma**: Sürgülü (Slider) ekran ile başlangıç alevlenmesi ile güncel iyileşmeyi birebir kıyaslama.
- **Klinik Parametre Ölçümü**: Eritem (Kızarıklık), Kserozis (Kuruluk), Soyulma, Fissür (Çatlama), Ödem ve Etkilenen Alan ($cm^2$) tespiti.
- **SCORAD & EASI İndeksi**: Standartlaştırılmış klinik egzamal şiddet puanlama modeli.

### 2. 📊 Özel Yapay Zeka İyileşme Skoru (0–100)
- 10 klinik ve davranışsal faktörü (alevlenme şiddeti, fotoğraf trendi, ilaç uyumu, nemlendirme, uyku, stres, su tüketimi) harmanlayan canlı skor dial göstergesi.
- Haftalık ve aylık trend grafikleri, iyileşme hızı ($+\text{puan/hafta}$) ve alevlenme riski göstergeleri.

### 3. 🌤️ 72 Saatlik Alevlenme Tahmini & Çevre İstihbaratı
- Hava sıcaklığı, nem oranı, UV indeksi ve rüzgar takibi.
- **Polen Takibi**: Ağaç, çim ve yabani ot polen risk seviyeleri.
- **Hava Kalitesi (AQI)**: PM2.5, PM10, Ozon ($O_3$) ve Azot Dioksit ($NO_2$) ölçümleri.
- Kişiselleştirilmiş cilt mikro-klima tavsiyeleri.

### 4. 🧴 Ürün & İçerik OCR Tarayıcısı
- Kozmetik etiket metinlerini ve içerik listelerini tarayarak egzamayı tetikleyen irritan maddeleri tespit eder.
- SLS (Sodium Lauryl Sulfate), sentetik parfümler, kurutucu alkoller, koruyucular (MIT/Paraben) ve boya kontrolü.
- *Mükemmel Uyumlu*, *Genellikle Uygun*, *Dikkatli Kullanılmalı* veya *Yüksek Tahriş Riski* skorlaması.

### 5. 🥗 Beslenme & Histamin Korelasyon Takibi
- Yüksek histaminli besinler (eski peynirler, şarküteri ürünleri, nitratlı gıdalar) ve alerjen takibi.
- Besin tüketiminden 12–72 saat sonraki kaşıntı/alevlenme değişimlerini gösteren zamansal korelasyon analizi.

### 6. 📅 Dinamik Bakım Rutini & Ilık Banyo Zamanlayıcısı
- Sabah, Öğle, Akşam ve Gece bakım adımları. Akut alevlenme ve proaktif idame modlarına otomatik uyum.
- 10 dakikalık **Ilık Banyo Zamanlayıcısı** ve banyo sonrası 3 dakika nemlendirme kuralı uyarısı.
- Tamamlanan rutin bölümlerinde kutlama konfetisi.

### 7. 🩺 Doktor Görüşmesi Hazırlık & PDF Raporu
- Dermatolog randevusu için fotoğraflı kronolojik gelişim, ilaç uyumu ve SCORAD indekslerini içeren **tek tıkla PDF rapor çıktısı**.
- Davet şifresi ile doktor canlı izleme portalı modu.

### 8. 🎙️ Sesli Asistan & Akıllı Saat Widget'ı
- Türkçe Web Speech API ile eller serbest sesli komut alma (*"Nemlendirici sürdüm"*, *"Kaşıntım 4"*).
- Apple Watch ve Wear OS uyumlu akıllı saat arayüz simülatörü.

---

## 🛠️ Teknolojiler

- **Core**: React 19, TypeScript, Vite
- **Styling**: TailwindCSS v4, Custom Glassmorphism, Responsive Dark/Light Mode
- **Grafikler & Görseller**: HTML5 Canvas (Heatmaps & Split Comparator), Lucide Icons, Canvas Confetti
- **Raporlama**: jsPDF, html2canvas
- **Ses Tanıma**: Web Speech API (tr-TR)

---

## 🚀 Kurulum ve Çalıştırma

1. **Bağımlılıkları Yükleyin**:
```bash
npm install
```

2. **Geliştirme Sunucusunu Başlatın**:
```bash
npm run dev
```

3. **Production Build Alın**:
```bash
npm run build
```

---

## 📄 Tıbbi Sorumluluk Reddi

DermIQ, yapay zeka destekli biyofiziksel görsel analiz ve yaşam tarzı takip araçları sunar. Sunulan sonuçlar bilgilendirme ve destek amaçlıdır; tıbbi teşhis, tanı veya tedavi niteliği taşımaz. Sağlık sorunlarınız için daima uzman bir dermatoloğa veya hekime danışınız.
