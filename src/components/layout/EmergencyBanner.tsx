import React, { useState } from 'react';
import { AlertOctagon, PhoneCall, ShieldAlert, X, HeartPulse } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const EmergencyBanner: React.FC = () => {
  const { emergencyModalOpen, setEmergencyModalOpen } = useApp();
  const [symptomForm, setSymptomForm] = useState({
    fever: false,
    swelling: false,
    spreadingFast: false,
    eyeInvolvement: false,
    pusOozing: false
  });

  const hasWarning = Object.values(symptomForm).some(Boolean);

  return (
    <>
      {/* Üst Uyarı Şeridi */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-200 px-4 py-2 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-4xl">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
          <span>
            <strong>Acil Durum Değerlendirme Protokolü:</strong> Yüksek ateş, yüzde aniden gelişen şişlik, sarı iltihaplı kabuklanma veya göz çevresinde şiddetli ağrı varsa hemen tıbbi yardım alın.
          </span>
        </div>
        <button
          onClick={() => setEmergencyModalOpen(true)}
          className="underline font-semibold hover:text-amber-100 text-xs shrink-0 ml-2"
        >
          Belirtileri Kontrol Et &rarr;
        </button>
      </div>

      {/* Acil Durum Modal */}
      {emergencyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-xl w-full p-6 text-slate-100 shadow-2xl space-y-6 relative">
            <button
              onClick={() => setEmergencyModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
              <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <AlertOctagon className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-rose-300">
                  Tıbbi Acil Durum & Komplikasyon Kontrolü
                </h2>
                <p className="text-xs text-slate-400">
                  Egzamada acil tıbbi müdahale gerektiren ciddi enfeksiyon belirtilerini değerlendirin.
                </p>
              </div>
            </div>

            {/* Soru Formu */}
            <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Mevcut Kritik Belirtileri Seçin:
              </h3>
              
              <div className="space-y-2">
                {[
                  { key: 'fever', label: 'Cilt kızarıklığı ile birlikte Yüksek Ateş (&gt; 38.5°C)' },
                  { key: 'swelling', label: 'Yüz, dudak veya boğazda aniden gelişen şiddetli Şişlik (Anjiyoödem)' },
                  { key: 'spreadingFast', label: 'Hızla yayılan zımba deligi gibi su toplayan kabarcıklar (Eczema Herpeticum riski)' },
                  { key: 'eyeInvolvement', label: 'Göz çevresinde şiddetli ağrı, iltihaplı akıntı veya görme bulanıklığı' },
                  { key: 'pusOozing', label: 'Sarı/bal rengi iltihaplı akıntı ve kabuklanma (Bakteriyel Stafilokok Enfeksiyonu)' }
                ].map(item => (
                  <label
                    key={item.key}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                      symptomForm[item.key as keyof typeof symptomForm]
                        ? 'bg-rose-500/20 border-rose-500/50 text-rose-200 font-medium'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={symptomForm[item.key as keyof typeof symptomForm]}
                      onChange={e => setSymptomForm({ ...symptomForm, [item.key]: e.target.checked })}
                      className="w-4 h-4 accent-rose-500 rounded"
                    />
                    <span dangerouslySetInnerHTML={{ __html: item.label }} />
                  </label>
                ))}
              </div>
            </div>

            {/* Öneri Kutusu */}
            {hasWarning ? (
              <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-600 text-rose-200 space-y-2">
                <p className="font-bold text-sm flex items-center gap-2 text-rose-300">
                  <PhoneCall className="w-5 h-5 text-rose-400" />
                  Acil Tıbbi Müdahale Gerekli: Doktora veya Acil Servise Başvurun
                </p>
                <p className="text-xs leading-relaxed">
                  İşaretlenen kritik belirtiler Eczema Herpeticum (HSV enfeksiyonu) veya sekonder bakteriyel enfeksiyona işaret edebilir. Vakit kaybetmeden en yakın acil servise veya dermatoloji uzmanına başvurun.
                </p>
                <div className="pt-2 flex gap-3">
                  <a
                    href="tel:112"
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-950"
                  >
                    <HeartPulse className="w-4 h-4" />
                    112 Acil Çağrı / En Yakın Hastane
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 space-y-1 text-xs">
                <p className="font-semibold text-emerald-300">Kritik Acil Durum Belirtisi Seçilmedi</p>
                <p className="text-slate-400">
                  Belirtileriniz aniden ağırlaşırsa veya yüksek ateş eklenirse değerlendirmeyi tekrarlayın.
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => setEmergencyModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs"
              >
                Pencereyi Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
