# DermIQ - Egzama ve Cilt Sağlığı Takip Platformu

> **Cilt Fotoğraf Analizi, Çevresel Alevlenme Tahmini, İçerik Tarayıcı ve Klinik Takip Platformu**

![DermIQ Platform](https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&q=80)

---

## Öne Çıkan Özellikler

### 1. Cilt Fotoğraf Analizi
- Çoklu vücut bölgesi taraması: Sol Kol, Sağ Kol, Yüz & Boyun, Eller, Göğüs/Sırt, Bacaklar.
- Canlı cihaz kamerası veya fotoğraf yükleme; yüklenen fotoğrafın **gerçek piksel verisi** (renk kanalları, doku/kenar yoğunluğu) analiz edilerek kızarıklık, kuruluk, soyulma, çatlama, sızıntı, şişlik ve pigmentasyon ölçülür.
- Öncesi/Sonrası split karşılaştırma ve iyileşme zaman tüneli.
- SCORAD skoru, etkilenen alan (cm²) ve enfeksiyon riski tahmini — tamamı görüntüden türetilir.

### 2. Alevlenme Şiddeti Skoru (0–100)
- Kaşıntı, kuruluk, kızarıklık, uyku kalitesi, nemlendirici kullanımı, ilaç uyumu, hava koşulları, stres ve beslenme faktörlerinden hesaplanan günlük şiddet skoru.
- Haftalık/aylık trend grafikleri ve faktör bazlı katkı analizi.

### 3. 72 Saatlik Alevlenme Tahmini
- **Open-Meteo** açık hava durumu ve hava kalitesi API'lerinden gerçek zamanlı sıcaklık, nem, UV indeksi, rüzgar, PM2.5/PM10, Avrupa AQI ve polen (ağaç/çim/yabani ot) verisi — API anahtarı gerekmez.
- Varsayılan konum: Bahçelievler, İstanbul.

### 4. Ürün İçerik Tarayıcı
- Etiket fotoğrafını **Tesseract.js** ile tarayıcı içinde gerçek OCR (metin tanıma) kullanarak okur, veya içerik listesi elle yapıştırılabilir.
- Parfüm, alkol, SLS/sülfat, MIT/MCI, paraben, uçucu yağ, lanolin, üre, seramid, petrolatum ve gliserin tespiti; *Güvenli*, *Dikkatli Kullanılmalı*, *Önerilmez* sınıflandırması.

### 5. Beslenme Asistanı
- Tetikleyici olabilecek gıdalar (fast food, şekerli gıdalar, alkol, işlenmiş gıdalar vb.) ve cilt dostu besinler (somon, omega-3 kaynakları, yoğurt, kefir, ceviz, avokado vb.) için risk/katkı açıklamaları.
- Kişisel öğün günlüğü ve besin-belirti korelasyon takibi.

### 6. Takvim & Zaman Çizelgesi
- Fotoğraf taramaları, ilaçlar, enjeksiyonlar, doktor ziyaretleri, alevlenmeler ve notların tek bir aylık takvim görünümünde birleştirilmesi.

### 7. Günlük Bakım Listesi
- Sabah, öğle, akşam, gece bakım adımlarını ekleme, düzenleme, sıralama ve kaldırma.
- Ilık banyo zamanlayıcısı ve hidrasyon takibi.

### 8. Tedavi Geçmişi Kronolojisi
- Geçmişte ve halen kullanılan sistemik/biyolojik tedavilerin (ör. kortikosteroid → immünsüpresan → JAK inhibitörü → biyolojik) kronolojik zaman çizelgesi.

### 9. Sağlık Günlüğü
- Alerjiler, kişisel notlar, doktor notları ve tıbbi geçmiş için tamamen düzenlenebilir kişisel sağlık günlüğü.

### 10. Sohbet Asistanı
- Egzama, cilt bariyeri, tedaviler (Dupixent, Cibinqo, Siklosporin, Prednizon vb.), tetikleyiciler ve günlük bakım hakkında geniş bir yerel bilgi tabanından yanıt veren sohbet asistanı.

### 11. Sesli Asistan & Akıllı Saat Widget'ı
- Türkçe Web Speech API ile eller serbest sesli komut alma.
- Akıllı saat arayüz simülatörü.

---

## Teknolojiler

- **Core**: React 19, TypeScript, Vite
- **Veri Kalıcılığı**: Tarayıcı `localStorage` katmanı ile oturum verileri sayfa yenilense veya tarayıcı kapatılsa dahi korunur.
- **Styling**: TailwindCSS v4, Glassmorphism, Duyarlı Karanlık/Aydınlık Mod
- **Görüntü İşleme**: HTML5 Canvas piksel analizi (gerçek renk/doku ölçümü), Lucide Icons, Canvas Confetti
- **OCR**: Tesseract.js (tarayıcı içinde çalışan gerçek metin tanıma)
- **Hava/Çevre Verisi**: Open-Meteo Forecast & Air Quality API (anahtar gerektirmez)
- **Ses Tanıma**: Web Speech API (tr-TR)

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
