import React, { useState } from 'react';
import { 
  Sparkles, 
  Camera, 
  FileText, 
  Check,
  Ban
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { ProductScanResult, IngredientItem } from '../../types';

export const IngredientScanner: React.FC = () => {
  const { scannedProducts, addScannedProduct } = useApp();
  const [activeScan, setActiveScan] = useState<ProductScanResult>(scannedProducts[0]);
  const [pastedIngredients, setPastedIngredients] = useState<string>('');
  const [productNameInput, setProductNameInput] = useState<string>('');
  const [brandInput, setBrandInput] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const handleRunOCRScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const textToAnalyze = pastedIngredients || 'İçindekiler: Aqua, Glycerin, Petrolatum, Ceramide NP, Parfum (Fragrance), Sodium Lauryl Sulfate, Phenoxyethanol, CI 19140.';
      
      const parsedIngredients: IngredientItem[] = [];
      let flagged = 0;

      if (/fragrance|parfum|esans/i.test(textToAnalyze)) {
        parsedIngredients.push({
          name: 'Parfum (Sentetik Esans)',
          category: 'Sentetik Parfüm',
          riskLevel: 'Yüksek',
          explanation: 'Egzamalı ve hassas ciltlerde temas alerjisinin (kontakt dermatit) 1 numaralı sebebidir.'
        });
        flagged++;
      }
      if (/sulfate|sls/i.test(textToAnalyze)) {
        parsedIngredients.push({
          name: 'Sodium Lauryl Sulfate (SLS)',
          category: 'Tahriş Edici (İrritan)',
          riskLevel: 'Yüksek',
          explanation: 'Cildin koruyucu doğal yağ tabakasını çözerek bariyeri zayıflatır.'
        });
        flagged++;
      }
      if (/alcohol denat|isopropyl alcohol/i.test(textToAnalyze)) {
        parsedIngredients.push({
          name: 'Alcohol Denat (Kurutucu Alkol)',
          category: 'Kurutucu Alkol',
          riskLevel: 'Yüksek',
          explanation: 'Hızla buharlaşarak cildin nem dengesini bozar ve kuruluğu artırır.'
        });
        flagged++;
      }

      parsedIngredients.push(
        { name: 'Ceramide NP', category: 'Güvenli (Bariyer Onarıcı)', riskLevel: 'Düşük', explanation: 'Cilt bariyer lipid yapısını yeniden inşa eden temel seramid molekülü.' },
        { name: 'Glycerin', category: 'Güvenli (Bariyer Onarıcı)', riskLevel: 'Düşük', explanation: 'Epidermis hücrelerine su bağlayan güçlü nemlendirici.' },
        { name: 'Petrolatum (Vazolin)', category: 'Güvenli (Bariyer Onarıcı)', riskLevel: 'Düşük', explanation: 'Nem kaybını %98 oranında önleyen yüksek tıkama (oklüzyon) kapasiteli koruyucu.' }
      );

      const score = Math.max(20, 100 - flagged * 25);
      let rating: ProductScanResult['ratingCategory'] = 'Mükemmel Uyumlu';
      if (score < 50) rating = 'Yüksek Tahriş Riski';
      else if (score < 75) rating = 'Dikkatli Kullanılmalı';
      else if (score < 90) rating = 'Genellikle Uygun';

      const newResult: ProductScanResult = {
        id: `scan-${Date.now()}`,
        productName: productNameInput || 'Taranan Bakım Ürünü',
        brand: brandInput || 'Dermatoloji Markası',
        scannedAt: new Date().toLocaleString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        compatibilityScore: score,
        ratingCategory: rating,
        ingredients: parsedIngredients,
        rawTextScanned: textToAnalyze,
        flaggedCount: flagged
      };

      addScannedProduct(newResult);
      setActiveScan(newResult);
      setIsScanning(false);
      setPastedIngredients('');
      setProductNameInput('');
      setBrandInput('');
    }, 1000);
  };

  const getRatingBadge = (cat: ProductScanResult['ratingCategory']) => {
    switch (cat) {
      case 'Mükemmel Uyumlu': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Genellikle Uygun': return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      case 'Dikkatli Kullanılmalı': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Yüksek Tahriş Riski': return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    }
  };

  return (
    <div className="space-y-6">
      {/* Üst Şerit */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Yapay Zeka Kozmetik & İçerik OCR Tarayıcısı
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Bakım ürünlerinin etiketini tarayarak egzamayı tetikleyen irritan maddeleri (SLS, Parfüm, Koruyucu, Alkol) tespit eder.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sol Kolon: Tarama Girdileri */}
        <div className="lg:col-span-5 bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Camera className="w-4 h-4 text-sky-400" />
            Etiket Tara veya İçerik Yapıştır
          </h3>

          <div className="relative h-40 rounded-2xl bg-slate-950 border-2 border-dashed border-slate-800 flex flex-col items-center justify-center p-4 text-center group">
            <Camera className="w-8 h-8 text-sky-400 mb-2" />
            <p className="text-xs font-semibold text-slate-300">Kamerayı Ürün Etiketine Doğrultun</p>
            <p className="text-[10px] text-slate-500">OCR metin okuma & barkod sorgulama</p>

            <button
              onClick={handleRunOCRScan}
              disabled={isScanning}
              className="mt-3 px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md"
            >
              {isScanning ? 'OCR İşleniyor...' : 'Kamera İle Oku'}
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Ürün Adı & Markası</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Örn: Nemlendirici Krem"
                  value={productNameInput}
                  onChange={e => setProductNameInput(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Örn: CeraVe"
                  value={brandInput}
                  onChange={e => setBrandInput(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Veya İçerik Listesini Yapıştırın</label>
              <textarea
                rows={3}
                placeholder="Örn: Aqua, Glycerin, Petrolatum, SLS, Parfum..."
                value={pastedIngredients}
                onChange={e => setPastedIngredients(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none"
              />
            </div>

            <button
              onClick={handleRunOCRScan}
              disabled={isScanning}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-400 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              {isScanning ? 'İçerik Veritabanı Taranıyor...' : 'İçindekileri İncele'}
            </button>
          </div>

          {/* Geçmiş Taramalar */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Son Taranan Ürünler</span>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {scannedProducts.map(prod => (
                <button
                  key={prod.id}
                  onClick={() => setActiveScan(prod)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-colors ${
                    activeScan.id === prod.id ? 'bg-slate-800 border-sky-500/50' : 'bg-slate-950 border-slate-850 hover:bg-slate-800/50'
                  }`}
                >
                  <div>
                    <p className="font-bold text-slate-200">{prod.productName}</p>
                    <p className="text-[10px] text-slate-500">{prod.brand} • {prod.scannedAt}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getRatingBadge(prod.ratingCategory)}`}>
                    %{prod.compatibilityScore}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sağ Kolon: Tarama Sonuçları */}
        <div className="lg:col-span-7 bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider block">
                {activeScan.brand}
              </span>
              <h3 className="text-xl font-bold text-white mt-0.5">
                {activeScan.productName}
              </h3>
              <p className="text-xs text-slate-400">Tarama Tarihi: {activeScan.scannedAt}</p>
            </div>

            <div className="text-right shrink-0">
              <span className={`inline-block px-3 py-1 rounded-xl text-xs font-black border ${getRatingBadge(activeScan.ratingCategory)}`}>
                {activeScan.ratingCategory} (%{activeScan.compatibilityScore})
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">
                {activeScan.flaggedCount === 0 ? 'İrritan Madde Saptanmadı' : `${activeScan.flaggedCount} Riskli İrritan Madde Tespit Edildi`}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              İçerik Detaylı Değerlendirmesi:
            </h4>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {activeScan.ingredients.map((ing, idx) => {
                const isSafe = ing.category.includes('Güvenli');
                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
                      isSafe ? 'bg-slate-950/60 border-slate-800/80' : 'bg-rose-950/30 border-rose-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white flex items-center gap-2">
                        {isSafe ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Ban className="w-4 h-4 text-rose-400" />
                        )}
                        {ing.name}
                      </span>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isSafe ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {ing.category}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed pl-6">
                      {ing.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
