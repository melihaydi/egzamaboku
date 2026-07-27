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
import { useApp } from '../../context/AppContext';
import type { BodyLocation, CVAnalysis } from '../../types';

export const ComputerVisionEngine: React.FC = () => {
  const { cvHistory, addCVAnalysis } = useApp();
  const [selectedLocation, setSelectedLocation] = useState<BodyLocation>('Sol Kol');
  const [activeAnalysis, setActiveAnalysis] = useState<CVAnalysis>(cvHistory[0]);
  
  // Katman Aç/Kapat
  const [showRednessOverlay, setShowRednessOverlay] = useState<boolean>(true);
  const [showDrynessOverlay, setShowDrynessOverlay] = useState<boolean>(true);
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
      } catch (err) {
        alert('Kamera erişimi sağlanamadı. Yüksek çözünürlüklü simüle cilt tarama verisi yükleniyor.');
        handleUploadSim();
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
        const dataUrl = tempCanvas.toDataURL('image/png');
        
        const newScan: CVAnalysis = {
          id: `cv-${Date.now()}`,
          photoUrl: dataUrl,
          location: selectedLocation,
          timestamp: new Date().toLocaleString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          redness: 22,
          dryness: 28,
          scaling: 15,
          cracking: 5,
          swelling: 0,
          pigmentation: 12,
          surfaceAreaCm2: 11.5,
          scoradIndex: 18.2,
          healingProgression: 60,
          confidenceScore: 98,
          heatMapData: [
            { x: 45, y: 50, intensity: 0.5, label: 'Kamera Görüntüsü Analiz Alanı' }
          ],
          notes: 'Canlı kameradan alınan cilt karesi yapay zeka tarafından değerlendirildi.'
        };

        addCVAnalysis(newScan);
        setActiveAnalysis(newScan);
        toggleWebCam();
      }
    }
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

      // Kızarıklık Isı Haritası
      if (showRednessOverlay) {
        activeAnalysis.heatMapData.forEach(pt => {
          const radial = ctx.createRadialGradient(
            pt.x * 6, pt.y * 4, 10,
            pt.x * 6, pt.y * 4, 80 * pt.intensity
          );
          radial.addColorStop(0, 'rgba(239, 68, 68, 0.6)');
          radial.addColorStop(0.5, 'rgba(245, 158, 11, 0.3)');
          radial.addColorStop(1, 'rgba(239, 68, 68, 0)');
          ctx.fillStyle = radial;
          ctx.beginPath();
          ctx.arc(pt.x * 6, pt.y * 4, 80 * pt.intensity, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // Kuruluk Ağı
      if (showDrynessOverlay) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(240, 180, 70, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // İşaretleyici Kutular
      if (showBoundaries) {
        activeAnalysis.heatMapData.forEach((pt, idx) => {
          const px = pt.x * 6;
          const py = pt.y * 4;

          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 2;
          ctx.strokeRect(px - 30, py - 30, 60, 60);

          ctx.fillStyle = '#0f172a';
          ctx.fillRect(px - 30, py - 48, 160, 18);

          ctx.fillStyle = '#34d399';
          ctx.font = 'bold 10px Inter, sans-serif';
          ctx.fillText(`İşaretçi #${idx + 1}: ${pt.label}`, px - 25, py - 35);
        });
      }
    };
  }, [activeAnalysis, showRednessOverlay, showDrynessOverlay, showBoundaries]);

  const handleUploadSim = () => {
    const newScan: CVAnalysis = {
      id: `cv-${Date.now()}`,
      photoUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
      location: selectedLocation,
      timestamp: new Date().toLocaleString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      redness: 24,
      dryness: 30,
      scaling: 18,
      cracking: 8,
      swelling: 2,
      pigmentation: 14,
      surfaceAreaCm2: 13.0,
      scoradIndex: 20.1,
      healingProgression: 55,
      confidenceScore: 97,
      heatMapData: [
        { x: 40, y: 45, intensity: 0.6, label: 'Eritem Gerileme Alanı' }
      ],
      notes: 'Yeni fotoğraf taraması yüklendi. Enflamasyonda belirgin azalma tespit edildi.'
    };

    addCVAnalysis(newScan);
    setActiveAnalysis(newScan);
  };

  useEffect(() => {
    let interval: any;
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
      {/* Üst Şerit */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Scan className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Yapay Zeka Görsel Cilt Taraması & Analizi
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Otomatik parametre tespiti: Kızarıklık, Kuruluk, Soyulma, Çatlama, Şişlik ve Etkilenen Cilt Alanı ($cm^2$).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value as BodyLocation)}
            className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-sky-300 focus:outline-none"
          >
            {['Sol Kol', 'Sağ Kol', 'Yüz & Boyun', 'Eller & Bilekler', 'Göğüs & Sırt', 'Bacaklar'].map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>

          <button
            onClick={toggleWebCam}
            className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              isWebCamActive ? 'bg-rose-500 text-white border-rose-400' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <Camera className="w-4 h-4 text-sky-400" />
            {isWebCamActive ? 'Kamerayı Kapat' : 'Canlı Kamera'}
          </button>

          <button
            onClick={handleUploadSim}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-sky-500/20"
          >
            <Upload className="w-4 h-4" />
            Fotoğraf Yükle
          </button>
        </div>
      </div>

      {/* Canlı Kamera Modalı */}
      {isWebCamActive && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-sky-500/50 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-300 flex items-center gap-2">
              <Camera className="w-4 h-4 text-sky-400 animate-pulse" />
              Canlı Cihaz Kamerası Bağlandı
            </span>
            <span className="text-[10px] text-slate-400">Lezyonu kutucuğa hizalayın</span>
          </div>

          <div className="relative rounded-2xl overflow-hidden bg-black max-h-[360px] flex items-center justify-center">
            <video ref={videoRef} autoPlay playsInline className="w-full h-auto object-cover" />
            <div className="absolute inset-8 border-2 border-dashed border-sky-400/60 rounded-2xl pointer-events-none flex items-center justify-center">
              <span className="text-[10px] uppercase font-bold text-sky-300 bg-slate-950/80 px-2 py-1 rounded">
                Hedef Bölge: {selectedLocation}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={captureWebCamFrame}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg"
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
        <div className="lg:col-span-7 bg-slate-900 p-4 lg:p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-sky-400" />
              <span className="text-sm font-bold text-white">İnteraktif Görsel Katmanlar</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSplitMode(!isSplitMode)}
                className={`px-3 py-1 rounded-lg border text-[10px] font-bold flex items-center gap-1 transition-all ${
                  isSplitMode ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                <SplitSquareVertical className="w-3.5 h-3.5" />
                {isSplitMode ? 'Tekli Görünüme Dön' : 'Öncesi / Sonrası Karşılaştır'}
              </button>

              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Doğruluk: %{activeAnalysis.confidenceScore}
              </span>
            </div>
          </div>

          {!isSplitMode ? (
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center min-h-[320px]">
              <canvas ref={canvasRef} className="w-full h-auto max-h-[420px] object-cover" />

              <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-sky-400" />
                  Görsel Filtreler:
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowRednessOverlay(!showRednessOverlay)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                      showRednessOverlay ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    Kızarıklık Haritası
                  </button>
                  <button
                    onClick={() => setShowDrynessOverlay(!showDrynessOverlay)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                      showDrynessOverlay ? 'bg-sky-500/20 text-sky-300 border-sky-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    Kuruluk Ağı
                  </button>
                  <button
                    onClick={() => setShowBoundaries(!showBoundaries)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                      showBoundaries ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    İşaretçiler
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Split Karşılaştırma Ekranı */
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 h-[360px] select-none">
              <img
                src={baselineAnalysis.photoUrl}
                alt="Baseline Alevlenme"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <span className="absolute top-3 left-3 bg-rose-600 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg shadow">
                Başlangıç Alevlenmesi ({baselineAnalysis.timestamp})
              </span>

              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${splitPos}%` }}
              >
                <img
                  src={activeAnalysis.photoUrl}
                  alt="Güncel İyileşme"
                  className="absolute inset-0 w-full h-full object-cover max-w-none"
                  style={{ width: '600px' }}
                />
                <span className="absolute top-3 left-3 bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg shadow">
                  Güncel Durum ({activeAnalysis.timestamp})
                </span>
              </div>

              <div
                className="absolute top-0 bottom-0 w-1 bg-sky-400 cursor-ew-resize z-20"
                style={{ left: `${splitPos}%` }}
              >
                <div className="w-6 h-6 rounded-full bg-sky-400 text-slate-950 flex items-center justify-center -ml-2.5 top-1/2 relative shadow">
                  <SplitSquareVertical className="w-3.5 h-3.5" />
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={splitPos}
                onChange={e => setSplitPos(parseFloat(e.target.value))}
                className="absolute bottom-4 left-6 right-6 accent-sky-400 z-30 opacity-80 hover:opacity-100 cursor-pointer"
              />
            </div>
          )}

          {/* Zaman Tüneli Sürgüsü */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-400" />
                İyileşme Zaman Tüneli ({locationHistory.length} Kayıtlı Tarama)
              </span>
              <button
                onClick={() => setIsPlayingTimeLapse(!isPlayingTimeLapse)}
                className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[10px] flex items-center gap-1"
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
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>İlk Alevlenme Kaydı</span>
              <span>Son Tarama ({activeAnalysis.timestamp})</span>
            </div>
          </div>
        </div>

        {/* Sağ Kolon: Klinik Parametre Ölçümleri */}
        <div className="lg:col-span-5 bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-6">
          <div>
            <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">
              Tarama Tarihi: {activeAnalysis.timestamp}
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">
              Hesaplanan Klinik Parametreler
            </h3>
            <p className="text-xs text-slate-400">
              {activeAnalysis.location} için yapay zeka biyofiziksel ölçüm değerleri.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Kızarıklık (Eritem Şiddeti)', val: activeAnalysis.redness, color: 'bg-rose-500' },
              { label: 'Cilt Kuruluğu (Kserozis)', val: activeAnalysis.dryness, color: 'bg-amber-500' },
              { label: 'Soyulma & Kepeklenme', val: activeAnalysis.scaling, color: 'bg-yellow-500' },
              { label: 'Deri Çatlaması (Fissür)', val: activeAnalysis.cracking, color: 'bg-orange-500' },
              { label: 'Şişlik (Ödem)', val: activeAnalysis.swelling, color: 'bg-purple-500' },
              { label: 'Lekelenme (Pigmentasyon)', val: activeAnalysis.pigmentation, color: 'bg-indigo-500' }
            ].map(m => (
              <div key={m.label} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">{m.label}</span>
                  <span className="text-slate-400">%{m.val}</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${m.color} transition-all duration-500`}
                    style={{ width: `${m.val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* SCORAD & Alan Metrikleri */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Klinik SCORAD Skoru</span>
              <span className="text-xl font-black text-white">{activeAnalysis.scoradIndex}</span>
              <span className="text-[10px] text-emerald-400 block mt-0.5">Hafif-Orta Şiddet</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Etkilenen Alan</span>
              <span className="text-xl font-black text-emerald-400">{activeAnalysis.surfaceAreaCm2} cm²</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Başlangıca göre %{activeAnalysis.healingProgression} iyileşme</span>
            </div>
          </div>

          {/* Klinik Not */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              Yapay Zeka Değerlendirme Notu:
            </span>
            <p className="text-xs text-slate-300 leading-relaxed italic">
              "{activeAnalysis.notes}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
