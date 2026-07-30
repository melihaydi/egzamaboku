import React, { useMemo, useState } from 'react';
import {
  History,
  Pill,
  Syringe,
  Plus,
  Clock,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Pencil,
  Trash2,
  Filter,
  TrendingDown
} from 'lucide-react';
import { useApp } from '../../context/useApp';
import type { TreatmentEntry, BodyLocation } from '../../types';
import { BodyMap } from '../shared/BodyMap';

const BODY_AREAS: BodyLocation[] = ['Sol Kol', 'Sağ Kol', 'Yüz & Boyun', 'Eller & Bilekler', 'Göğüs & Sırt', 'Bacaklar'];

// "YYYY-MM" biçimindeki tarihleri okunabilir Türkçe ay/yıl olarak gösterir. Eski (göç
// edilmemiş) serbest metin tarihleri bu biçimle eşleşmezse olduğu gibi gösterilir — veri
// kaybı veya çökme olmaz.
function formatTreatmentDate(value: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return value;
  const [, year, month] = match;
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
}

export const TreatmentHistory: React.FC = () => {
  const { treatmentHistory, addTreatmentEntry, updateTreatmentEntry, removeTreatmentEntry, cvHistory, t } = useApp();
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [medicationName, setMedicationName] = useState<string>('');
  const [drugClass, setDrugClass] = useState<string>('');
  const [route, setRoute] = useState<string>('');
  const [bodyArea, setBodyArea] = useState<BodyLocation | ''>('');
  const [startDate, setStartDate] = useState<string>('');
  const [isOngoing, setIsOngoing] = useState<boolean>(true);
  const [endDate, setEndDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [showBodyMap, setShowBodyMap] = useState<boolean>(false);
  const [filterMedication, setFilterMedication] = useState('');
  const [filterBodyArea, setFilterBodyArea] = useState<BodyLocation | 'Tümü'>('Tümü');

  const resetForm = () => {
    setMedicationName('');
    setDrugClass('');
    setRoute('');
    setBodyArea('');
    setStartDate('');
    setIsOngoing(true);
    setEndDate('');
    setNotes('');
    setEditingId(null);
  };

  const handleAddTreatment = () => {
    if (!medicationName || !startDate) return;

    if (editingId) {
      updateTreatmentEntry(editingId, {
        medicationName, drugClass: drugClass || 'Belirtilmedi', route: route || 'Belirtilmedi',
        bodyArea: bodyArea || undefined, startDate, endDate: isOngoing ? null : (endDate || null),
        status: isOngoing ? 'Devam Ediyor' : 'Sonlandırıldı', notes: notes || undefined
      });
    } else {
      const newEntry: TreatmentEntry = {
        id: `tx-${Date.now()}`,
        medicationName,
        drugClass: drugClass || 'Belirtilmedi',
        route: route || 'Belirtilmedi',
        bodyArea: bodyArea || undefined,
        startDate,
        endDate: isOngoing ? null : (endDate || null),
        durationLabel: isOngoing ? 'Devam Ediyor' : 'Sonlandırıldı',
        status: isOngoing ? 'Devam Ediyor' : 'Sonlandırıldı',
        notes: notes || undefined
      };
      addTreatmentEntry(newEntry);
    }
    resetForm();
    setShowForm(false);
  };

  const startEdit = (entry: TreatmentEntry) => {
    setEditingId(entry.id);
    setMedicationName(entry.medicationName);
    setDrugClass(entry.drugClass);
    setRoute(entry.route);
    setBodyArea(entry.bodyArea || '');
    setStartDate(entry.startDate);
    setIsOngoing(entry.status === 'Devam Ediyor');
    setEndDate(entry.endDate || '');
    setNotes(entry.notes || '');
    setShowForm(true);
  };

  const filteredHistory = treatmentHistory
    .filter(entry => {
      const matchesMed = !filterMedication || entry.medicationName.toLowerCase().includes(filterMedication.toLowerCase());
      const matchesArea = filterBodyArea === 'Tümü' || entry.bodyArea === filterBodyArea;
      return matchesMed && matchesArea;
    })
    .sort((a, b) => b.startDate.localeCompare(a.startDate));

  // Gerçek fotoğraf analizi geçmişinden ilerleme grafiği: etkilenen alan (cm²) zaman içinde
  const progressPoints = useMemo(() => {
    return [...cvHistory]
      .sort((a, b) => new Date(a.timestamp.replace(',', '')).getTime() - new Date(b.timestamp.replace(',', '')).getTime())
      .map(cv => ({ label: cv.timestamp.split(',')[0], value: cv.surfaceAreaCm2, location: cv.location }));
  }, [cvHistory]);

  const maxArea = Math.max(1, ...progressPoints.map(p => p.value));

  return (
    <div className="space-y-6">
      {/* Üst Şerit */}
      <div className="bg-neutral-900/60 p-6 rounded-3xl border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-neutral-800 text-neutral-300 border border-neutral-700">
              <History className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {t('title.treatment')}
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Geçmişte ve halen kullanılan sistemik/biyolojik tedavilerin kronolojik kaydı — düzenlenebilir ve filtrelenebilir.
          </p>
        </div>

        <button
          onClick={() => { resetForm(); setShowForm(v => !v); }}
          className="px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 font-bold text-xs flex items-center gap-2 shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          Yeni Tedavi Kaydı Ekle
        </button>
      </div>

      {/* İlerleme Grafiği (Gerçek Fotoğraf Analizi Verisinden) */}
      {progressPoints.length > 1 && (
        <div className="bg-neutral-900/60 p-6 rounded-3xl border border-neutral-800 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-neutral-500" />
            İlerleme Grafiği — Etkilenen Alan (cm²)
          </h3>
          <p className="text-[11px] text-neutral-500">Fotoğraf analizlerinden ölçülen gerçek etkilenen alan verisi, kronolojik sırayla.</p>
          <div className="h-32 flex items-end gap-2">
            {progressPoints.map((p, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative">
                <span className="text-[9px] text-neutral-400 opacity-0 group-hover:opacity-100 absolute -top-5">{p.value} cm²</span>
                <div className="w-full rounded-t-md bg-neutral-600 group-hover:bg-neutral-400 transition-all" style={{ height: `${(p.value / maxArea) * 100}%` }} />
                <span className="text-[9px] text-neutral-600 truncate w-full text-center">{p.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtreler */}
      <div className="bg-neutral-900/60 p-4 rounded-2xl border border-neutral-800 flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-semibold text-neutral-500 flex items-center gap-1"><Filter className="w-3.5 h-3.5" /> Filtrele:</span>
        <input
          type="text"
          placeholder="İlaç adına göre ara..."
          value={filterMedication}
          onChange={e => setFilterMedication(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none"
        />
        <select
          value={filterBodyArea}
          onChange={e => setFilterBodyArea(e.target.value as BodyLocation | 'Tümü')}
          className="px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 focus:outline-none"
        >
          <option value="Tümü">Tüm Bölgeler</option>
          {BODY_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {/* Yeni/Düzenle Formu */}
      {showForm && (
        <div className="bg-neutral-900/60 p-6 rounded-3xl border border-neutral-800 space-y-4">
          <h3 className="text-sm font-bold text-white">{editingId ? 'Tedavi Kaydını Düzenle' : 'Yeni Tedavi Kaydı'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">İlaç / Tedavi Adı</label>
              <input
                type="text"
                placeholder="Örn: Dupixent (Dupilumab)"
                value={medicationName}
                onChange={e => setMedicationName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">Tedavi Sınıfı</label>
              <input
                type="text"
                placeholder="Örn: Biyolojik Tedavi (IL-4/IL-13 İnhibitörü)"
                value={drugClass}
                onChange={e => setDrugClass(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">Uygulama Yolu</label>
              <input
                type="text"
                placeholder="Örn: Subkütan Enjeksiyon (14 Günde Bir)"
                value={route}
                onChange={e => setRoute(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold uppercase text-neutral-400">Vücut Bölgesi (isteğe bağlı)</label>
                <button type="button" onClick={() => setShowBodyMap(v => !v)} className="text-[10px] font-semibold text-neutral-400 hover:text-white">
                  {showBodyMap ? 'Haritayı Gizle' : 'Vücut Haritasından Seç'}
                </button>
              </div>
              <select
                value={bodyArea}
                onChange={e => setBodyArea(e.target.value as BodyLocation | '')}
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 focus:outline-none"
              >
                <option value="">Belirtilmedi</option>
                {BODY_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            {showBodyMap && (
              <div className="md:col-span-2 p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                <BodyMap value={bodyArea} onSelect={loc => { setBodyArea(loc); setShowBodyMap(false); }} />
              </div>
            )}
            <div>
              <label className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">Başlangıç Tarihi</label>
              <input
                type="month"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isOngoing}
                onChange={e => setIsOngoing(e.target.checked)}
                className="accent-neutral-300 rounded"
                id="ongoing-checkbox"
              />
              <label htmlFor="ongoing-checkbox" className="text-xs text-neutral-300">Halen devam ediyor</label>
            </div>

            {!isOngoing && (
              <div>
                <label className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">Bitiş Tarihi</label>
                <input
                  type="month"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none"
                />
              </div>
            )}

            <div className="md:col-span-2">
              <label className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">Notlar (Yan Etki, Yanıt vb.)</label>
              <textarea
                placeholder="Tedaviye yanıt, yan etkiler veya geçiş sebebi..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none resize-none"
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
              {editingId ? 'Değişiklikleri Kaydet' : 'Kaydı Ekle'}
            </button>
            <button
              onClick={() => { resetForm(); setShowForm(false); }}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 font-semibold text-xs"
            >
              Vazgeç
            </button>
          </div>
        </div>
      )}

      {/* Kronolojik Zaman Çizelgesi */}
      <div className="bg-neutral-900/60 p-6 rounded-3xl border border-neutral-800">
        <div className="relative space-y-6 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-800">
          {filteredHistory.map((entry) => {
            const isOngoingEntry = entry.status === 'Devam Ediyor';
            const Icon = entry.route.toLowerCase().includes('enjeksiyon') ? Syringe : Pill;

            return (
              <div key={entry.id} className="relative pl-12">
                <div className={`absolute left-0 top-0 w-10 h-10 rounded-2xl flex items-center justify-center border-2 ${
                  isOngoingEntry
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className={`p-4 rounded-2xl border space-y-2 ${
                  isOngoingEntry ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-neutral-950 border-neutral-800'
                }`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-white">{entry.medicationName}</h4>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isOngoingEntry
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                      }`}>
                        {isOngoingEntry ? 'Devam Ediyor' : 'Sonlandırıldı'}
                      </span>
                      <button onClick={() => startEdit(entry)} className="p-1 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => removeTreatmentEntry(entry.id)} className="p-1 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-neutral-400">{entry.drugClass} • {entry.route}{entry.bodyArea ? ` • ${entry.bodyArea}` : ''}</p>

                  <div className="flex items-center gap-2 text-[11px] font-semibold text-neutral-300">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatTreatmentDate(entry.startDate)}</span>
                    <ArrowRight className="w-3 h-3 text-neutral-500" />
                    <span>{entry.endDate ? formatTreatmentDate(entry.endDate) : 'Günümüz'}</span>
                    <span className="text-neutral-500">•</span>
                    <span className="text-neutral-300">{entry.durationLabel}</span>
                  </div>

                  {entry.reasonForChange && (
                    <p className="text-[11px] text-neutral-300 leading-relaxed pt-1 border-t border-neutral-800/80">
                      <strong className="text-neutral-200">Geçiş Nedeni: </strong>
                      {entry.reasonForChange}
                    </p>
                  )}

                  {entry.notes && (
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      <strong className="text-neutral-300">Not: </strong>
                      {entry.notes}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {filteredHistory.length === 0 && (
            <p className="text-xs text-neutral-500 pl-12">Filtreye uyan tedavi geçmişi bulunamadı.</p>
          )}
        </div>
      </div>

      {/* Bilgilendirme Notu */}
      <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-400 flex items-start gap-2">
        <HelpCircle className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Bu kronoloji yalnızca kişisel kayıt tutma amaçlıdır ve tıbbi tavsiye niteliği taşımaz. İlaç değişikliği, doz ayarlaması veya tedavi kesilmesi konusunda her zaman tedaviyi takip eden hekiminize danışın.
        </p>
      </div>
    </div>
  );
};
