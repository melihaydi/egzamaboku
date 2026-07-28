# DermIQ - Egzama ve Cilt Sağlığı Takip Platformu

> **Cilt Fotoğraf Analizi, Kullanıcı Kontrollü Belirti Takibi, Hava/Çevre Verileri ve Klinik Takip Platformu**

![DermIQ Platform](https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&q=80)

---

## Temel İlke

Bu uygulama hiçbir belirti şiddetini (kaşıntı, ağrı, uyku vb.) kendiliğinden tahmin etmez veya uydurmaz. Belirtileri her zaman kullanıcı kendisi puanlar; yapay zeka yalnızca yüklenen fotoğrafta gerçekten görülebilen özellikleri (kızarıklık, soyulma, şişlik, kabuklanma, sızıntı, etkilenen alan) ölçer ve her ölçümün hangi somut piksel sinyaline dayandığını açıklar.

## Öne Çıkan Özellikler

### 1. Alevlenme Raporu
- Kullanıcının kendi puanladığı 7 belirti sliderı (kaşıntı, ağrı, yanma/batma, kuruluk, çatlama, kanama, uykuya etkisi) ile fotoğraf analizinden gelen görsel ölçümler ayrı ayrı gösterilir ve şeffaf biçimde birleştirilir.
- Eksik veri hiçbir zaman tahmin edilmez: yalnızca mevcut kaynaklar gösterilir.

### 2. Cilt Fotoğraf Analizi
- Çoklu vücut bölgesi taraması: Sol Kol, Sağ Kol, Yüz & Boyun, Eller, Göğüs/Sırt, Bacaklar.
- Canlı cihaz kamerası veya fotoğraf yükleme; yüklenen fotoğrafın **gerçek piksel verisi** (renk kanalları, doku/kenar yoğunluğu) analiz edilerek kızarıklık, soyulma, şişlik, kabuklanma, sızıntı, pigmentasyon ve etkilenen alan (cm²) ölçülür — deterministiktir, aynı fotoğraf her zaman aynı sonucu verir.
- Her ölçüm için "Neden Bu Sonuç?" bölümünde somut gerekçe gösterilir.
- Öncesi/Sonrası split karşılaştırma, iyileşme zaman tüneli ve önceki taramaya göre değişim (delta) göstergeleri.

### 3. Hava & Çevre Verileri
- **Open-Meteo** açık API'lerinden gerçek zamanlı sıcaklık, nem, UV indeksi, rüzgar, basınç, PM2.5/PM10, Avrupa AQI ve polen (ağaç/çim/yabani ot) verisi — API anahtarı gerekmez. Varsayılan konum: Bahçelievler, İstanbul.
- Herhangi bir "alevlenme tahmini" veya risk yüzdesi hesaplanmaz; yalnızca ölçülen/tahmin edilen meteorolojik veriler gösterilir.

### 4. Ürün İçerik Tarayıcı
- Etiket fotoğrafını **Tesseract.js** ile tarayıcı içinde gerçek OCR (metin tanıma) kullanarak okur, veya içerik listesi elle yapıştırılabilir.
- Parfüm, alkol, SLS/sülfat, MIT/MCI, paraben, uçucu yağ, lanolin, üre, seramid, petrolatum ve gliserin tespiti; *Güvenli*, *Dikkatli Kullanılmalı*, *Önerilmez* sınıflandırması.

### 5. Tetikleyici Günlüğü
- Kullanıcının kendi kontrolünde tuttuğu tetikleyici kayıtları (gıda, çevresel, ürün, diğer): ne, ne zaman, ne şiddette ve neden tetikleyici olduğunu düşündüğü.
- Otomatik tetikleyici tahmini yapılmaz; yalnızca kendi kayıtlarındaki tekrarlar özetlenir.

### 6. Beslenme Asistanı
- Kullanıcının kendi besinlerini, öğünlerini ve tariflerini eklediği, her besini *Güvenli / Bazen Sorunlu / Her Zaman Tetikliyor* olarak derecelendirdiği kişisel bir sistem.

### 7. Takvim & Zaman Çizelgesi
- Fotoğraf taramaları, ilaçlar, enjeksiyonlar, doktor ziyaretleri, alevlenmeler ve notlar aylık takvimde ilgili günün altında özet olarak gösterilir.
- Etkinlik ekleme, düzenleme, silme ve kopyalama (tekrarlayan etkinlikler için).

### 8. Tedavi Geçmişi Kronolojisi
- Geçmişte ve halen kullanılan tedavilerin düzenlenebilir/silinebilir kronolojik kaydı.
- İlaç adı, tarih ve vücut bölgesine göre filtreleme; fotoğraf analizi geçmişinden türetilen gerçek ilerleme grafiği (etkilenen alan, cm²).

### 9. Sağlık Günlüğü
- Alerjiler, kişisel notlar, doktor notları ve tıbbi geçmiş için tamamen düzenlenebilir kişisel sağlık günlüğü.

### 10. Sohbet Asistanı
- Egzama, cilt bariyeri, tedaviler (Dupixent, Cibinqo, Siklosporin, Prednizon vb.), tetikleyiciler ve günlük bakım hakkında geniş bir yerel bilgi tabanından yanıt veren sohbet asistanı.

### 11. Günlük Bakım Listesi
- Sabah, öğle, akşam, gece bakım adımlarını ekleme, düzenleme, sıralama ve kaldırma; ılık banyo zamanlayıcısı.

### 12. Sesli Asistan & Akıllı Saat Widget'ı
- Türkçe Web Speech API ile eller serbest sesli komut alma (yalnızca gerçek eylemleri tetikler, belirti skoru uydurmaz).

---

## Teknolojiler

- **Core**: React 19, TypeScript, Vite
- **Veri Kalıcılığı**: Tarayıcı `localStorage` katmanı ile oturum verileri sayfa yenilense veya tarayıcı kapatılsa dahi korunur.
- **Styling**: TailwindCSS v4, Glassmorphism, Duyarlı Karanlık/Aydınlık Mod
- **Görüntü İşleme**: HTML5 Canvas piksel analizi (gerçek renk/doku ölçümü, deterministik), Lucide Icons, Canvas Confetti
- **OCR**: Tesseract.js (tarayıcı içinde çalışan gerçek metin tanıma)
- **Hava/Çevre Verisi**: Open-Meteo Forecast & Air Quality API (anahtar gerektirmez)
- **Ses Tanıma**: Web Speech API (tr-TR)

---

## Bilinen Sınırlamalar

- Sohbet asistanı yerel, kürasyonu yapılmış bir bilgi tabanı kullanır; GPT/Claude/Gemini gibi harici bir LLM'e bağlı değildir (bu, API anahtarı ve sunucu taraflı bir proxy gerektirir).
- Görsel analiz, eğitilmiş bir derin öğrenme modeli değil; deterministik piksel/doku ölçümüne dayanan bir sezgisel motordur.

---

## Kurulum ve Çalıştırma

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

Bu uygulama kişisel takip ve bilgilendirme amaçlıdır; tıbbi teşhis veya tedavi niteliği taşımaz.
