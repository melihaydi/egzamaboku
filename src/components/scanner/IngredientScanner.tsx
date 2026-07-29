import React, { useEffect, useRef, useState } from 'react';
import {
  Sparkles,
  Camera,
  FileText,
  Check,
  Ban,
  Loader2,
  ScanBarcode,
  X
} from 'lucide-react';
import { useApp } from '../../context/useApp';
import type { ProductScanResult } from '../../types';
import { analyzeIngredientText } from '../../lib/ingredientAnalysis';
import { createBarcodeDetector, lookupBarcodeProduct } from '../../lib/barcodeScan';

export const IngredientScanner: React.FC = () => {
  const { scannedProducts, addScannedProduct, t } = useApp();
  const [activeScan, setActiveScan] = useState<ProductScanResult>(scannedProducts[0]);
  const [pastedIngredients, setPastedIngredients] = useState<string>('');
  const [productNameInput, setProductNameInput] = useState<string>('');
  const [brandInput, setBrandInput] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [ocrStatus, setOcrStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isBarcodeCameraOpen, setIsBarcodeCameraOpen] = useState<boolean>(false);
  const [isLookingUpBarcode, setIsLookingUpBarcode] = useState<boolean>(false);
  const [barcodeStatus, setBarcodeStatus] = useState<string>('');
  const [manualBarcode, setManualBarcode] = useState<string>('');
  const barcodeVideoRef = useRef<HTMLVideoElement | null>(null);
  const barcodeStreamRef = useRef<MediaStream | null>(null);
  const barcodeIntervalRef = useRef<number | null>(null);

  const finalizeResult = (text: string, method: ProductScanResult['scanMethod'], nameOverride?: string, brandOverride?: string) => {
    const { ingredients, flaggedCount, compatibilityScore, ratingCategory } = analyzeIngredientText(text);

    const newResult: ProductScanResult = {
      id: `scan-${Date.now()}`,
      productName: nameOverride || productNameInput || 'Taranan Bakım Ürünü',
      brand: brandOverride || brandInput || 'Bilinmeyen Marka',
      scannedAt: new Date().toLocaleString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      compatibilityScore,
      ratingCategory,
      ingredients,
      rawTextScanned: text,
      flaggedCount,
      scanMethod: method
    };

    addScannedProduct(newResult);
    setActiveScan(newResult);
    setPastedIngredients('');
    setProductNameInput('');
    setBrandInput('');
  };

  const handleAnalyzeText = () => {
    if (!pastedIngredients.trim()) return;
    setIsScanning(true);
    setTimeout(() => {
      finalizeResult(pastedIngredients, 'metin-girişi');
      setIsScanning(false);
    }, 400);
  };

  const handlePhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsScanning(true);
    setOcrStatus('OCR motoru başlatılıyor...');

    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng', undefined, {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === 'recognizing text') {
            setOcrStatus(`Etiket okunuyor... %${Math.round(m.progress * 100)}`);
          } else {
            setOcrStatus(m.status);
          }
        }
      });

      const { data } = await worker.recognize(file);
      await worker.terminate();

      const extractedText = data.text.trim();
      if (extractedText.length < 3) {
        setOcrStatus('Etikette okunabilir metin bulunamadı. Lütfen içerik listesini elle yapıştırın.');
        setIsScanning(false);
        return;
      }

      finalizeResult(extractedText, 'ocr');
      setOcrStatus('');
    } catch {
      setOcrStatus('OCR işlemi başarısız oldu. Lütfen içerik listesini elle yapıştırın.');
    } finally {
      setIsScanning(false);
      e.target.value = '';
    }
  };

  const stopBarcodeCamera = () => {
    if (barcodeStreamRef.current) {
      barcodeStreamRef.current.getTracks().forEach(track => track.stop());
      barcodeStreamRef.current = null;
    }
    if (barcodeIntervalRef.current !== null) {
      window.clearInterval(barcodeIntervalRef.current);
      barcodeIntervalRef.current = null;
    }
  };

  useEffect(() => stopBarcodeCamera, []);

  const handleBarcodeFound = async (code: string) => {
    stopBarcodeCamera();
    setIsBarcodeCameraOpen(false);
    setIsLookingUpBarcode(true);
    setBarcodeStatus(`Barkod okundu: ${code}. Open Food Facts / Open Beauty Facts veritabanında aranıyor...`);

    const info = await lookupBarcodeProduct(code);
    setIsLookingUpBarcode(false);

    if (!info) {
      setBarcodeStatus(`${code} barkodu veritabanında bulunamadı ya da içerik listesi kayıtlı değil. İçerik listesini elle yapıştırabilirsin.`);
      return;
    }

    setBarcodeStatus('');
    finalizeResult(info.ingredientsText, 'barkod', info.productName, info.brand);
  };

  const startBarcodeCamera = async () => {
    setBarcodeStatus('');
    setIsBarcodeCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      barcodeStreamRef.current = stream;
      if (barcodeVideoRef.current) {
        barcodeVideoRef.current.srcObject = stream;
      }

      const detector = createBarcodeDetector();
      if (!detector) {
        setBarcodeStatus('Bu tarayıcı otomatik barkod okumayı desteklemiyor. Barkod numarasını elle girebilirsin.');
        return;
      }

      barcodeIntervalRef.current = window.setInterval(async () => {
        if (!barcodeVideoRef.current) return;
        try {
          const codes = await detector.detect(barcodeVideoRef.current);
          if (codes.length > 0) {
            handleBarcodeFound(codes[0].rawValue);
          }
        } catch {
          // Tespit sırasında geçici bir hata olabilir; bir sonraki denemede devam edilir
        }
      }, 400);
    } catch {
      setIsBarcodeCameraOpen(false);
      setBarcodeStatus('Kameraya erişilemedi. Barkod numarasını elle girebilirsin.');
    }
  };

  const cancelBarcodeCamera = () => {
    stopBarcodeCamera();
    setIsBarcodeCameraOpen(false);
  };

  const handleManualBarcodeSubmit = async () => {
    if (!manualBarcode.trim()) return;
    setIsLookingUpBarcode(true);
    setBarcodeStatus('Ürün veritabanında aranıyor...');

    const info = await lookupBarcodeProduct(manualBarcode.trim());
    setIsLookingUpBarcode(false);

    if (!info) {
      setBarcodeStatus(`${manualBarcode} barkodu veritabanında bulunamadı ya da içerik listesi kayıtlı değil.`);
      return;
    }

    setBarcodeStatus('');
    finalizeResult(info.ingredientsText, 'barkod', info.productName, info.brand);
    setManualBarcode('');
  };

  const getRatingBadge = (cat: ProductScanResult['ratingCategory']) => {
    switch (cat) {
      case 'Güvenli': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Dikkatli Kullanılmalı': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Önerilmez': return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    }
  };

  return (
    <div className="space-y-6">
      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoSelected} className="hidden" />

      {/* Üst Şerit */}
      <div className="bg-neutral-900/60 p-6 rounded-3xl border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-neutral-800 text-neutral-300 border border-neutral-700">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-semibold text-white tracking-tight">
              {t('title.scanner')}
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Etiket fotoğrafını gerçek OCR (metin tanıma) ile okur veya yapıştırılan içerik listesini; parfüm, alkol, SLS, MIT/MCI, paraben, uçucu yağ, lanolin, üre, seramid, petrolatum ve gliserin açısından değerlendirir.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sol Kolon: Tarama Girdileri */}
        <div className="lg:col-span-5 bg-neutral-900/60 p-6 rounded-3xl border border-neutral-800 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Camera className="w-4 h-4 text-neutral-400" />
            Etiket Fotoğrafı Yükle (Gerçek OCR)
          </h3>

          <div className="relative h-40 rounded-2xl bg-neutral-950 border-2 border-dashed border-neutral-800 flex flex-col items-center justify-center p-4 text-center">
            {isScanning ? (
              <>
                <Loader2 className="w-8 h-8 text-neutral-300 mb-2 animate-spin" />
                <p className="text-xs font-semibold text-neutral-300">{ocrStatus || 'İşleniyor...'}</p>
              </>
            ) : (
              <>
                <Camera className="w-8 h-8 text-neutral-400 mb-2" />
                <p className="text-xs font-semibold text-neutral-300">Ürün Etiketinin Fotoğrafını Yükle</p>
                <p className="text-[10px] text-neutral-500">Tarayıcıda çalışan gerçek metin tanıma (Tesseract OCR)</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isScanning}
                  className="mt-3 px-4 py-1.5 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 font-semibold text-xs"
                >
                  Etiket Fotoğrafı Seç
                </button>
              </>
            )}
          </div>
          {ocrStatus && !isScanning && (
            <p className="text-[10px] text-amber-300">{ocrStatus}</p>
          )}

          <div className="pt-3 border-t border-neutral-800 space-y-2">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <ScanBarcode className="w-4 h-4 text-neutral-400" />
              Barkod ile Tara
            </h3>
            <p className="text-[10px] text-neutral-500">
              Open Food Facts / Open Beauty Facts veritabanından gerçek ürün adı, marka ve içerik listesi getirilir.
            </p>

            {isBarcodeCameraOpen ? (
              <div className="space-y-2">
                <div className="relative rounded-2xl overflow-hidden bg-black h-40 flex items-center justify-center">
                  <video ref={barcodeVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  <div className="absolute inset-x-6 inset-y-10 border-2 border-white/70 rounded-lg pointer-events-none" />
                </div>
                <button
                  onClick={cancelBarcodeCamera}
                  className="w-full py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 font-semibold text-xs flex items-center justify-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" /> Taramayı İptal Et
                </button>
              </div>
            ) : (
              <button
                onClick={startBarcodeCamera}
                disabled={isLookingUpBarcode}
                className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-100 font-semibold text-xs flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <ScanBarcode className="w-4 h-4" />
                Kamera ile Barkod Tara
              </button>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                placeholder="Ya da barkod numarasını gir"
                value={manualBarcode}
                onChange={e => setManualBarcode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleManualBarcodeSubmit()}
                className="flex-1 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-600 focus:outline-none"
              />
              <button
                onClick={handleManualBarcodeSubmit}
                disabled={!manualBarcode.trim() || isLookingUpBarcode}
                className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 text-xs font-semibold disabled:opacity-40 shrink-0"
              >
                {isLookingUpBarcode ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Ara'}
              </button>
            </div>

            {barcodeStatus && (
              <p className="text-[10px] text-amber-300">{barcodeStatus}</p>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-semibold uppercase text-neutral-500 block mb-1">Ürün Adı & Markası</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Örn: Nemlendirici Krem"
                  value={productNameInput}
                  onChange={e => setProductNameInput(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-600 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Örn: CeraVe"
                  value={brandInput}
                  onChange={e => setBrandInput(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold uppercase text-neutral-500 block mb-1">Veya İçerik Listesini Yapıştırın</label>
              <textarea
                rows={3}
                placeholder="Örn: Aqua, Glycerin, Petrolatum, Sodium Lauryl Sulfate, Parfum..."
                value={pastedIngredients}
                onChange={e => setPastedIngredients(e.target.value)}
                className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-600 focus:outline-none"
              />
            </div>

            <button
              onClick={handleAnalyzeText}
              disabled={isScanning || !pastedIngredients.trim()}
              className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-100 font-semibold text-xs shadow-md flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <FileText className="w-4 h-4" />
              İçindekileri İncele
            </button>
          </div>

          {/* Geçmiş Taramalar */}
          <div className="pt-4 border-t border-neutral-800 space-y-2">
            <span className="text-[10px] uppercase font-semibold text-neutral-500 block">Son Taranan Ürünler</span>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {scannedProducts.map(prod => (
                <button
                  key={prod.id}
                  onClick={() => setActiveScan(prod)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-colors ${
                    activeScan.id === prod.id ? 'bg-neutral-800 border-neutral-600' : 'bg-neutral-950 border-neutral-800 hover:bg-neutral-800/50'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-neutral-200 truncate">{prod.productName}</p>
                    <p className="text-[10px] text-neutral-500">{prod.brand} • {prod.scanMethod === 'ocr' ? 'OCR' : prod.scanMethod === 'barkod' ? 'Barkod' : 'Metin'}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border shrink-0 ${getRatingBadge(prod.ratingCategory)}`}>
                    %{prod.compatibilityScore}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sağ Kolon: Tarama Sonuçları */}
        <div className="lg:col-span-7 bg-neutral-900/60 p-6 rounded-3xl border border-neutral-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
            <div>
              <span className="text-[10px] uppercase font-semibold text-neutral-500 tracking-wider block">
                {activeScan.brand}
              </span>
              <h3 className="text-xl font-semibold text-white mt-0.5">
                {activeScan.productName}
              </h3>
              <p className="text-xs text-neutral-400">Tarama Tarihi: {activeScan.scannedAt}</p>
            </div>

            <div className="text-right shrink-0">
              <span className={`inline-block px-3 py-1 rounded-xl text-xs font-bold border ${getRatingBadge(activeScan.ratingCategory)}`}>
                {activeScan.ratingCategory} (%{activeScan.compatibilityScore})
              </span>
              <span className="text-[10px] text-neutral-400 block mt-1">
                {activeScan.flaggedCount === 0 ? 'Riskli Madde Saptanmadı' : `${activeScan.flaggedCount} Riskli Madde Tespit Edildi`}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              İçerik Değerlendirmesi:
            </h4>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {activeScan.ingredients.map((ing, idx) => {
                const isSafe = ing.riskLevel === 'Düşük';
                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
                      isSafe ? 'bg-neutral-950/60 border-neutral-800' : 'bg-rose-950/20 border-rose-500/25'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-white flex items-center gap-2 min-w-0">
                        {isSafe ? <Check className="w-4 h-4 text-emerald-400 shrink-0" /> : <Ban className="w-4 h-4 text-rose-400 shrink-0" />}
                        <span className="truncate">{ing.name}</span>
                      </span>

                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded shrink-0 ${
                        isSafe ? 'bg-emerald-500/20 text-emerald-300' : ing.riskLevel === 'Yüksek' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {ing.category}
                      </span>
                    </div>

                    <p className="text-[11px] text-neutral-300 leading-relaxed pl-6">
                      {ing.explanation}
                    </p>
                  </div>
                );
              })}

              {activeScan.ingredients.length === 0 && (
                <p className="text-xs text-neutral-500 text-center py-6">Bu taramada tanımlı bir bileşen tespit edilmedi.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
