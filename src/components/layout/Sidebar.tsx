import React from 'react';
import {
  LayoutDashboard,
  Scan,
  CloudSun,
  Sparkles,
  Utensils,
  CalendarCheck,
  History,
  BookOpen,
  FileSpreadsheet,
  ShieldCheck,
  Bot,
  X
} from 'lucide-react';

export type ActiveTab = 'overview' | 'cv' | 'treatment' | 'environmental' | 'scanner' | 'food' | 'routine' | 'knowledge' | 'chat' | 'doctor' | 'security';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isMobileOpen, onCloseMobile }) => {
  const navItems = [
    { id: 'overview' as ActiveTab, label: 'İyileşme Skoru & Genel Bakış', icon: LayoutDashboard, badge: 'Özel İndeks' },
    { id: 'cv' as ActiveTab, label: 'Görsel Yapay Zeka (CV) Analizi', icon: Scan, badge: 'Görsel Model' },
    { id: 'treatment' as ActiveTab, label: 'Tedavi Geçmişi', icon: History, badge: 'Kronoloji' },
    { id: 'chat' as ActiveTab, label: 'AI Sohbet Asistanı', icon: Bot, badge: 'Soru-Cevap' },
    { id: 'environmental' as ActiveTab, label: 'Alevlenme Tahmini & Hava', icon: CloudSun, badge: '72 Saatlik' },
    { id: 'scanner' as ActiveTab, label: 'Ürün İçerik Tarayıcı (OCR)', icon: Sparkles, badge: 'Kamera / OCR' },
    { id: 'food' as ActiveTab, label: 'Beslenme & Tetikleyici Takibi', icon: Utensils, badge: 'Histamin' },
    { id: 'routine' as ActiveTab, label: 'Günlük Bakım & Alışkanlıklar', icon: CalendarCheck, badge: 'Dinamik' },
    { id: 'knowledge' as ActiveTab, label: 'Klinik Bilgi Bankası', icon: BookOpen, badge: 'Kanıta Dayalı' },
    { id: 'doctor' as ActiveTab, label: 'Doktor Özeti & PDF Raporu', icon: FileSpreadsheet, badge: 'Rapor Al' },
    { id: 'security' as ActiveTab, label: 'Gizlilik & Erişilebilirlik', icon: ShieldCheck, badge: 'Güvenlik Logu' }
  ];

  const handleSelect = (tab: ActiveTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobil Karartma Katmanı */}
      <div
        onClick={onCloseMobile}
        aria-hidden="true"
        className={`fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity ${
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 md:w-64 bg-slate-900 border-r border-slate-800 p-3 lg:p-4 flex flex-col justify-between shrink-0
        transform transition-transform duration-300 ease-in-out overflow-y-auto
        [padding-top:calc(env(safe-area-inset-top)+0.75rem)] [padding-bottom:calc(env(safe-area-inset-bottom)+0.75rem)]
        md:static md:z-auto md:translate-x-0 md:transition-none md:h-auto
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="space-y-1">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Uygulama Modülleri
            </span>
            <button
              onClick={onCloseMobile}
              aria-label="Menüyü Kapat"
              className="md:hidden p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-500/20 to-indigo-500/20 text-sky-300 border border-sky-500/30 shadow-md font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-semibold ${
                  isActive ? 'bg-sky-500/30 text-sky-200' : 'bg-slate-800 text-slate-400'
                }`}>
                  {item.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tıbbi Sorumluluk Reddi Kutusu */}
        <div className="mt-6 p-3 rounded-2xl bg-slate-850 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
          <p className="font-semibold text-slate-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Tıbbi Sorumluluk Reddi
          </p>
          <p className="leading-relaxed text-[10px]">
            DermIQ destekleyici görsel analiz ve takip sunar. Hiçbir zaman uzman bir dermatolog teşhis veya tedavisinin yerine geçmez.
          </p>
        </div>
      </aside>
    </>
  );
};
