import React, { useState } from 'react';
import {
  History,
  Pill,
  Syringe,
  Plus,
  Clock,
  ArrowRight,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { TreatmentEntry } from '../../types';

export const TreatmentHistory: React.FC = () => {
  const { treatmentHistory, addTreatmentEntry } = useApp();
  const [showForm, setShowForm] = useState<boolean>(false);

  const [medicationName, setMedicationName] = useState<string>('');
  const [drugClass, setDrugClass] = useState<string>('');
  const [route, setRoute] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [isOngoing, setIsOngoing] = useState<boolean>(true);
  const [endDate, setEndDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const resetForm = () => {
    setMedicationName('');
    setDrugClass('');
    setRoute('');
    setStartDate('');
    setIsOngoing(true);
    setEndDate('');
    setNotes('');
  };

  const handleAddTreatment = () => {
    if (!medicationName || !startDate) return;

    const newEntry: TreatmentEntry = {
      id: `tx-${Date.now()}`,
      medicationName,
      drugClass: drugClass || 'Belirtilmedi',
      route: route || 'Belirtilmedi',
      startDate,
      endDate: isOngoing ? null : (endDate || null),
      durationLabel: isOngoing ? 'Devam Ediyor' : 'Sonlandırıldı',
      status: isOngoing ? 'Devam Ediyor' : 'Sonlandırıldı',
      notes: notes || undefined
    };

    addTreatmentEntry(newEntry);
    resetForm();
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Üst Şerit */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <History className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Tedavi Geçmişi Kronolojisi
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Geçmişte ve halen kullanılan sistemik/biyolojik tedavilerin kronolojik kaydı. Doktor görüşmelerinde ve raporlarda otomatik olarak kullanılır.
          </p>
        </div>

        <button
          onClick={() => setShowForm(v => !v)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-600 hover:from-indigo-400 text-white font-bold text-xs flex items-center gap-2 shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          Yeni Tedavi Kaydı Ekle
        </button>
      </div>

      {/* Yeni Kayıt Formu */}
      {showForm && (
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white">Yeni Tedavi Kaydı</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">İlaç / Tedavi Adı</label>
              <input
                type="text"
                placeholder="Örn: Dupixent (Dupilumab)"
                value={medicationName}
                onChange={e => setMedicationName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Tedavi Sınıfı</label>
              <input
                type="text"
                placeholder="Örn: Biyolojik Tedavi (IL-4/IL-13 İnhibitörü)"
                value={drugClass}
                onChange={e => setDrugClass(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Uygulama Yolu</label>
              <input
                type="text"
                placeholder="Örn: Subkütan Enjeksiyon (14 Günde Bir)"
                value={route}
                onChange={e => setRoute(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Başlangıç Tarihi</label>
              <input
                type="text"
                placeholder="Örn: Şubat 2026"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isOngoing}
                onChange={e => setIsOngoing(e.target.checked)}
                className="accent-sky-500 rounded"
                id="ongoing-checkbox"
              />
              <label htmlFor="ongoing-checkbox" className="text-xs text-slate-300">Halen devam ediyor</label>
            </div>

            {!isOngoing && (
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Bitiş Tarihi</label>
                <input
                  type="text"
                  placeholder="Örn: Şubat 2026"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            )}

            <div className="md:col-span-2">
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Notlar (Yan Etki, Yanıt vb.)</label>
              <textarea
                placeholder="Tedaviye yanıt, yan etkiler veya geçiş sebebi..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none resize-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAddTreatment}
              disabled={!medicationName || !startDate}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Kaydı Ekle
            </button>
            <button
              onClick={() => { resetForm(); setShowForm(false); }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold text-xs"
            >
              Vazgeç
            </button>
          </div>
        </div>
      )}

      {/* Kronolojik Zaman Çizelgesi */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
        <div className="relative space-y-6 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          {treatmentHistory.map((entry) => {
            const isOngoingEntry = entry.status === 'Devam Ediyor';
            const Icon = entry.route.toLowerCase().includes('enjeksiyon') ? Syringe : Pill;

            return (
              <div key={entry.id} className="relative pl-12">
                <div className={`absolute left-0 top-0 w-10 h-10 rounded-2xl flex items-center justify-center border-2 ${
                  isOngoingEntry
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className={`p-4 rounded-2xl border space-y-2 ${
                  isOngoingEntry ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-slate-950 border-slate-800'
                }`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-white">{entry.medicationName}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isOngoingEntry
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {isOngoingEntry ? 'Devam Ediyor' : 'Sonlandırıldı'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400">{entry.drugClass} • {entry.route}</p>

                  <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                    <span>{entry.startDate}</span>
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                    <span>{entry.endDate || 'Günümüz'}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-sky-300">{entry.durationLabel}</span>
                  </div>

                  {entry.reasonForChange && (
                    <p className="text-[11px] text-slate-300 leading-relaxed pt-1 border-t border-slate-800/80">
                      <strong className="text-slate-200">Geçiş Nedeni: </strong>
                      {entry.reasonForChange}
                    </p>
                  )}

                  {entry.notes && (
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      <strong className="text-slate-300">Not: </strong>
                      {entry.notes}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {treatmentHistory.length === 0 && (
            <p className="text-xs text-slate-500 pl-12">Henüz kayıtlı tedavi geçmişi bulunmuyor.</p>
          )}
        </div>
      </div>

      {/* Bilgilendirme Notu */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
        <HelpCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Bu kronoloji yalnızca kişisel kayıt tutma amaçlıdır ve tıbbi tavsiye niteliği taşımaz. İlaç değişikliği, doz ayarlaması veya tedavi kesilmesi konusunda her zaman tedaviyi takip eden hekiminize danışın.
        </p>
      </div>
    </div>
  );
};
