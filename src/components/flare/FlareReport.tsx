import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Trash2,
  Scan,
  UserCheck,
  Layers,
  Info,
  Check
} from 'lucide-react';
import { useApp } from '../../context/useApp';
import type { SymptomEntry } from '../../types';

const SYMPTOM_FIELDS: Array<{ key: keyof Pick<SymptomEntry, 'itching' | 'pain' | 'burning' | 'dryness' | 'cracking' | 'bleeding' | 'sleepImpact'>; label: string }> = [
  { key: 'itching', label: 'Kaşıntı' },
  { key: 'pain', label: 'Ağrı' },
  { key: 'burning', label: 'Yanma / Batma' },
  { key: 'dryness', label: 'Kuruluk (hissedilen)' },
  { key: 'cracking', label: 'Çatlama (hissedilen)' },
  { key: 'bleeding', label: 'Kanama' },
  { key: 'sleepImpact', label: 'Uykuya Etkisi' }
];

const CV_METRICS: Array<{ key: 'redness' | 'scaling' | 'swelling' | 'crusting' | 'oozing'; label: string }> = [
  { key: 'redness', label: 'Kızarıklık' },
  { key: 'scaling', label: 'Soyulma' },
  { key: 'swelling', label: 'Şişlik' },
  { key: 'crusting', label: 'Kabuklanma' },
  { key: 'oozing', label: 'Sızıntı' }
];

const EMPTY_SLIDERS = { itching: 0, pain: 0, burning: 0, dryness: 0, cracking: 0, bleeding: 0, sleepImpact: 0 };

function extractSliderValues(entry: SymptomEntry): Record<string, number> {
  return {
    itching: entry.itching,
    pain: entry.pain,
    burning: entry.burning,
    dryness: entry.dryness,
    cracking: entry.cracking,
    bleeding: entry.bleeding,
    sleepImpact: entry.sleepImpact
  };
}

function severityColor(score: number) {
  if (score > 70) return '#f43f5e';
  if (score > 45) return '#fb923c';
  if (score > 20) return '#fbbf24';
  return '#34d399';
}

function severityLabel(score: number) {
  if (score > 70) return 'Çok Şiddetli';
  if (score > 45) return 'Şiddetli';
  if (score > 20) return 'Orta';
  return 'Hafif';
}

export const FlareReport: React.FC = () => {
  const { symptomEntries, addSymptomEntry, updateSymptomEntry, removeSymptomEntry, cvHistory, activeProfile, t } = useApp();
  const todayISO = new Date().toISOString().slice(0, 10);
  const todayEntry = symptomEntries.find(e => e.dateISO === todayISO);

  const [sliders, setSliders] = useState<Record<string, number>>(todayEntry ? extractSliderValues(todayEntry) : { ...EMPTY_SLIDERS });
  const [note, setNote] = useState(todayEntry?.note || '');
  const [justSaved, setJustSaved] = useState(false);

  // Bugüne ait kayıt başka bir yerden (örn. sayfa yenilendiğinde localStorage'dan) yüklendiğinde
  // slider değerlerini o kayıtla eşitle; böylece girilen değer asla sıfıra dönmüş gibi görünmez.
  useEffect(() => {
    if (todayEntry) {
      setSliders(extractSliderValues(todayEntry));
      setNote(todayEntry.note || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayEntry?.id]);

  const latestSymptom = symptomEntries[0];
  const latestCV = cvHistory[0];

  const userScore = latestSymptom
    ? Math.round((SYMPTOM_FIELDS.reduce((sum, f) => sum + latestSymptom[f.key], 0) / SYMPTOM_FIELDS.length) * 10)
    : null;

  const visualScore = latestCV
    ? Math.round(CV_METRICS.reduce((sum, m) => sum + latestCV[m.key], 0) / CV_METRICS.length)
    : null;

  const combinedScore = userScore !== null && visualScore !== null
    ? Math.round((userScore + visualScore) / 2)
    : userScore ?? visualScore;

  const handleSave = () => {
    const payload = {
      itching: sliders.itching,
      pain: sliders.pain,
      burning: sliders.burning,
      dryness: sliders.dryness,
      cracking: sliders.cracking,
      bleeding: sliders.bleeding,
      sleepImpact: sliders.sleepImpact,
      note: note.trim() || undefined
    };

    if (todayEntry) {
      // Bugün için zaten bir kayıt varsa yeni bir tane oluşturmak yerine onu güncelle;
      // böylece aynı gün içinde birden fazla kayıt birikmez ve girdiğin değer korunur.
      updateSymptomEntry(todayEntry.id, { ...payload, timestamp: new Date().toLocaleString('tr-TR') });
    } else {
      addSymptomEntry({ dateISO: todayISO, ...payload });
    }

    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-neutral-900/60 p-6 rounded-3xl border border-neutral-800">
        <h2 className="text-xl font-semibold text-white tracking-tight">{t('title.overview')}</h2>
        <p className="text-sm text-neutral-400 mt-1">
          {activeProfile.name} için — belirtilerini SEN puanlarsın, yapay zeka yalnızca yüklediğin fotoğrafta görüneni ölçer. Hiçbir belirti skoru otomatik tahmin edilmez.
        </p>
        {activeProfile.primaryLocations.length > 0 && (
          <p className="text-[11px] text-neutral-500 mt-2">
            Genelde etkilenen bölgeler: {activeProfile.primaryLocations.join(', ')}
          </p>
        )}
      </div>

      {/* Birleşik Skor */}
      {combinedScore !== null && (
        <div className="bg-neutral-900/60 p-6 md:p-8 rounded-3xl border border-neutral-800">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="relative w-40 h-40 rounded-full flex items-center justify-center bg-neutral-950 border border-neutral-800 shrink-0">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" className="stroke-neutral-800" strokeWidth="7" fill="transparent" />
                <circle
                  cx="50" cy="50" r="42" strokeWidth="7" strokeDasharray={264}
                  strokeDashoffset={264 - (264 * combinedScore) / 100}
                  strokeLinecap="round" fill="transparent"
                  style={{ stroke: severityColor(combinedScore), transition: 'stroke-dashoffset 0.8s ease' }}
                />
              </svg>
              <div className="text-center z-10">
                <span className="text-4xl font-semibold text-white">{combinedScore}</span>
                <span className="text-xs text-neutral-500 block">/ 100</span>
                <span className="text-[11px] font-semibold uppercase" style={{ color: severityColor(combinedScore) }}>{severityLabel(combinedScore)}</span>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                <span className="text-[10px] uppercase font-semibold text-neutral-500 flex items-center gap-1.5"><UserCheck className="w-3.5 h-3.5" /> Kullanıcı Bildirimi</span>
                {userScore !== null ? (
                  <>
                    <span className="text-2xl font-semibold text-white block mt-1">{userScore}/100</span>
                    <span className="text-[11px] text-neutral-500">7 belirti sliderının ortalaması — {latestSymptom.timestamp}</span>
                  </>
                ) : (
                  <span className="text-xs text-neutral-500 block mt-1">Henüz belirti girişi yok. Aşağıdan ekleyebilirsin.</span>
                )}
              </div>
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                <span className="text-[10px] uppercase font-semibold text-neutral-500 flex items-center gap-1.5"><Scan className="w-3.5 h-3.5" /> Görsel Analiz</span>
                {visualScore !== null ? (
                  <>
                    <span className="text-2xl font-semibold text-white block mt-1">{visualScore}/100</span>
                    <span className="text-[11px] text-neutral-500">{latestCV.location} • {CV_METRICS.length} ölçümün ortalaması — {latestCV.timestamp}</span>
                  </>
                ) : (
                  <span className="text-xs text-neutral-500 block mt-1">Henüz fotoğraf analizi yok.</span>
                )}
              </div>
            </div>
          </div>
          <p className="text-[11px] text-neutral-500 mt-4 flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            Birleşik skor, iki kaynağın basit ortalamasıdır; her iki kaynak da yoksa yalnızca mevcut olan gösterilir, eksik veri asla tahmin edilmez.
          </p>
        </div>
      )}

      {/* Belirti Girişi */}
      <div className="bg-neutral-900/60 p-6 rounded-3xl border border-neutral-800 space-y-5">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-neutral-500" />
            Bugünkü Belirtilerini Puanla
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            Her belirti için 0 (yok) ile 10 (çok şiddetli) arasında bir değer seç. {todayEntry ? 'Bugün için daha önce kaydettiğin değerler aşağıda; değiştirip tekrar kaydedebilirsin.' : ''}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {SYMPTOM_FIELDS.map(f => (
            <div key={f.key} className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-neutral-300">{f.label}</span>
                <span className="text-white">{sliders[f.key]}/10</span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                value={sliders[f.key]}
                onChange={e => setSliders(prev => ({ ...prev, [f.key]: Number(e.target.value) }))}
                className="w-full accent-white cursor-pointer"
              />
            </div>
          ))}
        </div>

        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="İsteğe bağlı not (örn: gece uyandım, yeni bir ürün denedim...)"
          rows={2}
          className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none resize-none"
        />

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 font-semibold text-xs"
          >
            {todayEntry ? 'Bugünün Belirtilerini Güncelle' : 'Bugünün Belirtilerini Kaydet'}
          </button>
          {justSaved && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Kaydedildi
            </span>
          )}
        </div>
      </div>

      {/* Geçmiş */}
      <div className="bg-neutral-900/60 p-6 rounded-3xl border border-neutral-800 space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-neutral-500" />
          Belirti Geçmişi
        </h3>
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {symptomEntries.map(entry => (
            <div key={entry.id} className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-300">
                  {entry.timestamp}
                  {entry.dateISO === todayISO && <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 uppercase font-semibold">Bugün</span>}
                </span>
                <button onClick={() => removeSymptomEntry(entry.id)} aria-label="Kaydı Sil" className="p-1 rounded-lg text-neutral-600 hover:text-rose-400 hover:bg-rose-500/10">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SYMPTOM_FIELDS.map(f => (
                  <span key={f.key} className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300">
                    {f.label}: {entry[f.key]}/10
                  </span>
                ))}
              </div>
              {entry.note && <p className="text-[11px] text-neutral-400 italic">"{entry.note}"</p>}
            </div>
          ))}
          {symptomEntries.length === 0 && (
            <p className="text-xs text-neutral-500 text-center py-6">Henüz belirti kaydı yok.</p>
          )}
        </div>
      </div>
    </div>
  );
};
