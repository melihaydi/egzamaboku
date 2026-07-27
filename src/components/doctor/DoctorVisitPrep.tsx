import React, { useRef } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  CheckSquare,
  Calendar,
  Stethoscope,
  History
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const DoctorVisitPrep: React.FC = () => {
  const {
    activeProfile,
    healingScore,
    cvHistory,
    treatmentHistory,
    doctorPortalMode,
    setDoctorPortalMode,
    doctorAccessCode,
    setDoctorAccessCode
  } = useApp();

  const currentTreatment = treatmentHistory.find(t => t.status === 'Devam Ediyor') || treatmentHistory[0];

  const reportRef = useRef<HTMLDivElement | null>(null);

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`DermIQ_Doktor_Raporu_${activeProfile.name.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* Üst Şerit */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Doktor Görüşmesi Hazırlık & PDF Klinik Rapor Oluşturucu
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dermatoloğunuz için fotoğraf kronolojisi, SCORAD metrikleri ve ilaç uyum grafiklerini içeren klinik rapor üretir.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 text-white font-bold text-xs flex items-center gap-2 shadow-md"
          >
            <Download className="w-4 h-4" />
            Klinik PDF Raporu İndir
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            Yazdır
          </button>
        </div>
      </div>

      {/* Doktor Portalı Erişim Kartı */}
      <div className="p-6 rounded-3xl bg-purple-950/40 border border-purple-500/40 text-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-sm text-white">
              Doktor Portalı Canlı Erişim Bağlantısı
            </h3>
          </div>
          <p className="text-xs text-slate-300">
            Dermatoloğunuzun fotoğrafları ve uyum grafiklerini uzaktan incelemesi için davet şifresi oluşturun.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Doktor Şifresi Girin"
            value={doctorAccessCode}
            onChange={e => setDoctorAccessCode(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/50 text-xs text-white focus:outline-none"
          />
          <button
            onClick={() => setDoctorPortalMode(!doctorPortalMode)}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shrink-0"
          >
            {doctorPortalMode ? 'Modu Kapat' : 'Erişimi Etkinleştir'}
          </button>
        </div>
      </div>

      {/* Yazdırılabilir Rapor Belgesi */}
      <div ref={reportRef} className="bg-slate-900 p-6 lg:p-8 rounded-3xl border border-slate-800 space-y-6 text-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-black text-xl text-white">
              IQ
            </div>
            <div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                DermIQ Klinik Takip Belgesi
              </h3>
              <p className="text-xs text-slate-400">Takip Eden Dermatoloji Uzmanı İçin Hazırlanmıştır</p>
            </div>
          </div>

          <div className="text-right text-xs text-slate-400 space-y-0.5">
            <p><strong>Hasta:</strong> {activeProfile.name} ({activeProfile.age} Yaş)</p>
            <p><strong>Klinik Tanı:</strong> {activeProfile.eczemaType}</p>
            <p><strong>Tarih:</strong> {new Date().toLocaleDateString('tr-TR')}</p>
          </div>
        </div>

        {/* Özet Metrikler */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">İyileşme İndeksi</span>
            <span className="text-2xl font-black text-emerald-400">{Math.round(healingScore.currentScore)} / 100</span>
            <span className="text-[10px] text-slate-400 block">Değişim Hızı: +{healingScore.recoveryVelocity} puan/hf</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Güncel Tedavi</span>
            <span className="text-lg font-black text-sky-400 block leading-tight">{currentTreatment?.medicationName || 'Kayıt Yok'}</span>
            <span className="text-[10px] text-slate-400 block">{currentTreatment?.durationLabel}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Görsel Lezyon Alanı</span>
            <span className="text-2xl font-black text-amber-400">{cvHistory[0]?.surfaceAreaCm2 || 14.2} cm²</span>
            <span className="text-[10px] text-slate-400 block">Lezyon alanında %52 küçülme</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Alevlenme Sıklığı</span>
            <span className="text-2xl font-black text-indigo-400">1 Mild Flare</span>
            <span className="text-[10px] text-slate-400 block">Ağaç poleni maruziyeti kaynaklı</span>
          </div>
        </div>

        {/* Fotoğraf Kronolojisi */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-sky-400" />
            Fotoğraflı Kronolojik Gelişim Kayıtları
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cvHistory.slice(0, 2).map(scan => (
              <div key={scan.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-4">
                <img
                  src={scan.photoUrl}
                  alt="Cilt Taraması"
                  className="w-20 h-20 rounded-xl object-cover border border-slate-700"
                />
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-white block">{scan.location} Tarama ({scan.timestamp})</span>
                  <p className="text-slate-400 text-[11px]">Eritem: %{scan.redness} • Alan: {scan.surfaceAreaCm2} cm² • SCORAD: {scan.scoradIndex}</p>
                  <span className="text-[10px] font-bold text-emerald-400 block">İyileşme Oranı: +%{scan.healingProgression}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tedavi Geçmişi Kronolojisi */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <History className="w-4 h-4 text-sky-400" />
            Tedavi Geçmişi Kronolojisi
          </h4>

          <div className="space-y-2">
            {treatmentHistory.map(t => (
              <div key={t.id} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-white">{t.medicationName}</span>
                  <p className="text-[10px] text-slate-400">{t.drugClass} • {t.startDate} — {t.endDate || 'Günümüz'}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                  t.status === 'Devam Ediyor'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {t.durationLabel}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Doktor Görüşme Soruları Kontrol Listesi */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-sky-400" />
            Doktor Görüşmesinde Sorulacak Hazır Sorular:
          </h4>

          <div className="space-y-2 text-xs">
            {[
              'Dupixent idame doz aralığının (14 gün) mevcut iyileşme hızına göre değerlendirilmesi.',
              'Boyun bölgesinde kullanılan topikal kortizonun kademeli azaltma (step-down) protokolü.',
              'Mevsimsel ağaç poleni alerjisi şüphesine karşı yama (patch) testi yapılması.',
              'Düşük nem dönemlerinde nemlendirici lipid oranının gözden geçirilmesi.'
            ].map((q, idx) => (
              <div key={idx} className="flex items-start gap-2 text-slate-300">
                <input type="checkbox" defaultChecked className="mt-0.5 accent-sky-500 rounded" />
                <span>{q}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>DermIQ Klinik Hasta Özeti Raporu</span>
          <span>Doktor Onay İmzası: _______________________</span>
        </div>
      </div>
    </div>
  );
};
