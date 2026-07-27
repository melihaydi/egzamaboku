import React, { useState } from 'react';
import { 
  TrendingUp, 
  Flame, 
  Zap, 
  Plus, 
  Minus,
  Sparkles,
  ShieldCheck,
  BarChart3
} from 'lucide-react';
import { useApp } from '../../context/useApp';

export const HealingScoreCard: React.FC = () => {
  const { healingScore, updateHabitScore, activeProfile } = useApp();
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('weekly');

  const trendData = timeframe === 'weekly' ? healingScore.weeklyTrend : healingScore.monthlyTrend;

  return (
    <div className="space-y-6">
      {/* Ana Skor Kartı */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-6 md:p-8 border border-slate-800 shadow-xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Sol: Büyük Gösterge */}
          <div className="flex items-center gap-6">
            <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full flex items-center justify-center bg-slate-950 border-4 border-slate-800 shadow-inner">
              <svg className="absolute inset-0 w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  strokeWidth="8"
                  strokeDasharray={264}
                  strokeDashoffset={264 - (264 * healingScore.currentScore) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  style={{
                    stroke: healingScore.currentScore >= 80 ? '#10b981' : healingScore.currentScore >= 60 ? '#38bdf8' : '#f59e0b',
                    transition: 'stroke-dashoffset 0.8s ease-in-out'
                  }}
                />
              </svg>

              <div className="text-center z-10">
                <span className="text-4xl md:text-5xl font-black text-white tracking-tight">
                  {Math.round(healingScore.currentScore)}
                </span>
                <span className="text-xs text-slate-400 font-bold block">/ 100</span>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mt-0.5">
                  Günlük İndeks
                </span>
              </div>
            </div>

            <div className="space-y-2 max-w-md">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Optimal İyileşme Seviyesi
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {activeProfile.name}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-white tracking-tight">
                Günlük İyileşme & Bariyer İndeksi
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Klinik alevlenme şiddeti, fotoğraf taramaları, ilaç uyumu, nemlendirme ve uyku verilerini birleştirerek güncellenir.
              </p>

              <div className="pt-1 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-300">
                <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Seri: <strong className="text-amber-300">{healingScore.healingStreakDays} Gün</strong></span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                  <TrendingUp className="w-4 h-4 text-sky-400" />
                  <span>Hız: <strong className="text-sky-300">+{healingScore.recoveryVelocity} puan/hf</strong></span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Alevlenme Riski: <strong className="text-emerald-300">%{healingScore.riskScore} (Düşük)</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Sağ: Trend Grafiği */}
          <div className="w-full lg:w-72 bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-sky-400" />
                Skor Değişimi
              </span>
              <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-800">
                <button
                  onClick={() => setTimeframe('weekly')}
                  className={`px-2 py-0.5 text-[10px] rounded-md font-semibold transition-all ${
                    timeframe === 'weekly' ? 'bg-sky-500 text-white' : 'text-slate-400'
                  }`}
                >
                  7 Gün
                </button>
                <button
                  onClick={() => setTimeframe('monthly')}
                  className={`px-2 py-0.5 text-[10px] rounded-md font-semibold transition-all ${
                    timeframe === 'monthly' ? 'bg-sky-500 text-white' : 'text-slate-400'
                  }`}
                >
                  30 Gün
                </button>
              </div>
            </div>

            {/* Sütun Grafiği */}
            <div className="h-28 flex items-end justify-between gap-1.5 pt-2">
              {trendData.map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-sky-600 to-indigo-400 group-hover:from-sky-400 transition-all duration-300 relative"
                    style={{ height: `${val}%` }}
                  >
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-white bg-slate-800 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {val}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-medium">
                    {timeframe === 'weekly' ? `G${idx+1}` : `H${idx+1}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Alışkanlık Etki Faktörleri */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Skoru Etkileyen Faktörler & Açıklamalar
          </h3>
          <p className="text-xs text-slate-400">
            Günlük iyileşme skorunuzu olumlu ve olumsuz etkileyen yaşam alışkanlıkları. Faktörleri güncelleyebilirsiniz.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(healingScore.habitFactors).map(([key, item]) => {
            const isPos = item.impact === 'positive';
            const isNeg = item.impact === 'negative';
            
            // Türkçe etiketler
            const labelMap: Record<string, string> = {
              flareSeverity: 'Alevlenme Şiddeti',
              photoTrend: 'Fotoğraf Taramaları',
              medicationAdherence: 'İlaç Kullanım Uyumu',
              moisturizerConsistency: 'Nemlendirici Düzeni',
              sleepQuality: 'Uyku Kalitesi',
              stressLevel: 'Stres Seviyesi',
              waterIntake: 'Su Tüketimi',
              loggedTriggers: 'Çevresel Tetikleyiciler'
            };

            return (
              <div
                key={key}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    Ağırlık: %{item.weight}
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                    isPos ? 'bg-emerald-500/20 text-emerald-300' : isNeg ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {item.score} / 100
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">
                    {labelMap[key] || key}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {item.text}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400">Güncelle:</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateHabitScore(key as keyof typeof healingScore.habitFactors, -10)}
                      className="p-1 rounded-md bg-slate-800 hover:bg-rose-500/30 text-slate-300 hover:text-rose-300 border border-slate-700"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => updateHabitScore(key as keyof typeof healingScore.habitFactors, 10)}
                      className="p-1 rounded-md bg-slate-800 hover:bg-emerald-500/30 text-slate-300 hover:text-emerald-300 border border-slate-700"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
