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
  MapPin
} from 'lucide-react';
import { useApp } from '../../context/useApp';

export const WeatherIntelligence: React.FC = () => {
  const { environmental } = useApp();
  const [selectedDay, setSelectedDay] = useState<number>(0);

  const activeForecast = environmental.forecast72h[selectedDay];

  const getPollenBadge = (lvl: string) => {
    switch (lvl) {
      case 'Çok Yüksek': return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'Yüksek': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Orta': return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      default: return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  return (
    <div className="space-y-6">
      {/* Üst Şerit & 72 Saatlik Tahmin */}
      <div className="bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <CloudSun className="w-6 h-6" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  72 Saatlik Yapay Zeka Alevlenme Tahmini & Çevre İstihbaratı
                </h2>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-400" />
                  {environmental.city} • Canlı Anlık Hava Durumu & Polen Verisi
                </p>
              </div>
            </div>
          </div>

          {/* Gün Seçici */}
          <div className="flex rounded-2xl bg-slate-950 p-1 border border-slate-800">
            {environmental.forecast72h.map((fc, idx) => (
              <button
                key={fc.day}
                onClick={() => setSelectedDay(idx)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-0.5 ${
                  selectedDay === idx
                    ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{fc.day}</span>
                <span className={`text-[10px] px-1.5 rounded ${
                  fc.flareRisk > 40 ? 'bg-rose-500/40 text-white' : 'bg-emerald-500/40 text-white'
                }`}>
                  Risk: %{fc.flareRisk}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Tahmin Uyarı Kutusu */}
        <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          activeForecast.flareRisk > 40 
            ? 'bg-rose-950/40 border-rose-500/50 text-rose-200' 
            : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
        }`}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <span className="font-bold text-sm text-white">
                {activeForecast.flareRisk > 40 
                  ? 'Yüksek Cilt Alevlenme Riski Tespiti' 
                  : 'Uygun Cilt Mikrokliması Tespiti'}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-300">
              "{activeForecast.flareRisk > 40
                ? `Düşük nem oranı (%${activeForecast.humidity}) ve yüksek ağaç poleni cildinizde kaşıntı ve irritasyonu artırabilir.`
                : 'Dengeli bağıl nem ve ılık sıcaklık cilt nem kaybını (TEWL) minimuma indiriyor.'}"
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Ana Risk Etkeni</span>
            <span className="text-sm font-black text-amber-300">{activeForecast.primaryDriver}</span>
          </div>
        </div>
      </div>

      {/* Metrikler Izgarası */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Hava Durumu */}
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" />
              Hava Faktörleri
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-semibold">
              Anlık
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Sıcaklık</span>
              <span className="text-xl font-bold text-white">{environmental.temperature}°C</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Bağıl Nem</span>
              <span className="text-xl font-bold text-sky-400">%{environmental.humidity}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">UV İndeksi</span>
              <span className="text-xl font-bold text-amber-400">{environmental.uvIndex} / 12</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Rüzgar Hızı</span>
              <span className="text-xl font-bold text-slate-300">{environmental.windSpeed} km/s</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
            <p className="font-semibold text-sky-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              Kişisel Tavsiye:
            </p>
            <p className="text-[11px] leading-relaxed text-slate-400">
              "Nem oranı dengeli (%{environmental.humidity}). Nemlendiricinizi banyodan sonraki ilk 3 dakika içinde uygulayarak bariyeri mühürleyin."
            </p>
          </div>
        </div>

        {/* Polen İstihbaratı */}
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TreePine className="w-4 h-4 text-emerald-400" />
              Polen Durumu
            </h3>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${getPollenBadge(environmental.pollen.overallRisk)}`}>
              Risk: {environmental.pollen.overallRisk}
            </span>
          </div>

          <div className="space-y-2.5">
            {[
              { label: 'Ağaç Poleni', val: environmental.pollen.tree },
              { label: 'Çim Poleni', val: environmental.pollen.grass },
              { label: 'Yabani Ot Poleni', val: environmental.pollen.weed }
            ].map(p => (
              <div key={p.label} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">{p.label}</span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border ${getPollenBadge(p.val)}`}>
                  {p.val}
                </span>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 space-y-1">
            <p className="font-semibold flex items-center gap-1 text-amber-300">
              <AlertTriangle className="w-3.5 h-3.5" />
              Polen Uyarısı:
            </p>
            <p className="text-[11px] leading-relaxed text-slate-300">
              Ağaç polenleri yüksek seviyede. Dışarıdan eve geldiğinizde cildinizi ve saçlarınızı ılık suyla durulayın.
            </p>
          </div>
        </div>

        {/* Hava Kalitesi (AQI) */}
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-400" />
              Hava Kalitesi İndeksi (AQI)
            </h3>
            <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30">
              {environmental.aqi.category} ({environmental.aqi.overall})
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">PM2.5 İnce Toz</span>
              <span className="text-lg font-bold text-white">{environmental.aqi.pm25} µg/m³</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">PM10 Kaba Toz</span>
              <span className="text-lg font-bold text-white">{environmental.aqi.pm10} µg/m³</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Ozon (O₃)</span>
              <span className="text-lg font-bold text-white">{environmental.aqi.ozone} ppb</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Azot Dioksit</span>
              <span className="text-lg font-bold text-white">{environmental.aqi.no2} ppb</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
            <p className="font-semibold text-slate-200 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-sky-400" />
              Cilt Sağlığı İpucu:
            </p>
            <p className="text-[11px] leading-relaxed text-slate-400">
              PM2.5 toz parçacıkları zayıflamış cilt bariyerinden nüfuz ederek oksidatif stresi artırabilir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
