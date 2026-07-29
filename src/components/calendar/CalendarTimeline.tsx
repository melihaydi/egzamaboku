import React, { useMemo, useState } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Camera,
  Pill,
  Syringe,
  Stethoscope,
  Droplets,
  StickyNote,
  Plus,
  Trash2,
  Flame,
  Pencil,
  Copy,
  X,
  Check,
  Download
} from 'lucide-react';
import { useApp } from '../../context/useApp';
import type { CalendarEvent, CalendarEventType } from '../../types';
import { downloadICS } from '../../lib/icsExport';

const EVENT_META: Record<CalendarEventType, { icon: typeof Camera; color: string; chip: string; dot: string; label: string }> = {
  photo: { icon: Camera, color: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30', chip: 'bg-cyan-500/25 text-cyan-100', dot: 'bg-cyan-400', label: 'Fotoğraf' },
  medication: { icon: Pill, color: 'bg-sky-500/15 text-sky-300 border border-sky-500/30', chip: 'bg-sky-500/25 text-sky-100', dot: 'bg-sky-400', label: 'İlaç' },
  injection: { icon: Syringe, color: 'bg-violet-500/15 text-violet-300 border border-violet-500/30', chip: 'bg-violet-500/25 text-violet-100', dot: 'bg-violet-400', label: 'Enjeksiyon' },
  doctorVisit: { icon: Stethoscope, color: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30', chip: 'bg-emerald-500/25 text-emerald-100', dot: 'bg-emerald-400', label: 'Doktor Ziyareti' },
  missedMoisturizer: { icon: Droplets, color: 'bg-amber-500/15 text-amber-300 border border-amber-500/30', chip: 'bg-amber-500/25 text-amber-100', dot: 'bg-amber-400', label: 'Atlanan Bakım' },
  flare: { icon: Flame, color: 'bg-rose-500/15 text-rose-300 border border-rose-500/30', chip: 'bg-rose-500/25 text-rose-100', dot: 'bg-rose-400', label: 'Alevlenme' },
  note: { icon: StickyNote, color: 'bg-neutral-700/40 text-neutral-300 border border-neutral-700', chip: 'bg-neutral-700/60 text-neutral-200', dot: 'bg-neutral-400', label: 'Not' }
};

function pad(n: number) { return n.toString().padStart(2, '0'); }
function toISODate(y: number, m: number, d: number) { return `${y}-${pad(m + 1)}-${pad(d)}`; }

export const CalendarTimeline: React.FC = () => {
  const { calendarEvents, addCalendarEvent, updateCalendarEvent, removeCalendarEvent, duplicateCalendarEvent, t } = useApp();
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string>(toISODate(today.getFullYear(), today.getMonth(), today.getDate()));
  const [showAddForm, setShowAddForm] = useState(false);
  const [newType, setNewType] = useState<CalendarEventType>('note');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [duplicateDate, setDuplicateDate] = useState('');

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    calendarEvents.forEach(ev => {
      if (!map[ev.dateISO]) map[ev.dateISO] = [];
      map[ev.dateISO].push(ev);
    });
    return map;
  }, [calendarEvents]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const startOffset = (firstDayOfMonth.getDay() + 6) % 7; // Pazartesi ilk gün
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthLabel = viewDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
  const dayLabels = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'];

  const cells: Array<{ day: number; dateISO: string } | null> = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, dateISO: toISODate(year, month, d) });

  const selectedEvents = (eventsByDate[selectedDate] || []).slice().sort((a, b) => a.title.localeCompare(b.title));

  const resetForm = () => {
    setNewTitle('');
    setNewDescription('');
    setNewType('note');
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleSaveEvent = () => {
    if (!newTitle.trim()) return;
    if (editingId) {
      updateCalendarEvent(editingId, { title: newTitle.trim(), type: newType, description: newDescription.trim() || undefined });
    } else {
      addCalendarEvent({ dateISO: selectedDate, type: newType, title: newTitle.trim(), description: newDescription.trim() || undefined });
    }
    resetForm();
  };

  const startEdit = (ev: CalendarEvent) => {
    setEditingId(ev.id);
    setNewTitle(ev.title);
    setNewDescription(ev.description || '');
    setNewType(ev.type);
    setShowAddForm(true);
  };

  const handleDuplicate = () => {
    if (!duplicatingId || !duplicateDate) return;
    duplicateCalendarEvent(duplicatingId, duplicateDate);
    setDuplicatingId(null);
    setDuplicateDate('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-neutral-900/60 p-6 rounded-3xl border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-neutral-800 text-neutral-300 border border-neutral-700">
              <CalendarDays className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-semibold text-white tracking-tight">{t('title.calendar')}</h2>
          </div>
          <p className="text-sm text-neutral-400 mt-1">
            Fotoğraf taramaları, ilaçlar, enjeksiyonlar, doktor ziyaretleri ve notların tek bir zaman çizelgesi.
          </p>
        </div>

        <button
          onClick={() => downloadICS(calendarEvents, 'dermiq-takvim.ics')}
          disabled={calendarEvents.length === 0}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          <Download className="w-3.5 h-3.5" /> Tümünü Dışa Aktar (.ics)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Takvim Izgarası */}
        <div className="lg:col-span-7 bg-neutral-900/60 p-6 rounded-3xl border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <button onClick={() => setViewDate(new Date(year, month - 1, 1))} className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-white capitalize">{monthLabel}</span>
            <button onClick={() => setViewDate(new Date(year, month + 1, 1))} className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center">
            {dayLabels.map(d => (
              <span key={d} className="text-[10px] font-semibold text-neutral-500 py-1">{d}</span>
            ))}
            {cells.map((cell, idx) => {
              if (!cell) return <div key={idx} />;
              const dayEvents = eventsByDate[cell.dateISO] || [];
              const isSelected = cell.dateISO === selectedDate;
              const isToday = cell.dateISO === toISODate(today.getFullYear(), today.getMonth(), today.getDate());
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(cell.dateISO)}
                  className={`relative min-h-[64px] rounded-xl border p-1 flex flex-col items-start gap-0.5 transition-all overflow-hidden ${
                    isSelected ? 'bg-white border-white' : isToday ? 'border-neutral-500 bg-neutral-900' : 'border-neutral-800 bg-neutral-950 hover:bg-neutral-800/60'
                  }`}
                >
                  <span className={`text-xs font-medium px-1 ${isSelected ? 'text-neutral-950' : 'text-neutral-300'}`}>{cell.day}</span>
                  <div className="w-full space-y-0.5">
                    {dayEvents.slice(0, 2).map(ev => (
                      <span
                        key={ev.id}
                        className={`block text-[8px] leading-tight px-1 py-0.5 rounded truncate w-full text-left ${
                          isSelected ? 'bg-neutral-950/10 text-neutral-950' : EVENT_META[ev.type].chip
                        }`}
                      >
                        • {ev.title}
                      </span>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className={`block text-[8px] px-1 ${isSelected ? 'text-neutral-950/70' : 'text-neutral-500'}`}>+{dayEvents.length - 2} daha</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Seçili Gün Detayları */}
        <div className="lg:col-span-5 bg-neutral-900/60 p-6 rounded-3xl border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-semibold text-neutral-500 block">Seçili Gün</span>
              <h3 className="text-sm font-semibold text-white">{new Date(selectedDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</h3>
            </div>
            <button
              onClick={() => { resetForm(); setShowAddForm(v => !v); }}
              className="flex items-center gap-1 text-xs font-semibold text-neutral-200 hover:text-white"
            >
              <Plus className="w-3.5 h-3.5" /> Etkinlik Ekle
            </button>
          </div>

          {showAddForm && (
            <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-neutral-400">{editingId ? 'Etkinliği Düzenle' : 'Yeni Etkinlik'}</span>
                <button onClick={resetForm} className="p-1 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800"><X className="w-3.5 h-3.5" /></button>
              </div>
              <input
                type="text"
                placeholder="Örn: Doktor kontrolü, alevlenme notu..."
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Kısa açıklama (isteğe bağlı)"
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none"
              />
              <div className="flex items-center gap-2">
                <select
                  value={newType}
                  onChange={e => setNewType(e.target.value as CalendarEventType)}
                  className="px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 focus:outline-none"
                >
                  {Object.entries(EVENT_META).map(([key, meta]) => (
                    <option key={key} value={key}>{meta.label}</option>
                  ))}
                </select>
                <button
                  onClick={handleSaveEvent}
                  disabled={!newTitle.trim()}
                  className="ml-auto px-3.5 py-1.5 rounded-xl bg-white text-neutral-950 font-semibold text-xs disabled:opacity-40 flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" /> {editingId ? 'Kaydet' : 'Ekle'}
                </button>
              </div>
            </div>
          )}

          {duplicatingId && (
            <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
              <span className="text-[10px] font-semibold text-neutral-400">Etkinliği kopyala — yeni tarih seç</span>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={duplicateDate}
                  onChange={e => setDuplicateDate(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none"
                />
                <button onClick={handleDuplicate} disabled={!duplicateDate} className="px-3 py-1.5 rounded-xl bg-white text-neutral-950 font-semibold text-xs disabled:opacity-40">Kopyala</button>
                <button onClick={() => setDuplicatingId(null)} className="p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800"><X className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          )}

          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {selectedEvents.length === 0 && (
              <p className="text-xs text-neutral-500 text-center py-8">Bu gün için kayıtlı bir etkinlik yok.</p>
            )}
            {selectedEvents.map(ev => {
              const meta = EVENT_META[ev.type];
              const Icon = meta.icon;
              return (
                <div key={ev.id} className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-start gap-3">
                  <span className={`p-2 rounded-xl shrink-0 ${meta.color}`}>
                    <Icon className="w-4 h-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white">{ev.title}</p>
                    {ev.description && <p className="text-[11px] text-neutral-400 mt-0.5">{ev.description}</p>}
                    <span className="text-[10px] text-neutral-500 uppercase font-semibold">{meta.label}</span>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button onClick={() => downloadICS([ev], `${ev.title.replace(/[^\p{L}\p{N}\- ]/gu, '').trim() || 'etkinlik'}.ics`)} title="Takvime Ekle (.ics)" className="p-1.5 rounded-lg text-neutral-600 hover:text-white hover:bg-neutral-800">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => startEdit(ev)} className="p-1.5 rounded-lg text-neutral-600 hover:text-white hover:bg-neutral-800">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => { setDuplicatingId(ev.id); setDuplicateDate(ev.dateISO); }} className="p-1.5 rounded-lg text-neutral-600 hover:text-white hover:bg-neutral-800">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => removeCalendarEvent(ev.id)} className="p-1.5 rounded-lg text-neutral-600 hover:text-rose-400 hover:bg-rose-500/10">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
