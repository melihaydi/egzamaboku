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
  ShieldCheck
} from 'lucide-react';

export type ActiveTab = 'overview' | 'cv' | 'treatment' | 'environmental' | 'scanner' | 'food' | 'routine' | 'knowledge' | 'doctor' | 'security';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'overview' as ActiveTab, label: 'İyileşme Skoru & Genel Bakış', icon: LayoutDashboard, badge: 'Özel İndeks' },
    { id: 'cv' as ActiveTab, label: 'Görsel Yapay Zeka (CV) Analizi', icon: Scan, badge: 'Görsel Model' },
    { id: 'treatment' as ActiveTab, label: 'Tedavi Geçmişi', icon: History, badge: 'Kronoloji' },
    { id: 'environmental' as ActiveTab, label: 'Alevlenme Tahmini & Hava', icon: CloudSun, badge: '72 Saatlik' },
    { id: 'scanner' as ActiveTab, label: 'Ürün İçerik Tarayıcı (OCR)', icon: Sparkles, badge: 'Kamera / OCR' },
    { id: 'food' as ActiveTab, label: 'Beslenme & Tetikleyici Takibi', icon: Utensils, badge: 'Histamin' },
    { id: 'routine' as ActiveTab, label: 'Günlük Bakım & Alışkanlıklar', icon: CalendarCheck, badge: 'Dinamik' },
    { id: 'knowledge' as ActiveTab, label: 'Klinik Bilgi Bankası', icon: BookOpen, badge: 'Kanıta Dayalı' },
    { id: 'doctor' as ActiveTab, label: 'Doktor Özeti & PDF Raporu', icon: FileSpreadsheet, badge: 'Rapor Al' },
    { id: 'security' as ActiveTab, label: 'Gizlilik & Erişilebilirlik', icon: ShieldCheck, badge: 'Güvenlik Logu' }
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-3 lg:p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[10px] uppercase font-bold tracking-wider text-slate-400">
          Uygulama Modülleri
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
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
  );
};
