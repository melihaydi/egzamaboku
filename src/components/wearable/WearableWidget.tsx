import React from 'react';
import { Watch, Droplets, Heart, CheckCircle2, Check, X } from 'lucide-react';
import { useApp } from '../../context/useApp';

export const WearableWidget: React.FC = () => {
  const { wearableWidgetOpen, setWearableWidgetOpen, routines, toggleRoutineTask } = useApp();

  if (!wearableWidgetOpen) return null;

  const completedCount = routines.filter(r => r.completed).length;
  const pendingMoisturizer = routines.find(r => r.category === 'Nemlendirici' && !r.completed);
  const pendingMedication = routines.find(r => r.category === 'İlaç / Krem' && !r.completed);

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
      <div className="w-64 bg-neutral-950 border-4 border-neutral-700 rounded-[40px] p-4 shadow-2xl text-neutral-100 relative space-y-3">
        <button
          onClick={() => setWearableWidgetOpen(false)}
          className="absolute -top-2 -right-2 p-1.5 rounded-full bg-neutral-800 hover:bg-rose-600 text-neutral-300 hover:text-white border border-neutral-600 shadow"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center justify-between border-b border-neutral-800 pb-2 text-xs">
          <div className="flex items-center gap-1 text-[10px] text-neutral-300 font-bold">
            <Watch className="w-3.5 h-3.5" />
            WatchOS Ekranı
          </div>
          <span className="text-[10px] text-neutral-500 font-mono">
            {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className="text-center space-y-1">
          <span className="text-[9px] uppercase font-bold text-neutral-400 block">Bugünkü Bakım</span>
          <span className="text-3xl font-black text-emerald-400 font-mono">
            {completedCount}/{routines.length}
          </span>
          <div className="flex justify-center items-center gap-2 text-[10px] text-neutral-400">
            <span className="flex items-center gap-0.5 text-rose-400 font-bold">
              <Heart className="w-3 h-3 text-rose-500 fill-rose-500 animate-pulse" /> 72 Nabız
            </span>
            <span>•</span>
            <span className="flex items-center gap-0.5 text-emerald-400 font-bold">
              <CheckCircle2 className="w-3 h-3" /> Adım Tamamlandı
            </span>
          </div>
        </div>

        <div className="space-y-1.5 pt-1">
          <button
            onClick={() => pendingMoisturizer && toggleRoutineTask(pendingMoisturizer.id)}
            disabled={!pendingMoisturizer}
            className="w-full py-2 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md disabled:opacity-40"
          >
            <Droplets className="w-3.5 h-3.5" />
            {pendingMoisturizer ? 'Nemlendirici Sürüldü' : 'Nemlendirici Tamamlandı'}
          </button>
          <button
            onClick={() => pendingMedication && toggleRoutineTask(pendingMedication.id)}
            disabled={!pendingMedication}
            className="w-full py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-[11px] flex items-center justify-center gap-1 border border-neutral-700 disabled:opacity-40"
          >
            <Check className="w-3 h-3 text-neutral-300" />
            {pendingMedication ? 'İlaç/Krem Uygulandı' : 'İlaç/Krem Tamamlandı'}
          </button>
        </div>

        <p className="text-[9px] text-neutral-500 text-center">
          Apple Watch & Wear OS Senkronize
        </p>
      </div>
    </div>
  );
};
