import React from 'react';
import { 
  Activity, 
  AlertTriangle, 
  Mic, 
  Watch, 
  Sun, 
  Moon, 
  Users, 
  CheckCircle2, 
  Lock, 
  Eye,
  Stethoscope
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Header: React.FC = () => {
  const {
    theme,
    setTheme,
    highContrast,
    setHighContrast,
    activeProfile,
    profiles,
    setActiveProfile,
    setEmergencyModalOpen,
    setVoiceAssistantOpen,
    wearableWidgetOpen,
    setWearableWidgetOpen,
    healthSyncActive,
    doctorPortalMode
  } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo & Marka */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-md shadow-sky-500/20">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg lg:text-xl tracking-tight bg-gradient-to-r from-sky-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
                DermIQ AI
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                Klinik Cilt Asistanı
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Yapay Zeka Destekli Egzama ve Bariyer Takip Platformu
            </p>
          </div>
        </div>

        {/* Aksiyonlar & Profil Seçici */}
        <div className="flex items-center gap-2 lg:gap-3">
          {doctorPortalMode && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold">
              <Stethoscope className="w-4 h-4 text-purple-400" />
              Doktor Portalı Aktif
            </div>
          )}

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">
            <CheckCircle2 className={`w-3.5 h-3.5 ${healthSyncActive ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span>{healthSyncActive ? 'Sağlık Verisi Eşleşti' : 'Çevrimdışı'}</span>
          </div>

          {/* Sesli Asistan Button */}
          <button
            onClick={() => setVoiceAssistantOpen(true)}
            title="Sesli Asistanı Aç"
            className="p-2 rounded-xl bg-slate-800 hover:bg-sky-600/20 text-slate-300 hover:text-sky-400 border border-slate-700 transition-all flex items-center gap-1.5 text-xs font-medium"
          >
            <Mic className="w-4 h-4 text-sky-400" />
            <span className="hidden lg:inline">Sesli Asistan</span>
          </button>

          {/* Akıllı Saat Simülatörü Button */}
          <button
            onClick={() => setWearableWidgetOpen(!wearableWidgetOpen)}
            title="Akıllı Saat Ekranı"
            className={`p-2 rounded-xl border transition-all text-xs font-medium flex items-center gap-1.5 ${
              wearableWidgetOpen
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <Watch className="w-4 h-4 text-indigo-400" />
            <span className="hidden xl:inline">Akıllı Saat</span>
          </button>

          {/* Acil Durum Rehberi Button */}
          <button
            onClick={() => setEmergencyModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold text-xs flex items-center gap-1.5 transition-all"
          >
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span className="hidden sm:inline">Acil Durum Rehberi</span>
          </button>

          {/* Yüksek Kontrast Toggle */}
          <button
            onClick={() => setHighContrast(!highContrast)}
            title="Yüksek Kontrast Modu"
            className={`p-2 rounded-xl border text-xs transition-all ${
              highContrast 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Karanlık / Aydınlık Tema Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Tema Değiştir"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-400" />}
          </button>

          {/* Profil Switcher */}
          <div className="relative group">
            <button className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all">
              <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${activeProfile.avatarColor} flex items-center justify-center font-bold text-xs text-white`}>
                {activeProfile.name[0]}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-semibold text-slate-200 leading-tight">{activeProfile.name}</p>
                <p className="text-[10px] text-slate-400">{activeProfile.relationship} ({activeProfile.age} yaş)</p>
              </div>
              <Users className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 hidden group-hover:block z-50">
              <div className="px-3 py-2 border-b border-slate-800">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Aile Profilleri</p>
              </div>
              <div className="py-1 space-y-1">
                {profiles.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setActiveProfile(p)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                      p.id === activeProfile.id ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-md bg-gradient-to-tr ${p.avatarColor} flex items-center justify-center text-[10px] text-white font-bold`}>
                        {p.name[0]}
                      </div>
                      <span>{p.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{p.relationship}</span>
                  </button>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 text-center flex items-center justify-center gap-1">
                <Lock className="w-3 h-3 text-slate-500" />
                Şifreli Aile Profilleri
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
