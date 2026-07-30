import React, { useState } from 'react';
import {
  NotebookText,
  Plus,
  Trash2,
  Pencil,
  ShieldAlert,
  StickyNote,
  Stethoscope,
  History,
  X,
  Check
} from 'lucide-react';
import { useApp } from '../../context/useApp';
import type { JournalCategory, JournalEntry } from '../../types';

const CATEGORY_META: Record<JournalCategory, { icon: typeof ShieldAlert; color: string }> = {
  'Alerji': { icon: ShieldAlert, color: 'bg-rose-900/40 text-rose-200' },
  'Kişisel Not': { icon: StickyNote, color: 'bg-neutral-800 text-neutral-300' },
  'Doktor Notu': { icon: Stethoscope, color: 'bg-emerald-900/40 text-emerald-200' },
  'Tıbbi Geçmiş': { icon: History, color: 'bg-neutral-700/60 text-neutral-200' }
};

const CATEGORIES: JournalCategory[] = ['Alerji', 'Kişisel Not', 'Doktor Notu', 'Tıbbi Geçmiş'];

export const HealthJournal: React.FC = () => {
  const { journalEntries, addJournalEntry, updateJournalEntry, removeJournalEntry, t } = useApp();
  const [activeCategory, setActiveCategory] = useState<JournalCategory>('Alerji');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [severity, setSeverity] = useState<'Hafif' | 'Orta' | 'Şiddetli'>('Orta');

  const resetForm = () => {
    setTitle('');
    setContent('');
    setSeverity('Orta');
    setShowForm(false);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!title.trim()) return;
    const date = new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });

    if (editingId) {
      updateJournalEntry(editingId, { title: title.trim(), content: content.trim(), severity: activeCategory === 'Alerji' ? severity : undefined });
    } else {
      const entry: Omit<JournalEntry, 'id'> = {
        category: activeCategory,
        title: title.trim(),
        content: content.trim(),
        date,
        severity: activeCategory === 'Alerji' ? severity : undefined
      };
      addJournalEntry(entry);
    }
    resetForm();
  };

  const startEdit = (entry: JournalEntry) => {
    setActiveCategory(entry.category);
    setEditingId(entry.id);
    setTitle(entry.title);
    setContent(entry.content);
    setSeverity(entry.severity || 'Orta');
    setShowForm(true);
  };

  const filteredEntries = journalEntries.filter(e => e.category === activeCategory);

  return (
    <div className="space-y-6">
      <div className="bg-neutral-900/60 p-6 rounded-3xl border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-neutral-800 text-neutral-300 border border-neutral-700">
              <NotebookText className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-semibold text-white tracking-tight">{t('title.journal')}</h2>
          </div>
          <p className="text-sm text-neutral-400 mt-1">
            Alerjilerini, kişisel notlarını, doktor notlarını ve tıbbi geçmişini kendi düzenleyebileceğin bir günlük.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:flex gap-1 rounded-2xl bg-neutral-950 p-1 border border-neutral-800">
        {CATEGORIES.map(cat => {
          const meta = CATEGORY_META[cat];
          const Icon = meta.icon;
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`sm:flex-1 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                isActive ? 'bg-white text-neutral-950' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{cat}</span>
            </button>
          );
        })}
      </div>

      <div className="bg-neutral-900/60 p-6 rounded-3xl border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">{activeCategory} Kayıtları</h3>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-neutral-950 font-semibold text-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Yeni Kayıt
            </button>
          )}
        </div>

        {showForm && (
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-300">{editingId ? 'Kaydı Düzenle' : 'Yeni Kayıt'} — {activeCategory}</span>
              <button onClick={resetForm} aria-label="Formu Kapat" className="p-1 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800">
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Başlık (Örn: Polen Alerjisi, Kontrol Notu...)"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none"
            />
            <textarea
              rows={3}
              placeholder="Detaylar..."
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none resize-none"
            />
            {activeCategory === 'Alerji' && (
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value as 'Hafif' | 'Orta' | 'Şiddetli')}
                className="px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 focus:outline-none"
              >
                <option value="Hafif">Hafif</option>
                <option value="Orta">Orta</option>
                <option value="Şiddetli">Şiddetli</option>
              </select>
            )}
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className="px-4 py-2 rounded-xl bg-white text-neutral-950 font-semibold text-xs disabled:opacity-40 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" /> Kaydet
            </button>
          </div>
        )}

        <div className="space-y-2">
          {filteredEntries.map(entry => (
            <div key={entry.id} className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-semibold text-white">{entry.title}</h4>
                  {entry.severity && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      entry.severity === 'Şiddetli' ? 'bg-rose-500/15 text-rose-300' : entry.severity === 'Orta' ? 'bg-amber-500/15 text-amber-300' : 'bg-emerald-500/15 text-emerald-300'
                    }`}>
                      {entry.severity}
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{entry.content}</p>
                <span className="text-[10px] text-neutral-600 font-medium mt-1 block">{entry.date}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => startEdit(entry)} aria-label="Kaydı Düzenle" className="p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => removeJournalEntry(entry.id)} aria-label="Kaydı Sil" className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          {filteredEntries.length === 0 && (
            <p className="text-xs text-neutral-500 text-center py-8">Bu kategoride henüz bir kayıt yok.</p>
          )}
        </div>
      </div>
    </div>
  );
};
