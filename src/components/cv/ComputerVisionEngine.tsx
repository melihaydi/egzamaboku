import React, { useState, useRef, useEffect } from 'react';
import {
  Scan,
  Upload,
  Layers,
  Eye,
  Sparkles,
  CheckCircle2,
  Clock,
  Play,
  Pause,
  Camera,
  SplitSquareVertical
} from 'lucide-react';
import { useApp } from '../../context/useApp';
import type { BodyLocation, CVAnalysis } from '../../types';
import { analyzeImagePixels, estimateInfectionRisk, estimateScoradIndex } from '../../lib/imageAnalysis';

function buildAnalysisFromCanvas(canvas: HTMLCanvasElement, location: BodyLocation, photoUrl: string, priorScorad: number | null): CVAnalysis {
  const result = analyzeImagePixels(canvas);
  const scoradIndex = estimateScoradIndex(result);
  const infectionRisk = estimateInfectionRisk(result);
  const healingProgression = priorScorad ? Math.max(0, Math.round((1 - scoradIndex / priorScorad) * 100)) : 0;

  return {
    id: `cv-${Date.now()}`,
    photoUrl,
    location,
    timestamp: new Date().toLocaleString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    redness: result.redness,
    dryness: result.dryness,
    scaling: result.scaling,
    cracking: result.cracking,
    oozing: result.oozing,
    swelling: result.swelling,
    pigmentation: result.pigmentation,
    surfaceAreaCm2: result.surfaceAreaCm2,
    scoradIndex,
    healingProgression,
    confidenceScore: result.confidenceScore,
    infectionRisk,
    affectedRegions: result.affectedRegions,
    notes: `Fotoğrafın piksel verisi analiz edildi: ${result.affectedRegions.length} bölgede kızarıklık/kuruluk sinyali tespit edildi.`,
    analysisMethod: 'canlı-piksel-analizi'
  };
}

export const ComputerVisionEngine: React.FC = () => {
  const { cvHistory, addCVAnalysis } = useApp();
  const [selectedLocation, setSelectedLocation] = useState<BodyLocation>('Sol Kol');
  const [activeAnalysis, setActiveAnalysis] = useState<CVAnalysis>(cvHistory[0]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Katman Aç/Kapat
  const [showRednessOverlay, setShowRednessOverlay] = useState<boolean>(true);
  const [showBoundaries, setShowBoundaries] = useState<boolean>(true);

  // Zaman Tüneli Oynatma
  const [timeLapseIndex, setTimeLapseIndex] = useState<number>(0);
  const [isPlayingTimeLapse, setIsPlayingTimeLapse] = useState<boolean>(false);

  // Karşılaştırma Modu
  const [isSplitMode, setIsSplitMode] = useState<boolean>(false);
  const [splitPos, setSplitPos] = useState<number>(50);

  // Canlı Kamera
  const [isWebCamActive, setIsWebCamActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const locationHistory = cvHistory.filter(item => item.location === selectedLocation);
  const baselineAnalysis = locationHistory[locationHistory.length - 1] || activeAnalysis;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const toggleWebCam = async () => {
    if (isWebCamActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      setIsWebCamActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsWebCamActive(true);
      } catch {
        fileInputRef.current?.click();
      }
    }
  };

  const captureWebCamFrame = () => {
    if (videoRef.current) {
      const vid = videoRef.current;
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = vid.videoWidth || 600;
      tempCanvas.height = vid.videoHeight || 400;
      const ctx = tempCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(vid, 0, 0);
        const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.9);
        const priorScorad = locationHistory[0]?.scoradIndex ?? null;
        const newScan = buildAnalysisFromCanvas(tempCanvas, selectedLocation, dataUrl, priorScorad);

        addCVAnalysis(newScan);
        setActiveAnalysis(newScan);
        toggleWebCam();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        const ctx = tempCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.9);
          const priorScorad = locationHistory[0]?.scoradIndex ?? null;
          const newScan = buildAnalysisFromCanvas(tempCanvas, selectedLocation, dataUrl, priorScorad);
          addCVAnalysis(newScan);
          setActiveAnalysis(newScan);
        }
        setIsProcessing(false);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Canvas Isı Haritası Çizimi
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = activeAnalysis.photoUrl;

    img.onload = () => {
      canvas.width = 600;
      canvas.height = 400;

      ctx.drawImage(img, 0, 0, 600, 400);

      if (showRednessOverlay) {
        activeAnalysis.affectedRegions.forEach(pt => {
          const px = (pt.x / 100) * 600;
          const py = (pt.y / 100) * 400;
          const radius = (pt.radius / 100) * 500;
          const radial = ctx.createRadialGradient(px, py, 5, px, py, radius);
          radial.addColorStop(0, `rgba(239, 68, 68, ${0.55 * pt.severity})`);
          radial.addColorStop(0.6, `rgba(245, 158, 11, ${0.25 * pt.severity})`);
          radial.addColorStop(1, 'rgba(239, 68, 68, 0)');
          ctx.fillStyle = radial;
          ctx.beginPath();
          ctx.arc(px, py, radius, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      if (showBoundaries) {
        activeAnalysis.affectedRegions.forEach((pt, idx) => {
          const px = (pt.x / 100) * 600;
          const py = (pt.y / 100) * 400;

          ctx.strokeStyle = '#e5e5e5';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(px - 30, py - 30, 60, 60);

          ctx.fillStyle = 'rgba(10,10,10,0.85)';
          ctx.fillRect(px - 30, py - 46, 170, 16);

          ctx.fillStyle = '#f5f5f5';
          ctx.font = '600 10px Inter, sans-serif';
          ctx.fillText(`#${idx + 1}: ${pt.label}`, px - 25, py - 34);
        });
      }
    };
  }, [activeAnalysis, showRednessOverlay, showBoundaries]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isPlayingTimeLapse && locationHistory.length > 0) {
      interval = setInterval(() => {
        setTimeLapseIndex(prev => {
          const next = (prev + 1) % locationHistory.length;
          setActiveAnalysis(locationHistory[next]);
          return next;
        });
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isPlayingTimeLapse, locationHistory]);

  return (
    <div className="space-y-6">
      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileUpload} className="hidden" />

      {/* Üst Şerit */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-900/60 p-6 rounded-3xl border border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-neutral-800 text-neutral-300 border border-neutral-700">
              <Scan className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-semibold text-white tracking-tight">
              Cilt Fotoğraf Analizi
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Yüklenen fotoğrafın gerçek piksel verisinden kızarıklık, kuruluk, soyulma, çatlama, sızıntı ve şişlik ölçülür.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value as BodyLocation)}
            className="px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs font-semibold text-neutral-300 focus:outline-none"
          >
            {['Sol Kol', 'Sağ Kol', 'Yüz & Boyun', 'Eller & Bilekler', 'Göğüs & Sırt', 'Bacaklar'].map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>

          <button
            onClick={toggleWebCam}
            className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isWebCamActive ? 'bg-rose-500 text-white border-rose-400' : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
            }`}
          >
            <Camera className="w-4 h-4" />
            {isWebCamActive ? 'Kamerayı Kapat' : 'Canlı Kamera'}
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 font-semibold text-xs flex items-center gap-2 disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {isProcessing ? 'Analiz Ediliyor...' : 'Fotoğraf Yükle'}
          </button>
        </div>
      </div>

      {/* Canlı Kamera Modalı */}
      {isWebCamActive && (
        <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-700 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-300 flex items-center gap-2">
              <Camera className="w-4 h-4 animate-pulse" />
              Canlı Cihaz Kamerası Bağlandı
            </span>
            <span className="text-[10px] text-neutral-400">Lezyonu kutucuğa hizalayın</span>
          </div>

          <div className="relative rounded-2xl overflow-hidden bg-black max-h-[360px] flex items-center justify-center">
            <video ref={videoRef} autoPlay playsInline className="w-full h-auto object-cover" />
            <div className="absolute inset-8 border-2 border-dashed border-neutral-400/60 rounded-2xl pointer-events-none flex items-center justify-center">
              <span className="text-[10px] uppercase font-semibold text-neutral-300 bg-neutral-950/80 px-2 py-1 rounded">
                Hedef Bölge: {selectedLocation}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={captureWebCamFrame}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 font-semibold text-xs flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Kareyi Yakala & Analiz Et
            </button>
          </div>
        </div>
      )}

      {/* Ana Görsel & Karşılaştırma Alanı */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sol Kolon: Canvas veya Split Karşılaştırma */}
        <div className="lg:col-span-7 bg-neutral-900/60 p-4 lg:p-6 rounded-3xl border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-neutral-400" />
              <span className="text-sm font-semibold text-white">İnteraktif Görsel Katmanlar</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSplitMode(!isSplitMode)}
                className={`px-3 py-1 rounded-lg border text-[10px] font-semibold flex items-center gap-1 transition-all ${
                  isSplitMode ? 'bg-white text-neutral-950 border-white' : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                }`}
              >
                <SplitSquareVertical className="w-3.5 h-3.5" />
                {isSplitMode ? 'Tekli Görünüme Dön' : 'Öncesi / Sonrası Karşılaştır'}
              </button>

              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 text-[10px] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Güven: %{activeAnalysis.confidenceScore}
              </span>
            </div>
          </div>

          {!isSplitMode ? (
            <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 flex items-center justify-center min-h-[320px]">
              <canvas ref={canvasRef} className="w-full h-auto max-h-[420px] object-cover" />

              <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-neutral-900/90 backdrop-blur-md border border-neutral-700/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-[10px] uppercase font-semibold text-neutral-400 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" />
                  Görsel Filtreler:
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowRednessOverlay(!showRednessOverlay)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                      showRednessOverlay ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                    }`}
                  >
                    Kızarıklık Haritası
                  </button>
                  <button
                    onClick={() => setShowBoundaries(!showBoundaries)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                      showBoundaries ? 'bg-neutral-700 text-neutral-100 border-neutral-600' : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                    }`}
                  >
                    İşaretçiler
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 h-[360px] select-none">
              <img src={baselineAnalysis.photoUrl} alt="Başlangıç" className="absolute inset-0 w-full h-full object-cover" />
              <span className="absolute top-3 left-3 bg-rose-600 text-white font-semibold text-[10px] px-2.5 py-1 rounded-lg shadow">
                Başlangıç ({baselineAnalysis.timestamp})
              </span>

              <div className="absolute inset-0 overflow-hidden" style={{ width: `${splitPos}%` }}>
                <img
                  src={activeAnalysis.photoUrl}
                  alt="Güncel Durum"
                  className="absolute inset-0 w-full h-full object-cover max-w-none"
                  style={{ width: '600px' }}
                />
                <span className="absolute top-3 left-3 bg-emerald-600 text-white font-semibold text-[10px] px-2.5 py-1 rounded-lg shadow">
                  Güncel Durum ({activeAnalysis.timestamp})
                </span>
              </div>

              <div className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20" style={{ left: `${splitPos}%` }}>
                <div className="w-6 h-6 rounded-full bg-white text-neutral-950 flex items-center justify-center -ml-2.5 top-1/2 relative shadow">
                  <SplitSquareVertical className="w-3.5 h-3.5" />
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={splitPos}
                onChange={e => setSplitPos(parseFloat(e.target.value))}
                className="absolute bottom-4 left-6 right-6 accent-white z-30 opacity-80 hover:opacity-100 cursor-pointer"
              />
            </div>
          )}

          {/* Zaman Tüneli Sürgüsü */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                İyileşme Zaman Tüneli ({locationHistory.length} Kayıtlı Tarama)
              </span>
              <button
                onClick={() => setIsPlayingTimeLapse(!isPlayingTimeLapse)}
                className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-[10px] flex items-center gap-1 border border-neutral-700"
              >
                {isPlayingTimeLapse ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                {isPlayingTimeLapse ? 'Duraklat' : 'Animasyonu Oynat'}
              </button>
            </div>

            <input
              type="range"
              min={0}
              max={Math.max(0, locationHistory.length - 1)}
              value={timeLapseIndex}
              onChange={(e) => {
                const idx = parseInt(e.target.value);
                setTimeLapseIndex(idx);
                if (locationHistory[idx]) setActiveAnalysis(locationHistory[idx]);
              }}
              className="w-full accent-neutral-300 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-500">
              <span>İlk Kayıt</span>
              <span>Son Tarama ({activeAnalysis.timestamp})</span>
            </div>
          </div>
        </div>

        {/* Sağ Kolon: Klinik Parametre Ölçümleri */}
        <div className="lg:col-span-5 bg-neutral-900/60 p-6 rounded-3xl border border-neutral-800 space-y-6">
          <div>
            <span className="text-[10px] uppercase font-semibold text-neutral-500 tracking-wider">
              Tarama Tarihi: {activeAnalysis.timestamp}
            </span>
            <h3 className="text-lg font-semibold text-white mt-0.5">
              Ölçülen Parametreler
            </h3>
            <p className="text-xs text-neutral-400">
              {activeAnalysis.location} için görüntü tabanlı ölçüm değerleri
              {activeAnalysis.analysisMethod === 'canlı-piksel-analizi' ? ' (canlı piksel analizi)' : ' (örnek veri)'}.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Kızarıklık (Eritem)', val: activeAnalysis.redness, color: 'bg-rose-500' },
              { label: 'Cilt Kuruluğu (Kserozis)', val: activeAnalysis.dryness, color: 'bg-amber-500' },
              { label: 'Soyulma & Kepeklenme', val: activeAnalysis.scaling, color: 'bg-yellow-500' },
              { label: 'Deri Çatlaması (Fissür)', val: activeAnalysis.cracking, color: 'bg-orange-500' },
              { label: 'Sızıntı / Akıntı', val: activeAnalysis.oozing, color: 'bg-cyan-500' },
              { label: 'Şişlik (Ödem)', val: activeAnalysis.swelling, color: 'bg-neutral-500' },
              { label: 'Lekelenme (Pigmentasyon)', val: activeAnalysis.pigmentation, color: 'bg-neutral-400' }
            ].map(m => (
              <div key={m.label} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-neutral-300">{m.label}</span>
                  <span className="text-neutral-400">%{m.val}</span>
                </div>
                <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                  <div className={`h-full ${m.color} transition-all duration-500`} style={{ width: `${m.val}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* SCORAD & Alan Metrikleri */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-semibold uppercase text-neutral-500 block">SCORAD Skoru</span>
              <span className="text-xl font-semibold text-white">{activeAnalysis.scoradIndex}</span>
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-neutral-500 block">Etkilenen Alan</span>
              <span className="text-xl font-semibold text-emerald-400">{activeAnalysis.surfaceAreaCm2} cm²</span>
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-neutral-500 block">Enfeksiyon Riski</span>
              <span className={`text-sm font-semibold ${activeAnalysis.infectionRisk === 'Yüksek' ? 'text-rose-400' : activeAnalysis.infectionRisk === 'Orta' ? 'text-amber-400' : 'text-emerald-400'}`}>
                {activeAnalysis.infectionRisk}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-neutral-500 block">Başlangıca Göre İyileşme</span>
              <span className="text-sm font-semibold text-neutral-200">%{activeAnalysis.healingProgression}</span>
            </div>
          </div>

          {/* Not */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1.5">
            <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Analiz Notu:
            </span>
            <p className="text-xs text-neutral-400 leading-relaxed italic">
              "{activeAnalysis.notes}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
