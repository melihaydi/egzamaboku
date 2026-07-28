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
  Flame
} from 'lucide-react';
import { useApp } from '../../context/useApp';
import type { CalendarEvent, CalendarEventType } from '../../types';

const EVENT_META: Record<CalendarEventType, { icon: typeof Camera; color: string; label: string }> = {
  photo: { icon: Camera, color: 'bg-neutral-700 text-neutral-100', label: 'Fotoğraf' },
  medication: { icon: Pill, color: 'bg-neutral-700/60 text-neutral-200', label: 'İlaç' },
  injection: { icon: Syringe, color: 'bg-neutral-600/60 text-neutral-100', label: 'Enjeksiyon' },
  doctorVisit: { icon: Stethoscope, color: 'bg-emerald-900/50 text-emerald-200', label: 'Doktor Ziyareti' },
  missedMoisturizer: { icon: Droplets, color: 'bg-amber-900/50 text-amber-200', label: 'Atlanan Bakım' },
  flare: { icon: Flame, color: 'bg-rose-900/50 text-rose-200', label: 'Alevlenme' },
  note: { icon: StickyNote, color: 'bg-neutral-800 text-neutral-300', label: 'Not' }
};

function pad(n: number) { return n.toString().padStart(2, '0'); }
function toISODate(y: number, m: number, d: number) { return `${y}-${pad(m + 1)}-${pad(d)}`; }

export const CalendarTimeline: React.FC = () => {
  const { calendarEvents, addCalendarEvent, removeCalendarEvent } = useApp();
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string>(toISODate(today.getFullYear(), today.getMonth(), today.getDate()));
  const [showAddForm, setShowAddForm] = useState(false);
  const [newType, setNewType] = useState<CalendarEventType>('note');
  const [newTitle, setNewTitle] = useState('');

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

  const handleAddEvent = () => {
    if (!newTitle.trim()) return;
    addCalendarEvent({ dateISO: selectedDate, type: newType, title: newTitle.trim() });
    setNewTitle('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-neutral-900/60 p-6 rounded-3xl border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-neutral-800 text-neutral-300 border border-neutral-700">
              <CalendarDays className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-semibold text-white tracking-tight">Takvim & Zaman Çizelgesi</h2>
          </div>
          <p className="text-sm text-neutral-400 mt-1">
            Fotoğraf taramaları, ilaçlar, enjeksiyonlar, doktor ziyaretleri ve notların tek bir zaman çizelgesi.
          </p>
        </div>
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
                  className={`relative aspect-square rounded-xl border text-xs font-medium flex flex-col items-center justify-center gap-0.5 transition-all ${
                    isSelected ? 'bg-white text-neutral-950 border-white' : isToday ? 'border-neutral-500 text-neutral-100' : 'border-neutral-800 text-neutral-300 hover:bg-neutral-800/60'
                  }`}
                >
                  <span>{cell.day}</span>
                  {dayEvents.length > 0 && (
                    <span className="flex gap-0.5">
                      {dayEvents.slice(0, 3).map((_ev, i) => (
                        <span key={i} className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-neutral-950' : 'bg-neutral-400'}`} />
                      ))}
                    </span>
                  )}
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
              onClick={() => setShowAddForm(v => !v)}
              className="flex items-center gap-1 text-xs font-semibold text-neutral-200 hover:text-white"
            >
              <Plus className="w-3.5 h-3.5" /> Etkinlik Ekle
            </button>
          </div>

          {showAddForm && (
            <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
              <input
                type="text"
                placeholder="Örn: Doktor kontrolü, alevlenme notu..."
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
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
                  onClick={handleAddEvent}
                  disabled={!newTitle.trim()}
                  className="ml-auto px-3.5 py-1.5 rounded-xl bg-white text-neutral-950 font-semibold text-xs disabled:opacity-40"
                >
                  Ekle
                </button>
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
                  <button onClick={() => removeCalendarEvent(ev.id)} className="p-1.5 rounded-lg text-neutral-600 hover:text-rose-400 hover:bg-rose-500/10 shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
