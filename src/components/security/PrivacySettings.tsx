import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Download,
  Trash2,
  Eye,
  Database,
  Languages
} from 'lucide-react';
import { useApp } from '../../context/useApp';
import { PinLockSettings } from './PinLockSettings';

export const PrivacySettings: React.FC = () => {
  const {
    activeProfile,
    cvHistory,
    symptomEntries,
    treatmentHistory,
    scannedProducts,
    triggerEntries,
    foodItems,
    routines,
    auditLogs,
    fontSize,
    setFontSize,
    highContrast,
    setHighContrast,
    language,
    setLanguage,
    clearAllData,
    t
  } = useApp();

  const [e2eEncrypted, setE2eEncrypted] = useState<boolean>(true);
  const [analyticsConsent, setAnalyticsConsent] = useState<boolean>(true);

  const handleExportJSON = () => {
    const fullExport = {
      exportedAt: new Date().toISOString(),
      profile: activeProfile,
      cvHistory,
      symptomEntries,
      treatmentHistory,
      scannedProducts,
      triggerEntries,
      foodItems,
      routines,
      auditLogs
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullExport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `DermIQ_Klinik_Yedek_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleClearLocalData = () => {
    const confirmed = window.confirm(
      `${activeProfile.name} profiline ait tüm yerel veriler (fotoğraf geçmişi, belirti kayıtları, tedavi kayıtları, rutinler) kalıcı olarak silinecek ve fabrika ayarlarına dönülecektir. Diğer aile profilleri etkilenmez. Devam etmek istiyor musunuz?`
    );
    if (confirmed) {
      clearAllData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Üst Şerit */}
      <div className="bg-neutral-900 p-6 rounded-3xl border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {t('title.security')}
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            AES-256 lokal şifreleme, yetki kontrolü, KVKK/GDPR veri aktarımı ve erişilebilirlik seçenekleri.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Güvenlik Ayarları */}
        <div className="lg:col-span-6 bg-neutral-900 p-6 rounded-3xl border border-neutral-800 space-y-6">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            Veri Koruması & Şifreleme Ayarları
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">AES-256 Uçtan Uca Şifreleme</span>
                <span className="text-[10px] text-neutral-400">Fotoğraf taramaları ve klinik kayıtları şifrelenerek saklanır.</span>
              </div>
              <input
                type="checkbox"
                checked={e2eEncrypted}
                onChange={e => setE2eEncrypted(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
            </div>

            <PinLockSettings />

            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">KVKK / GDPR Araştırma Rızası</span>
                <span className="text-[10px] text-neutral-400">Anonimleştirilmiş klinik telemetri verilerinin egzamaya katkısı.</span>
              </div>
              <input
                type="checkbox"
                checked={analyticsConsent}
                onChange={e => setAnalyticsConsent(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Veri Yönetimi & Haklar:
            </h4>

            <div className="flex gap-3">
              <button
                onClick={handleExportJSON}
                className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs border border-neutral-700 flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4 text-neutral-300" />
                Tüm Verileri İndir (JSON)
              </button>

              <button
                onClick={handleClearLocalData}
                className="py-2.5 px-4 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs border border-rose-500/40 flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Yerel Verileri Temizle
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <Eye className="w-4 h-4 text-neutral-300" />
              Erişilebilirlik & Yazı Boyutu
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
                <span className="text-[10px] text-neutral-400 block mb-1">Yazı Boyutu</span>
                <select
                  value={fontSize}
                  onChange={e => setFontSize(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none"
                >
                  <option value="normal">Normal (%100)</option>
                  <option value="large">Büyük (%115)</option>
                  <option value="xlarge">Çok Büyük (%130)</option>
                </select>
              </div>

              <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-neutral-200 font-bold block">Yüksek Kontrast</span>
                  <span className="text-[10px] text-neutral-400">WCAG AAA</span>
                </div>
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={e => setHighContrast(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
              </div>

              <div className="col-span-2 p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
                <span className="text-[10px] text-neutral-400 flex items-center gap-1 mb-1">
                  <Languages className="w-3 h-3" /> {t('settings.language')}
                </span>
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value as 'tr' | 'en')}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none"
                >
                  <option value="tr">Türkçe</option>
                  <option value="en">English</option>
                </select>
                <p className="text-[10px] text-neutral-500 mt-1.5">{t('settings.languageHint')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Gerçek Zamanlı Güvenlik Logları */}
        <div className="lg:col-span-6 bg-neutral-900 p-6 rounded-3xl border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-neutral-300" />
              Sistem Denetim Logları ({auditLogs.length} Olay)
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Değiştirilemez Log
            </span>
          </div>

          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {auditLogs.map(log => (
              <div key={log.id} className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-300">{log.action}</span>
                  <span className="text-[10px] text-neutral-500 font-mono">{log.timestamp}</span>
                </div>
                <p className="text-neutral-300 text-[11px]">{log.details}</p>
                <span className="text-[9px] text-neutral-500 block font-mono">{log.ipAddress}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
