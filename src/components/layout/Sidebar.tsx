import React from 'react';
import {
  LayoutDashboard,
  Scan,
  CloudSun,
  Sparkles,
  Utensils,
  CalendarCheck,
  History,
  NotebookText,
  CalendarDays,
  ShieldCheck,
  ShieldAlert,
  MessageCircle,
  TrendingUp,
  X
} from 'lucide-react';
import { useApp } from '../../context/useApp';

export type ActiveTab = 'overview' | 'insights' | 'cv' | 'treatment' | 'environmental' | 'scanner' | 'triggers' | 'food' | 'routine' | 'journal' | 'calendar' | 'chat' | 'security';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isMobileOpen, onCloseMobile }) => {
  const { t } = useApp();
  const navItems = [
    { id: 'overview' as ActiveTab, label: t('nav.overview'), icon: LayoutDashboard },
    { id: 'insights' as ActiveTab, label: t('nav.insights'), icon: TrendingUp },
    { id: 'cv' as ActiveTab, label: t('nav.cv'), icon: Scan },
    { id: 'calendar' as ActiveTab, label: t('nav.calendar'), icon: CalendarDays },
    { id: 'treatment' as ActiveTab, label: t('nav.treatment'), icon: History },
    { id: 'chat' as ActiveTab, label: t('nav.chat'), icon: MessageCircle },
    { id: 'environmental' as ActiveTab, label: t('nav.environmental'), icon: CloudSun },
    { id: 'scanner' as ActiveTab, label: t('nav.scanner'), icon: Sparkles },
    { id: 'triggers' as ActiveTab, label: t('nav.triggers'), icon: ShieldAlert },
    { id: 'food' as ActiveTab, label: t('nav.food'), icon: Utensils },
    { id: 'routine' as ActiveTab, label: t('nav.routine'), icon: CalendarCheck },
    { id: 'journal' as ActiveTab, label: t('nav.journal'), icon: NotebookText },
    { id: 'security' as ActiveTab, label: t('nav.security'), icon: ShieldCheck }
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
        className={`fixed inset-y-0 left-0 z-50 w-72 md:w-64 bg-neutral-900 border-r border-neutral-800 p-3 lg:p-4 flex flex-col justify-between shrink-0
        transform transition-transform duration-300 ease-in-out overflow-y-auto
        [padding-top:calc(env(safe-area-inset-top)+0.75rem)] [padding-bottom:calc(env(safe-area-inset-bottom)+0.75rem)]
        md:static md:z-auto md:translate-x-0 md:transition-none md:h-auto
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="space-y-1">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-neutral-500">
              {t('sidebar.modules')}
            </span>
            <button
              onClick={onCloseMobile}
              aria-label="Menüyü Kapat"
              className="md:hidden p-1 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
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
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-white text-neutral-950 font-semibold'
                    : 'text-neutral-300 hover:bg-neutral-800/80 hover:text-neutral-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-neutral-950' : 'text-neutral-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </aside>
    </>
  );
};
