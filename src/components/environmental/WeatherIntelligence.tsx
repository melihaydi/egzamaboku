import React, { useState } from 'react';
import {
  CloudSun,
  Sun,
  Sparkles,
  TreePine,
  Activity,
  AlertTriangle,
  Info,
  MapPin,
  RefreshCw,
  Gauge,
  Leaf,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '../../context/useApp';

const getPollenLevel = (val: number): 'Düşük' | 'Orta' | 'Yüksek' | 'Çok Yüksek' => {
  if (val > 25) return 'Çok Yüksek';
  if (val > 10) return 'Yüksek';
  if (val > 3) return 'Orta';
  return 'Düşük';
};

interface Alert {
  level: 'yuksek' | 'orta';
  title: string;
  effect: string;
}

export const WeatherIntelligence: React.FC = () => {
  const { environmental, environmentalLoading, refreshEnvironmental, t } = useApp();
  const [selectedDay, setSelectedDay] = useState<number>(0);

  const activeForecast = environmental.forecast[selectedDay];

  const alerts: Alert[] = [];
  if (environmental.aqi.category === 'Çok Sağlıksız' || environmental.aqi.category === 'Sağlıksız') {
    alerts.push({
      level: 'yuksek',
      title: `Bugün hava kalitesi kötü (${environmental.aqi.category}, AQI ${Math.round(environmental.aqi.overall)})`,
      effect: 'İnce parçacıklar (PM2.5/PM10) zayıflamış cilt bariyerinden nüfuz ederek oksidatif stres ve kaşıntı artışına yol açabilir. Mümkünse dışarıda geçirilen süreyi kısaltın ve eve girince cildinizi durulayın.'
    });
  } else if (environmental.aqi.category === 'Hassas Gruplar İçin Riskli') {
    alerts.push({
      level: 'orta',
      title: `Hava kalitesi hassas gruplar için riskli (AQI ${Math.round(environmental.aqi.overall)})`,
      effect: 'Egzama gibi bariyer bozukluğu olan ciltlerde hafif tahriş/kaşıntı artışı görülebilir; yoğun trafik saatlerinde dışarıda uzun süre kalmaktan kaçının.'
    });
  }
  if (environmental.pollen.overallRisk === 'Çok Yüksek' || environmental.pollen.overallRisk === 'Yüksek') {
    alerts.push({
      level: environmental.pollen.overallRisk === 'Çok Yüksek' ? 'yuksek' : 'orta',
      title: `Bugün polen yoğunluğu ${environmental.pollen.overallRisk.toLowerCase()}`,
      effect: 'Polen, alerjik/atopik ciltlerde histamin salınımını tetikleyerek kaşıntı ve kızarıklığı artırabilir. Dışarıdan gelince yüz ve saçları durulamak, pencereleri polen yoğun saatlerde kapalı tutmak faydalı olabilir.'
    });
  }
  if (environmental.uvIndex > 7) {
    alerts.push({
      level: 'orta',
      title: `Bugün UV indeksi yüksek (${environmental.uvIndex.toFixed(1)})`,
      effect: 'Yüksek UV, zaten zayıflamış cilt bariyerinde ek kuruma ve tahrişe yol açabilir. Mineral bazlı (çinko oksit/titanyum dioksit) güneş kremi ve gölgede kalmak önerilir.'
    });
  }
  if (environmental.humidity < 30) {
    alerts.push({
      level: 'orta',
      title: `Bugün hava çok kuru (%${Math.round(environmental.humidity)} nem)`,
      effect: 'Düşük nem, ciltteki su kaybını (TEWL) hızlandırarak kuruluk ve çatlamayı artırabilir. Nemlendiriciyi normalden daha sık uygulamak faydalı olur.'
    });
  }

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
      {/* Üst Şerit & Günlük Görünüm */}
      <div className="bg-neutral-900/60 p-6 md:p-8 rounded-3xl border border-neutral-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-neutral-800 text-neutral-300 border border-neutral-700">
                <CloudSun className="w-6 h-6" />
              </span>
              <div>
                <h2 className="text-xl font-semibold text-white tracking-tight">
                  {t('title.environmental')}
                </h2>
                <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {environmental.city} • {environmental.dataSource === 'canlı-api' ? 'Canlı Ölçüm' : 'Yedek Veri (bağlantı bekleniyor)'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-2xl bg-neutral-950 p-1 border border-neutral-800">
              {environmental.forecast.map((fc, idx) => (
                <button
                  key={fc.day}
                  onClick={() => setSelectedDay(idx)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    selectedDay === idx ? 'bg-white text-neutral-950 shadow' : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {fc.day}
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

        <p className="text-[11px] text-neutral-500 leading-relaxed">
          Bu bölüm yalnızca ölçülen/tahmin edilen meteorolojik ve hava kalitesi verilerini gösterir. Bir alevlenme olasılığı hesaplanmaz veya tahmin edilmez — bu tür tahminler yeterli klinik kanıt olmadan yanıltıcı olabilir.
        </p>
      </div>

      {/* Bugüne Ait Önemli Uyarılar */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border flex items-start gap-3 ${
                a.level === 'yuksek' ? 'bg-rose-500/8 border-rose-500/30' : 'bg-amber-500/8 border-amber-500/30'
              }`}
            >
              <ShieldAlert className={`w-4 h-4 shrink-0 mt-0.5 ${a.level === 'yuksek' ? 'text-rose-400' : 'text-amber-400'}`} />
              <div>
                <p className={`text-sm font-semibold ${a.level === 'yuksek' ? 'text-rose-200' : 'text-amber-200'}`}>{a.title}</p>
                <p className="text-xs text-neutral-300 mt-1 leading-relaxed">{a.effect}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Metrikler Izgarası */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Hava Durumu */}
        <div className="bg-neutral-900/60 p-6 rounded-3xl border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sun className="w-4 h-4 text-neutral-500" />
              Hava Durumu
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 font-semibold">{activeForecast.day}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
              <span className="text-[10px] text-neutral-500 block">Sıcaklık</span>
              <span className="text-xl font-semibold text-white">{Math.round(activeForecast.temp)}°C</span>
            </div>
            <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
              <span className="text-[10px] text-neutral-500 block">Bağıl Nem</span>
              <span className="text-xl font-semibold text-white">%{Math.round(activeForecast.humidity)}</span>
            </div>
            <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
              <span className="text-[10px] text-neutral-500 block">UV İndeksi</span>
              <span className="text-xl font-semibold text-white">{activeForecast.uvIndex.toFixed(1)} / 12</span>
            </div>
            <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
              <span className="text-[10px] text-neutral-500 block flex items-center gap-1"><Gauge className="w-3 h-3" /> Basınç</span>
              <span className="text-xl font-semibold text-white">{Math.round(activeForecast.pressure)} hPa</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 space-y-1">
            <p className="font-semibold text-neutral-200 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-neutral-500" />
              Genel Bilgi:
            </p>
            <p className="text-[11px] leading-relaxed text-neutral-400">
              {activeForecast.humidity < 40
                ? `Nem oranı düşük (%${Math.round(activeForecast.humidity)}). Düşük nem cildin su kaybını artırabilir.`
                : `Nem oranı %${Math.round(activeForecast.humidity)}.`}
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
              {environmental.pollen.overallRisk}
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
            <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between opacity-60">
              <span className="text-xs font-medium text-neutral-400 flex items-center gap-1.5"><Leaf className="w-3.5 h-3.5" /> Küf Sporları</span>
              <span className="text-[10px] text-neutral-500">Bu kaynakta mevcut değil</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 space-y-1">
            <p className="font-semibold flex items-center gap-1 text-neutral-200">
              <AlertTriangle className="w-3.5 h-3.5 text-neutral-500" />
              Not:
            </p>
            <p className="text-[11px] leading-relaxed text-neutral-400">
              Dışarıdan eve geldiğinde cildini ve saçlarını ılık suyla durulamak polen maruziyetini azaltabilir.
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
              Cilt Sağlığı Bilgisi:
            </p>
            <p className="text-[11px] leading-relaxed text-neutral-400">
              PM2.5 parçacıkları zayıflamış cilt bariyerinden nüfuz ederek oksidatif stresi artırabilir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
