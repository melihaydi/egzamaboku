import React, { useMemo } from 'react';
import { Sparkles, TrendingUp, Database, Info } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useApp } from '../../context/useApp';
import { buildInsights, dataReadiness } from '../../lib/insightsEngine';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const READINESS_TARGETS = {
  symptomDays: 7,
  environmentalDays: 7,
  triggerLogs: 2,
  mealLogs: 3,
  photoScans: 4
};

export const InsightsPanel: React.FC = () => {
  const { symptomEntries, triggerEntries, meals, cvHistory, environmentalHistory } = useApp();

  const insights = useMemo(
    () => buildInsights({ symptomEntries, triggerEntries, meals, cvHistory, environmentalHistory }),
    [symptomEntries, triggerEntries, meals, cvHistory, environmentalHistory]
  );

  const readiness = dataReadiness({ symptomEntries, environmentalHistory, triggerEntries, meals, cvHistory });

  const chartData = useMemo(() => {
    const sorted = [...symptomEntries].sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime());
    return {
      labels: sorted.map(s => new Date(s.dateISO).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })),
      datasets: [
        {
          label: 'Kaşıntı',
          data: sorted.map(s => s.itching),
          borderColor: '#f43f5e',
          backgroundColor: 'rgba(244, 63, 94, 0.08)',
          tension: 0.3,
          fill: true,
          pointRadius: 2
        },
        {
          label: 'Uykuya Etkisi',
          data: sorted.map(s => s.sleepImpact),
          borderColor: '#60a5fa',
          backgroundColor: 'transparent',
          tension: 0.3,
          pointRadius: 2
        }
      ]
    };
  }, [symptomEntries]);

  const readinessRows: Array<{ key: keyof typeof readiness; label: string }> = [
    { key: 'symptomDays', label: 'Belirti Kaydı (gün)' },
    { key: 'environmentalDays', label: 'Hava/Çevre Geçmişi (gün)' },
    { key: 'triggerLogs', label: 'Tetikleyici Kaydı' },
    { key: 'mealLogs', label: 'Öğün Kaydı' },
    { key: 'photoScans', label: 'Fotoğraf Analizi' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-neutral-900/60 p-6 rounded-3xl border border-neutral-800">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-neutral-800 text-neutral-300 border border-neutral-700">
            <Sparkles className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-semibold text-white tracking-tight">İçgörüler</h2>
        </div>
        <p className="text-sm text-neutral-400 mt-1">
          Burada hiçbir şey tahmin edilmez: yalnızca kendi kaydettiğin belirtiler, tetikleyiciler, öğünler, fotoğraf analizleri ve zamanla biriken gerçek hava/çevre verisi arasında basit istatistiksel karşılaştırmalar yapılır. Yeterli veri yoksa hiçbir sonuç gösterilmez.
        </p>
      </div>

      {symptomEntries.length >= 2 && (
        <div className="bg-neutral-900/60 p-6 rounded-3xl border border-neutral-800 space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-neutral-500" />
            Belirti Şiddeti Zaman Çizelgesi
          </h3>
          <div className="h-64">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: { min: 0, max: 10, ticks: { color: '#a3a3a3', stepSize: 2 }, grid: { color: '#262626' } },
                  x: { ticks: { color: '#a3a3a3', maxRotation: 0 }, grid: { display: false } }
                },
                plugins: {
                  legend: { display: true, labels: { color: '#d4d4d4', boxWidth: 12, font: { size: 11 } } },
                  tooltip: { mode: 'index', intersect: false }
                }
              }}
            />
          </div>
        </div>
      )}

      <div className="bg-neutral-900/60 p-6 rounded-3xl border border-neutral-800 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-neutral-500" />
          Veri Durumu
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {readinessRows.map(row => {
            const value = readiness[row.key];
            const target = READINESS_TARGETS[row.key];
            const ready = value >= target;
            return (
              <div key={row.key} className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-center">
                <span className={`text-xl font-semibold block ${ready ? 'text-emerald-400' : 'text-neutral-300'}`}>{value}</span>
                <span className="text-[10px] text-neutral-500 block mt-1 leading-tight">{row.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        {insights.length === 0 ? (
          <div className="bg-neutral-900/60 p-6 rounded-3xl border border-neutral-800 text-center space-y-2">
            <Info className="w-5 h-5 text-neutral-500 mx-auto" />
            <p className="text-sm text-neutral-300 font-semibold">Henüz anlamlı bir örüntü tespit edilmedi</p>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              Alevlenme Raporu'na günlük belirti girmeye, Tetikleyici Günlüğü'nü kullanmaya ve fotoğraf taramaya devam ettikçe bu sekme otomatik olarak dolacak. Karşılaştırmalar için her grupta en az {MIN_GROUP_SIZE_LABEL} gün/kayıt gerekir.
            </p>
          </div>
        ) : (
          insights.map(insight => (
            <div key={insight.id} className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold text-white">{insight.title}</h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 shrink-0">n={insight.sampleSize}</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">{insight.detail}</p>
            </div>
          ))
        )}
      </div>

      <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-500 flex items-start gap-2">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Bu sekme korelasyon gösterir, neden-sonuç ilişkisi kanıtlamaz ve tıbbi tanı niteliği taşımaz. Örneklem küçük olduğunda örüntüler tesadüfi olabilir; önemli kararlar için hekiminize danışın.
        </p>
      </div>
    </div>
  );
};

const MIN_GROUP_SIZE_LABEL = 3;
