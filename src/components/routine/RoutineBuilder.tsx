import React, { useState } from 'react';
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
  Award,
  Plus,
  Minus,
  Trash2,
  Pencil,
  ArrowUp,
  ArrowDown,
  Check
} from 'lucide-react';
import { useApp } from '../../context/useApp';
import confetti from 'canvas-confetti';
import type { RoutineTask } from '../../types';

const TIME_TABS: Array<{ id: RoutineTask['timeOfDay']; icon: typeof Sun }> = [
  { id: 'Sabah', icon: Sun },
  { id: 'Öğle', icon: Sun },
  { id: 'Akşam', icon: Sunset },
  { id: 'Gece', icon: Moon }
];

const CATEGORIES: RoutineTask['category'][] = ['Nemlendirici', 'İlaç / Krem', 'Su Tüketimi', 'Stres Yönetimi', 'Banyo', 'Uyku Hazırlığı'];
const WATER_TARGET_GLASSES = 8;
const todayISO = () => new Date().toISOString().slice(0, 10);

export const RoutineBuilder: React.FC = () => {
  const { routines, toggleRoutineTask, addRoutineTask, removeRoutineTask, updateRoutineTask, reorderRoutineTasks, waterIntake, addWaterGlass, removeWaterGlass, t } = useApp();
  const todayGlasses = waterIntake.dateISO === todayISO() ? waterIntake.glasses : 0;
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<RoutineTask['timeOfDay']>('Sabah');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<RoutineTask['category']>('Nemlendirici');
  const [newReminder, setNewReminder] = useState('');
  const [editTitle, setEditTitle] = useState('');

  const [bathTimeLeft, setBathTimeLeft] = useState<number>(600);
  const [isBathTimerRunning, setIsBathTimerRunning] = useState<boolean>(false);

  React.useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (isBathTimerRunning && bathTimeLeft > 0) {
      timer = setInterval(() => setBathTimeLeft(prev => prev - 1), 1000);
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
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      }
    }
  };

  const filteredTasks = routines
    .filter(r => r.timeOfDay === selectedTimeOfDay)
    .sort((a, b) => a.order - b.order);
  const totalCompleted = routines.filter(r => r.completed).length;

  const handleAddTask = () => {
    if (!newTitle.trim()) return;
    addRoutineTask({ title: newTitle.trim(), timeOfDay: selectedTimeOfDay, category: newCategory, reminderTime: newReminder || undefined });
    setNewTitle('');
    setNewReminder('');
    setShowAddForm(false);
  };

  const startEdit = (task: RoutineTask) => {
    setEditingId(task.id);
    setEditTitle(task.title);
  };

  const saveEdit = (id: string) => {
    if (editTitle.trim()) updateRoutineTask(id, { title: editTitle.trim() });
    setEditingId(null);
  };

  const moveTask = (id: string, direction: -1 | 1) => {
    const ids = filteredTasks.map(task => task.id);
    const idx = ids.indexOf(id);
    const swapWith = idx + direction;
    if (swapWith < 0 || swapWith >= ids.length) return;
    [ids[idx], ids[swapWith]] = [ids[swapWith], ids[idx]];
    reorderRoutineTasks(selectedTimeOfDay, ids);
  };

  return (
    <div className="space-y-6">
      {/* Üst Şerit */}
      <div className="bg-neutral-900/60 p-6 rounded-3xl border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-neutral-800 text-neutral-300 border border-neutral-700">
              <CalendarCheck className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-semibold text-white tracking-tight">
              {t('title.routine')}
            </h2>
          </div>
          <p className="text-sm text-neutral-400 mt-1">
            Kendi bakım adımlarını ekle, düzenle, sırala ve kaldır.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 text-xs font-semibold flex items-center gap-1.5">
            <Award className="w-4 h-4" />
            <span>{totalCompleted}/{routines.length} Tamamlandı</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sol Kolon: Rutin Görev Listesi */}
        <div className="lg:col-span-8 bg-neutral-900/60 p-6 rounded-3xl border border-neutral-800 space-y-6">
          <div className="flex rounded-2xl bg-neutral-950 p-1 border border-neutral-800 justify-between">
            {TIME_TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = selectedTimeOfDay === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTimeOfDay(tab.id)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                    isActive ? 'bg-white text-neutral-950 shadow' : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.id}</span>
                </button>
              );
            })}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>{selectedTimeOfDay} Bakım Adımları ({filteredTasks.filter(task => task.completed).length}/{filteredTasks.length})</span>
              <button
                onClick={() => setShowAddForm(v => !v)}
                className="flex items-center gap-1 text-neutral-200 hover:text-white font-semibold"
              >
                <Plus className="w-3.5 h-3.5" /> Adım Ekle
              </button>
            </div>

            {showAddForm && (
              <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                <input
                  type="text"
                  placeholder="Örn: Yüz için hafif nemlendirici uygula"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as RoutineTask['category'])}
                    className="px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 focus:outline-none"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input
                    type="time"
                    value={newReminder}
                    onChange={e => setNewReminder(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 focus:outline-none"
                  />
                  <button
                    onClick={handleAddTask}
                    disabled={!newTitle.trim()}
                    className="ml-auto px-3.5 py-1.5 rounded-xl bg-white text-neutral-950 font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" /> Ekle
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {filteredTasks.map((task, idx) => (
                <div
                  key={task.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 text-xs ${
                    task.completed ? 'bg-emerald-500/5 border-emerald-500/25 text-emerald-100' : 'bg-neutral-950 border-neutral-800 text-neutral-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => handleTaskClick(task.id)}
                      aria-label={`${task.title} - ${task.completed ? 'tamamlandı, kaldırmak için tıkla' : 'tamamlamak için tıkla'}`}
                      className={`w-5 h-5 shrink-0 rounded-lg border flex items-center justify-center transition-colors ${
                        task.completed ? 'bg-emerald-500 border-emerald-400 text-white' : 'border-neutral-700 bg-neutral-900'
                      }`}
                    >
                      {task.completed && <CheckCircle2 className="w-4 h-4" />}
                    </button>

                    {editingId === task.id ? (
                      <input
                        autoFocus
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && saveEdit(task.id)}
                        onBlur={() => saveEdit(task.id)}
                        className="flex-1 min-w-0 px-2 py-1 rounded-lg bg-neutral-900 border border-neutral-700 text-xs text-white focus:outline-none"
                      />
                    ) : (
                      <div className="min-w-0">
                        <p className={`font-semibold truncate ${task.completed ? 'line-through opacity-70' : ''}`}>{task.title}</p>
                        <span className="text-[10px] text-neutral-500 uppercase font-semibold">
                          {task.category}{task.reminderTime ? ` • ${task.reminderTime}` : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => moveTask(task.id, -1)} disabled={idx === 0} aria-label="Yukarı taşı" className="p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800 disabled:opacity-30">
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => moveTask(task.id, 1)} disabled={idx === filteredTasks.length - 1} aria-label="Aşağı taşı" className="p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800 disabled:opacity-30">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => startEdit(task)} aria-label="Adımı Düzenle" className="p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => removeRoutineTask(task.id)} aria-label="Adımı Sil" className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {filteredTasks.length === 0 && (
                <p className="text-xs text-neutral-500 text-center py-6">Bu zaman dilimi için henüz bir adım eklenmedi.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sağ Kolon: Banyo Zamanlayıcısı & Su Hedefi */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-neutral-900/60 p-6 rounded-3xl border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Timer className="w-4 h-4 text-neutral-500" />
                Ilık Banyo Zamanlayıcısı
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 font-semibold">
                Maks 12 Dk
              </span>
            </div>

            <div className="text-center py-4 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-2">
              <span className="text-4xl font-semibold text-white font-mono tracking-wider">{formatTime(bathTimeLeft)}</span>
              <p className="text-[10px] text-neutral-500 px-2">
                Ilık suda (32–34°C) yıkanın. Banyodan sonraki ilk 3 dakika içinde nemlendirici sürün.
              </p>

              <div className="pt-2 flex items-center justify-center gap-2">
                <button
                  onClick={() => setIsBathTimerRunning(!isBathTimerRunning)}
                  aria-label={isBathTimerRunning ? 'Zamanlayıcıyı duraklat' : 'Zamanlayıcıyı başlat'}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 font-semibold text-xs flex items-center gap-1.5"
                >
                  {isBathTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isBathTimerRunning ? 'Duraklat' : 'Başlat'}
                </button>
                <button
                  onClick={() => { setIsBathTimerRunning(false); setBathTimeLeft(600); }}
                  aria-label="Zamanlayıcıyı sıfırla"
                  className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 text-xs"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-neutral-900/60 p-6 rounded-3xl border border-neutral-800 space-y-3 text-xs">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Droplets className="w-4 h-4 text-neutral-500" />
              Günlük Su Takibi
            </h3>

            <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="flex justify-between font-semibold">
                <span className="text-neutral-300">Bugün İçilen</span>
                <span className="text-neutral-200">{todayGlasses}/{WATER_TARGET_GLASSES} bardak</span>
              </div>
              <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-400 transition-all"
                  style={{ width: `${Math.min(100, (todayGlasses / WATER_TARGET_GLASSES) * 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-center gap-4 pt-1">
                <button
                  onClick={removeWaterGlass}
                  disabled={todayGlasses === 0}
                  aria-label="Bir bardak çıkar"
                  className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-lg font-semibold text-white w-8 text-center">{todayGlasses}</span>
                <button
                  onClick={addWaterGlass}
                  aria-label="Bir bardak ekle"
                  className="p-2 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 border border-white"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
