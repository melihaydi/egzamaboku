import React, { useState } from 'react';
import {
  CloudSun,
  Sun,
  ShieldAlert,
  Sparkles,
  TreePine,
  Activity,
  AlertTriangle,
  Info,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../../context/useApp';

const getPollenLevel = (val: number): 'Düşük' | 'Orta' | 'Yüksek' | 'Çok Yüksek' => {
  if (val > 25) return 'Çok Yüksek';
  if (val > 10) return 'Yüksek';
  if (val > 3) return 'Orta';
  return 'Düşük';
};

export const WeatherIntelligence: React.FC = () => {
  const { environmental, environmentalLoading, refreshEnvironmental } = useApp();
  const [selectedDay, setSelectedDay] = useState<number>(0);

  const activeForecast = environmental.forecast72h[selectedDay];

  const getPollenBadge = (lvl: string) => {
    switch (lvl) {
      case 'Çok Yüksek': return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
      case 'Yüksek': return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'Orta': return 'bg-neutral-800 text-neutral-300 border-neutral-700';
      default: return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Üst Şerit & 72 Saatlik Tahmin */}
      <div className="bg-neutral-900/60 p-6 md:p-8 rounded-3xl border border-neutral-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-neutral-800 text-neutral-300 border border-neutral-700">
                <CloudSun className="w-6 h-6" />
              </span>
              <div>
                <h2 className="text-xl font-semibold text-white tracking-tight">
                  72 Saatlik Alevlenme Tahmini
                </h2>
                <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {environmental.city} • {environmental.dataSource === 'canlı-api' ? 'Canlı Hava/AQI/Polen Verisi' : 'Yedek Veri (bağlantı bekleniyor)'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-2xl bg-neutral-950 p-1 border border-neutral-800">
              {environmental.forecast72h.map((fc, idx) => (
                <button
                  key={fc.day}
                  onClick={() => setSelectedDay(idx)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-0.5 ${
                    selectedDay === idx ? 'bg-white text-neutral-950 shadow' : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <span>{fc.day}</span>
                  <span className={`text-[10px] px-1.5 rounded ${fc.flareRisk > 40 ? 'bg-rose-500/70 text-white' : 'bg-emerald-500/70 text-white'}`}>
                    Risk: %{fc.flareRisk}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={refreshEnvironmental}
              disabled={environmentalLoading}
              title="Verileri Yenile"
              className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300"
            >
              <RefreshCw className={`w-4 h-4 ${environmentalLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          activeForecast.flareRisk > 40 ? 'bg-rose-500/5 border-rose-500/30 text-rose-200' : 'bg-emerald-500/5 border-emerald-500/25 text-emerald-200'
        }`}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-neutral-400" />
              <span className="font-semibold text-sm text-white">
                {activeForecast.flareRisk > 40 ? 'Yüksek Alevlenme Riski' : 'Uygun Cilt Mikroklima'}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-neutral-300">
              Bu gün için tahmini alevlenme riski: <strong>%{activeForecast.flareRisk}</strong>. Ana etken: {activeForecast.primaryDriver}.
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] font-semibold uppercase text-neutral-500 block">Ana Risk Etkeni</span>
            <span className="text-sm font-semibold text-neutral-200">{activeForecast.primaryDriver}</span>
          </div>
        </div>
      </div>

      {/* Metrikler Izgarası */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Hava Durumu */}
        <div className="bg-neutral-900/60 p-6 rounded-3xl border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sun className="w-4 h-4 text-neutral-500" />
              Hava Faktörleri
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 font-semibold">Anlık</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
              <span className="text-[10px] text-neutral-500 block">Sıcaklık</span>
              <span className="text-xl font-semibold text-white">{Math.round(environmental.temperature)}°C</span>
            </div>
            <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
              <span className="text-[10px] text-neutral-500 block">Bağıl Nem</span>
              <span className="text-xl font-semibold text-white">%{Math.round(environmental.humidity)}</span>
            </div>
            <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
              <span className="text-[10px] text-neutral-500 block">UV İndeksi</span>
              <span className="text-xl font-semibold text-white">{environmental.uvIndex.toFixed(1)} / 12</span>
            </div>
            <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
              <span className="text-[10px] text-neutral-500 block">Rüzgar</span>
              <span className="text-xl font-semibold text-white">{Math.round(environmental.windSpeed)} km/s</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 space-y-1">
            <p className="font-semibold text-neutral-200 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-neutral-500" />
              Kişisel Tavsiye:
            </p>
            <p className="text-[11px] leading-relaxed text-neutral-400">
              {environmental.humidity < 40
                ? `Nem oranı düşük (%${Math.round(environmental.humidity)}). Nemlendiricini normalden daha sık uygula.`
                : `Nem oranı dengeli (%${Math.round(environmental.humidity)}). Banyodan sonraki ilk 3 dakika içinde nemlendirici uygulamaya devam et.`}
            </p>
          </div>
        </div>

        {/* Polen İstihbaratı */}
        <div className="bg-neutral-900/60 p-6 rounded-3xl border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <TreePine className="w-4 h-4 text-neutral-500" />
              Polen Durumu
            </h3>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${getPollenBadge(environmental.pollen.overallRisk)}`}>
              Risk: {environmental.pollen.overallRisk}
            </span>
          </div>

          <div className="space-y-2.5">
            {[
              { label: 'Ağaç Poleni', val: environmental.pollen.tree },
              { label: 'Çim Poleni', val: environmental.pollen.grass },
              { label: 'Yabani Ot Poleni', val: environmental.pollen.weed }
            ].map(p => (
              <div key={p.label} className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-300">{p.label}</span>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg border ${getPollenBadge(getPollenLevel(p.val))}`}>
                  {getPollenLevel(p.val)} ({p.val.toFixed(1)})
                </span>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 space-y-1">
            <p className="font-semibold flex items-center gap-1 text-neutral-200">
              <AlertTriangle className="w-3.5 h-3.5 text-neutral-500" />
              Polen Notu:
            </p>
            <p className="text-[11px] leading-relaxed text-neutral-400">
              Dışarıdan eve geldiğinde cildini ve saçlarını ılık suyla durulamak polen maruziyetini azaltır.
            </p>
          </div>
        </div>

        {/* Hava Kalitesi (AQI) */}
        <div className="bg-neutral-900/60 p-6 rounded-3xl border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-neutral-500" />
              Hava Kalitesi (Avrupa AQI)
            </h3>
            <span className="text-xs font-semibold text-neutral-200 px-2 py-0.5 rounded-md bg-neutral-800 border border-neutral-700">
              {environmental.aqi.category} ({Math.round(environmental.aqi.overall)})
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
              <span className="text-[10px] text-neutral-500 block">PM2.5</span>
              <span className="text-lg font-semibold text-white">{environmental.aqi.pm25.toFixed(1)} µg/m³</span>
            </div>
            <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
              <span className="text-[10px] text-neutral-500 block">PM10</span>
              <span className="text-lg font-semibold text-white">{environmental.aqi.pm10.toFixed(1)} µg/m³</span>
            </div>
            <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
              <span className="text-[10px] text-neutral-500 block">Yağış İhtimali</span>
              <span className="text-lg font-semibold text-white">%{Math.round(environmental.precipitationProbability)}</span>
            </div>
            <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
              <span className="text-[10px] text-neutral-500 block">Son Güncelleme</span>
              <span className="text-[11px] font-semibold text-white">{environmental.fetchedAt.split(',')[1] || environmental.fetchedAt}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 space-y-1">
            <p className="font-semibold text-neutral-200 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-neutral-500" />
              Cilt Sağlığı İpucu:
            </p>
            <p className="text-[11px] leading-relaxed text-neutral-400">
              PM2.5 parçacıkları zayıflamış cilt bariyerinden nüfuz ederek oksidatif stresi artırabilir; kirlilik yüksekken dışarıda geçirilen süreyi sınırlamak faydalı olabilir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
