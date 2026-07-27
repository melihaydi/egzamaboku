import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck, 
  CheckCircle2, 
  Droplets, 
  Moon, 
  Sun, 
  Sunset, 
  Timer, 
  Play, 
  Pause, 
  RotateCcw,
  Zap,
  Award
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import confetti from 'canvas-confetti';

export const RoutineBuilder: React.FC = () => {
  const { routines, toggleRoutineTask, healingScore } = useApp();
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<'Sabah' | 'Öğle' | 'Akşam' | 'Gece'>('Sabah');
  
  // Banyo Zamanlayıcısı
  const [bathTimeLeft, setBathTimeLeft] = useState<number>(600); // 10 dk
  const [isBathTimerRunning, setIsBathTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    let timer: any;
    if (isBathTimerRunning && bathTimeLeft > 0) {
      timer = setInterval(() => {
        setBathTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isBathTimerRunning, bathTimeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTaskClick = (id: string) => {
    const toggledTask = routines.find(r => r.id === id);
    const willBeCompleted = toggledTask ? !toggledTask.completed : false;

    toggleRoutineTask(id);

    if (willBeCompleted) {
      const filtered = routines.filter(r => r.timeOfDay === selectedTimeOfDay);
      const allDone = filtered.every(r => (r.id === id ? willBeCompleted : r.completed));
      if (allDone) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  };

  const filteredTasks = routines.filter(r => r.timeOfDay === selectedTimeOfDay);
  const totalCompleted = routines.filter(r => r.completed).length;

  return (
    <div className="space-y-6">
      {/* Üst Şerit */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <CalendarCheck className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Kişiselleştirilmiş Dinamik Bakım Rutini & Koçluk
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Aktif alevlenme durumuna, hava kuruluğuna ve uyku kalitesine göre bakım adımlarını otomatik günceller.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Günlük İlerleme: {totalCompleted}/{routines.length} Görev</span>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-xs flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Rejim Modu: <strong>{healingScore.currentScore < 70 ? 'Akut Alevlenme Protokolü' : 'Proaktif İdame Bakımı'}</strong></span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sol Kolon: Rutin Görev Listesi */}
        <div className="lg:col-span-8 bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-6">
          {/* Günün Saatleri Sekmesi */}
          <div className="flex rounded-2xl bg-slate-950 p-1 border border-slate-800 justify-between">
            {[
              { id: 'Sabah', icon: Sun },
              { id: 'Öğle', icon: Sun },
              { id: 'Akşam', icon: Sunset },
              { id: 'Gece', icon: Moon }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = selectedTimeOfDay === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTimeOfDay(tab.id as any)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    isActive
                      ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.id}</span>
                </button>
              );
            })}
          </div>

          {/* Görev Kontrol Listesi */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{selectedTimeOfDay} Bakım Adımları</span>
              <span>{filteredTasks.filter(t => t.completed).length} / {filteredTasks.length} Tamamlandı</span>
            </div>

            <div className="space-y-2">
              {filteredTasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => handleTaskClick(task.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                    task.completed
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                      : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-sky-500/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                      task.completed ? 'bg-emerald-500 border-emerald-400 text-white' : 'border-slate-700 bg-slate-900'
                    }`}>
                      {task.completed && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className={`font-bold ${task.completed ? 'line-through opacity-70' : ''}`}>
                        {task.title}
                      </p>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        Kategori: {task.category}
                      </span>
                    </div>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    task.completed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {task.completed ? '+5 Puan' : 'Bekliyor'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sağ Kolon: Banyo Zamanlayıcısı & Su Hedefi */}
        <div className="lg:col-span-4 space-y-6">
          {/* Banyo Zamanlayıcısı */}
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Timer className="w-4 h-4 text-sky-400" />
                Ilık Banyo Zamanlayıcısı
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold">
                Maks 12 Dk Kuralı
              </span>
            </div>

            <div className="text-center py-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-4xl font-black text-white font-mono tracking-wider">
                {formatTime(bathTimeLeft)}
              </span>
              <p className="text-[10px] text-slate-400 px-2">
                Ilık suda (32–34°C) yıkanın. Banyodan sonraki ilk 3 dakika içinde havluyla hafifçe kurulanıp nemlendirici sürün.
              </p>

              <div className="pt-2 flex items-center justify-center gap-2">
                <button
                  onClick={() => setIsBathTimerRunning(!isBathTimerRunning)}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                >
                  {isBathTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isBathTimerRunning ? 'Duraklat' : 'Zamanlayıcıyı Başlat'}
                </button>

                <button
                  onClick={() => {
                    setIsBathTimerRunning(false);
                    setBathTimeLeft(600);
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Hidrasyon Hedefi */}
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-3 text-xs">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Droplets className="w-4 h-4 text-sky-400" />
              Günlük Hidrasyon & Bariyer Hedefi
            </h3>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-300">Günlük Su Tüketimi</span>
                <span className="text-sky-400">2.2L / 2.5L</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 w-[88%]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
