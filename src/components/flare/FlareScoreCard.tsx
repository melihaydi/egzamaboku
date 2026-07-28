import React, { useState } from 'react';
import {
  TrendingDown,
  TrendingUp,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/useApp';
import type { FlareScoreData } from '../../types';

const SEVERITY_COLOR: Record<FlareScoreData['severityLevel'], string> = {
  'Hafif': '#34d399',
  'Orta': '#fbbf24',
  'Şiddetli': '#fb923c',
  'Çok Şiddetli': '#f43f5e'
};

const FACTOR_LABELS: Record<keyof FlareScoreData['factors'], string> = {
  itching: 'Kaşıntı',
  dryness: 'Kuruluk',
  redness: 'Kızarıklık',
  sleepQuality: 'Uyku Kalitesi',
  moisturizerUsage: 'Nemlendirici Kullanımı',
  medicationAdherence: 'İlaç Uyumu',
  weather: 'Hava Koşulları',
  stress: 'Stres',
  diet: 'Beslenme'
};

export const FlareScoreCard: React.FC = () => {
  const { flareScore, activeProfile } = useApp();
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('weekly');

  const trendData = timeframe === 'weekly' ? flareScore.weeklyTrend : flareScore.monthlyTrend;
  const color = SEVERITY_COLOR[flareScore.severityLevel];
  const trendDelta = flareScore.previousScore - flareScore.currentScore;
  const improving = trendDelta > 0;

  return (
    <div className="space-y-6">
      {/* Ana Skor Kartı */}
      <div className="relative overflow-hidden rounded-3xl bg-neutral-900/60 backdrop-blur-xl p-6 md:p-8 border border-neutral-800">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full flex items-center justify-center bg-neutral-950 border border-neutral-800 shadow-inner">
              <svg className="absolute inset-0 w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" className="stroke-neutral-800" strokeWidth="7" fill="transparent" />
                <circle
                  cx="50" cy="50" r="42"
                  strokeWidth="7"
                  strokeDasharray={264}
                  strokeDashoffset={264 - (264 * flareScore.currentScore) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  style={{ stroke: color, transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                />
              </svg>
              <div className="text-center z-10">
                <span className="text-5xl font-semibold text-white tracking-tight">{Math.round(flareScore.currentScore)}</span>
                <span className="text-xs text-neutral-500 font-medium block">/ 100</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider block mt-1" style={{ color }}>
                  {flareScore.severityLevel}
                </span>
              </div>
            </div>

            <div className="space-y-3 max-w-md text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-xs text-neutral-500 font-medium">{activeProfile.name}</span>
              </div>
              <h2 className="text-2xl font-semibold text-white tracking-tight">
                Günlük Alevlenme Şiddeti
              </h2>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Kaşıntı, kuruluk, kızarıklık, uyku, ilaç uyumu, hava koşulları, stres ve beslenme verilerinden otomatik hesaplanır.
              </p>

              <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs font-medium text-neutral-300">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${improving ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'}`}>
                  {improving ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                  <span>{improving ? `${Math.abs(trendDelta)} puan azaldı` : `${Math.abs(trendDelta)} puan arttı`}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trend Grafiği */}
          <div className="w-full lg:w-72 bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-neutral-500" />
                Şiddet Değişimi
              </span>
              <div className="flex rounded-lg bg-neutral-900 p-0.5 border border-neutral-800">
                <button
                  onClick={() => setTimeframe('weekly')}
                  className={`px-2 py-0.5 text-[10px] rounded-md font-semibold transition-all ${timeframe === 'weekly' ? 'bg-white text-neutral-950' : 'text-neutral-400'}`}
                >
                  7 Gün
                </button>
                <button
                  onClick={() => setTimeframe('monthly')}
                  className={`px-2 py-0.5 text-[10px] rounded-md font-semibold transition-all ${timeframe === 'monthly' ? 'bg-white text-neutral-950' : 'text-neutral-400'}`}
                >
                  30 Gün
                </button>
              </div>
            </div>

            <div className="h-28 flex items-end justify-between gap-1.5 pt-2">
              {trendData.map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                  <div
                    className="w-full rounded-t-md bg-neutral-700 group-hover:bg-neutral-500 transition-all duration-300 relative"
                    style={{ height: `${val}%` }}
                  >
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-semibold text-white bg-neutral-800 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {val}
                    </span>
                  </div>
                  <span className="text-[9px] text-neutral-600 font-medium">
                    {timeframe === 'weekly' ? `G${idx + 1}` : `H${idx + 1}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Katkıda Bulunan Faktörler */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-neutral-500" />
            Skoru Etkileyen Faktörler
          </h3>
          <p className="text-sm text-neutral-400">
            Her faktörün bugünkü şiddet skoruna ne kadar katkıda bulunduğunu gösterir.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Object.entries(flareScore.factors) as Array<[keyof FlareScoreData['factors'], FlareScoreData['factors'][keyof FlareScoreData['factors']]]>).map(([key, item]) => {
            const isPos = item.impact === 'positive';
            const isNeg = item.impact === 'negative';

            return (
              <div key={key} className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400">
                    Ağırlık: %{item.weight}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                    isPos ? 'bg-emerald-500/15 text-emerald-300' : isNeg ? 'bg-rose-500/15 text-rose-300' : 'bg-neutral-800 text-neutral-300'
                  }`}>
                    {item.score} / 100
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-white">{FACTOR_LABELS[key]}</h4>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{item.text}</p>
                </div>

                <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${isPos ? 'bg-emerald-500' : isNeg ? 'bg-rose-500' : 'bg-neutral-500'}`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
