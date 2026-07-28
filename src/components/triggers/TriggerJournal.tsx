import React, { useMemo, useState } from 'react';
import { ShieldAlert, Plus, Trash2, Info } from 'lucide-react';
import { useApp } from '../../context/useApp';
import type { TriggerCategory } from '../../types';

const CATEGORIES: TriggerCategory[] = ['Gıda', 'Çevresel', 'Ürün', 'Diğer'];

export const TriggerJournal: React.FC = () => {
  const { triggerEntries, addTriggerEntry, removeTriggerEntry } = useApp();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<TriggerCategory>('Gıda');
  const [severity, setSeverity] = useState(5);
  const [reasonNote, setReasonNote] = useState('');
  const [filter, setFilter] = useState<TriggerCategory | 'Tümü'>('Tümü');

  const filtered = filter === 'Tümü' ? triggerEntries : triggerEntries.filter(t => t.category === filter);

  const recurring = useMemo(() => {
    const counts: Record<string, number> = {};
    triggerEntries.forEach(t => { counts[t.name.toLowerCase()] = (counts[t.name.toLowerCase()] || 0) + 1; });
    return Object.entries(counts).filter(([, count]) => count > 1).map(([n, count]) => ({ name: n, count }));
  }, [triggerEntries]);

  const handleAdd = () => {
    if (!name.trim() || !reasonNote.trim()) return;
    addTriggerEntry({
      name: name.trim(),
      category,
      dateISO: new Date().toISOString().slice(0, 10),
      severity,
      reasonNote: reasonNote.trim()
    });
    setName('');
    setReasonNote('');
    setSeverity(5);
  };

  return (
    <div className="space-y-6">
      <div className="bg-neutral-900/60 p-6 rounded-3xl border border-neutral-800">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-neutral-800 text-neutral-300 border border-neutral-700">
            <ShieldAlert className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-semibold text-white tracking-tight">Tetikleyici Günlüğü</h2>
        </div>
        <p className="text-xs text-neutral-400 mt-1">
          Bir şeyin alevlenmene neden olduğunu düşünüyorsan burada kaydet: ne, ne zaman, ne kadar şiddetli ve neden öyle düşündüğün. Uygulama sana bir tetikleyici önermez veya tahmin etmez — yalnızca kendi kayıtlarını gösterir.
        </p>
      </div>

      {recurring.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/25 text-xs text-amber-200 flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            Kendi kayıtlarına göre tekrar eden girişler: {recurring.map(r => `${r.name} (${r.count}x)`).join(', ')}. Bu yalnızca senin girdiğin verilerin bir özetidir, tıbbi bir tanı değildir.
          </p>
        </div>
      )}

      <div className="bg-neutral-900/60 p-6 rounded-3xl border border-neutral-800 space-y-3">
        <h3 className="text-sm font-semibold text-white">Yeni Tetikleyici Kaydı</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Ne? (Örn: Yumurta, Yün Kazak, Yeni Deterjan)"
            value={name}
            onChange={e => setName(e.target.value)}
            className="px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none"
          />
          <select
            value={category}
            onChange={e => setCategory(e.target.value as TriggerCategory)}
            className="px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 focus:outline-none"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-neutral-400">
            <span>Şiddet</span>
            <span>{severity}/10</span>
          </div>
          <input type="range" min={0} max={10} value={severity} onChange={e => setSeverity(Number(e.target.value))} className="w-full accent-white" />
        </div>
        <textarea
          placeholder="Bunun bir tetikleyici olduğunu neden düşünüyorsun?"
          value={reasonNote}
          onChange={e => setReasonNote(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none resize-none"
        />
        <button onClick={handleAdd} disabled={!name.trim() || !reasonNote.trim()} className="px-4 py-2 rounded-xl bg-white text-neutral-950 font-semibold text-xs disabled:opacity-40 flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Kaydet
        </button>
      </div>

      <div className="bg-neutral-900/60 p-6 rounded-3xl border border-neutral-800 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-semibold text-white">Kayıtlar ({filtered.length})</h3>
          <div className="flex rounded-xl bg-neutral-950 p-1 border border-neutral-800">
            {(['Tümü', ...CATEGORIES] as const).map(c => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold ${filter === c ? 'bg-white text-neutral-950' : 'text-neutral-400'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {filtered.map(entry => (
            <div key={entry.id} className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-semibold text-white">{entry.name}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400">{entry.category}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300">Şiddet: {entry.severity}/10</span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">{entry.reasonNote}</p>
                <span className="text-[10px] text-neutral-600">{entry.dateISO}</span>
              </div>
              <button onClick={() => removeTriggerEntry(entry.id)} className="p-1.5 rounded-lg text-neutral-600 hover:text-rose-400 hover:bg-rose-500/10 shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-xs text-neutral-500 text-center py-6">Bu kategoride kayıt yok.</p>}
        </div>
      </div>
    </div>
  );
};
