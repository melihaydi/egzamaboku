import React, { useState } from 'react';
import {
  Activity,
  Mic,
  Sun,
  Moon,
  CheckCircle2,
  Eye,
  Menu,
  Pencil
} from 'lucide-react';
import { useApp } from '../../context/useApp';
import { ProfileEditModal } from '../profile/ProfileEditModal';

interface HeaderProps {
  onOpenMobileNav: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileNav }) => {
  const {
    theme,
    setTheme,
    highContrast,
    setHighContrast,
    activeProfile,
    setVoiceAssistantOpen,
    healthSyncActive
  } = useApp();

  const [profileEditOpen, setProfileEditOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800 text-neutral-100 px-3 sm:px-4 lg:px-8 py-3 [padding-top:calc(env(safe-area-inset-top)+0.75rem)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Mobil Menü & Logo */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onOpenMobileNav}
            aria-label="Menüyü Aç"
            className="md:hidden p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
              <Activity className="w-6 h-6 text-neutral-950" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-neutral-900"></span>
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-lg lg:text-xl tracking-tight text-white">
                DermIQ
              </h1>
              <span className="hidden sm:inline text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700">
                Cilt Takip
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 hidden lg:block truncate">
              Egzama ve Bariyer Takip Platformu
            </p>
          </div>
        </div>

        {/* Aksiyonlar & Profil */}
        <div className="flex items-center gap-1.5 lg:gap-2 shrink-0">
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-xs text-neutral-300">
            <CheckCircle2 className={`w-3.5 h-3.5 ${healthSyncActive ? 'text-emerald-400' : 'text-neutral-500'}`} />
            <span>{healthSyncActive ? 'Sağlık Verisi Eşleşti' : 'Çevrimdışı'}</span>
          </div>

          {/* Sesli Asistan Button */}
          <button
            onClick={() => setVoiceAssistantOpen(true)}
            title="Sesli Asistanı Aç"
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-all flex items-center gap-1.5 text-xs font-medium"
          >
            <Mic className="w-4 h-4" />
            <span className="hidden xl:inline">Sesli Asistan</span>
          </button>

          {/* Yüksek Kontrast Toggle */}
          <button
            onClick={() => setHighContrast(!highContrast)}
            title="Yüksek Kontrast Modu"
            aria-pressed={highContrast}
            className={`hidden sm:flex p-2 rounded-xl border text-xs transition-all ${
              highContrast
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-neutral-200'
            }`}
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Karanlık / Aydınlık Tema Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Tema Değiştir"
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-all"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-300" />}
          </button>

          {/* Profil */}
          <button
            onClick={() => setProfileEditOpen(true)}
            className="flex items-center gap-2 pl-1.5 pr-2 sm:pr-3 py-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition-all group"
            title="Profili Düzenle"
          >
            <div className={`w-7 h-7 rounded-lg overflow-hidden bg-gradient-to-tr ${activeProfile.avatarColor} flex items-center justify-center font-bold text-xs text-white shrink-0`}>
              {activeProfile.avatarUrl ? (
                <img src={activeProfile.avatarUrl} alt={activeProfile.name} className="w-full h-full object-cover" />
              ) : (
                <span>{activeProfile.name[0]}</span>
              )}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-semibold text-neutral-200 leading-tight">{activeProfile.name}</p>
              <p className="text-[10px] text-neutral-400">{activeProfile.age} yaş</p>
            </div>
            <Pencil className="w-3 h-3 text-neutral-500 group-hover:text-neutral-300 hidden sm:block" />
          </button>
        </div>
      </div>

      {profileEditOpen && <ProfileEditModal onClose={() => setProfileEditOpen(false)} />}
    </header>
  );
};
