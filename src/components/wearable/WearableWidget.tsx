import React from 'react';
import { Watch, Droplets, Heart, Flame, Check, X } from 'lucide-react';
import { useApp } from '../../context/useApp';

export const WearableWidget: React.FC = () => {
  const { wearableWidgetOpen, setWearableWidgetOpen, healingScore, updateHabitScore } = useApp();

  if (!wearableWidgetOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
      <div className="w-64 bg-slate-950 border-4 border-slate-700 rounded-[40px] p-4 shadow-2xl text-slate-100 relative space-y-3">
        <button
          onClick={() => setWearableWidgetOpen(false)}
          className="absolute -top-2 -right-2 p-1.5 rounded-full bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-600 shadow"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
          <div className="flex items-center gap-1 text-[10px] text-indigo-400 font-bold">
            <Watch className="w-3.5 h-3.5" />
            WatchOS Ekranı
          </div>
          <span className="text-[10px] text-slate-500 font-mono">17:30</span>
        </div>

        <div className="text-center space-y-1">
          <span className="text-[9px] uppercase font-bold text-slate-400 block">İyileşme Skoru</span>
          <span className="text-3xl font-black text-emerald-400 font-mono">
            {Math.round(healingScore.currentScore)}
          </span>
          <div className="flex justify-center items-center gap-2 text-[10px] text-slate-400">
            <span className="flex items-center gap-0.5 text-rose-400 font-bold">
              <Heart className="w-3 h-3 text-rose-500 fill-rose-500 animate-pulse" /> 72 Nabız
            </span>
            <span>•</span>
            <span className="flex items-center gap-0.5 text-amber-400 font-bold">
              <Flame className="w-3 h-3" /> {healingScore.healingStreakDays} Gün Seri
            </span>
          </div>
        </div>

        <div className="space-y-1.5 pt-1">
          <button
            onClick={() => updateHabitScore('moisturizerConsistency', 5)}
            className="w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
          >
            <Droplets className="w-3.5 h-3.5" />
            Nemlendirici Sürüldü
          </button>
          <button
            onClick={() => updateHabitScore('medicationAdherence', 5)}
            className="w-full py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 font-semibold text-[11px] flex items-center justify-center gap-1 border border-indigo-500/30"
          >
            <Check className="w-3 h-3 text-indigo-400" />
            Dupixent Dozu Yapıldı
          </button>
        </div>

        <p className="text-[9px] text-slate-500 text-center">
          Apple Watch & Wear OS Senkronize
        </p>
      </div>
    </div>
  );
};
