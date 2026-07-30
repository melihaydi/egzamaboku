import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Pencil, UserPlus, Trash2, Check } from 'lucide-react';
import { useApp } from '../../context/useApp';
import { ProfileEditModal } from './ProfileEditModal';
import { AddProfileModal } from './AddProfileModal';

export const ProfileSwitcher: React.FC = () => {
  const { activeProfile, profiles, switchProfile, removeProfile } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [addProfileOpen, setAddProfileOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRemove = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (window.confirm(`${name} profili ve bu profile ait tüm yerel veriler kalıcı olarak silinsin mi?`)) {
      removeProfile(id);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(v => !v)}
        aria-expanded={isOpen}
        aria-label="Profil Seç / Değiştir"
        className="flex items-center gap-2 pl-1.5 pr-2 sm:pr-3 py-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition-all"
        title="Profil Seç / Değiştir"
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
        <ChevronDown className={`w-3.5 h-3.5 text-neutral-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-neutral-900 border border-neutral-700 shadow-2xl z-50 overflow-hidden">
          <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
            {profiles.map(p => {
              const isActive = p.id === activeProfile.id;
              return (
                <button
                  key={p.id}
                  onClick={() => { switchProfile(p.id); setIsOpen(false); }}
                  className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-colors ${
                    isActive ? 'bg-neutral-800' : 'hover:bg-neutral-800/60'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-tr ${p.avatarColor} flex items-center justify-center font-bold text-xs text-white shrink-0`}>
                    {p.avatarUrl ? (
                      <img src={p.avatarUrl} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{p.name[0]}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-neutral-200 truncate">{p.name}</p>
                    <p className="text-[10px] text-neutral-500">{p.relationship}</p>
                  </div>
                  {isActive && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  {!isActive && profiles.length > 1 && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={e => handleRemove(e, p.id, p.name)}
                      onKeyDown={e => e.key === 'Enter' && handleRemove(e as unknown as React.MouseEvent, p.id, p.name)}
                      aria-label={`${p.name} profilini sil`}
                      className="p-1 rounded-lg text-neutral-600 hover:text-rose-400 hover:bg-rose-500/10 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="border-t border-neutral-800 p-2 space-y-1">
            <button
              onClick={() => { setProfileEditOpen(true); setIsOpen(false); }}
              className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white"
            >
              <Pencil className="w-3.5 h-3.5" /> Aktif Profili Düzenle
            </button>
            <button
              onClick={() => { setAddProfileOpen(true); setIsOpen(false); }}
              className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white"
            >
              <UserPlus className="w-3.5 h-3.5" /> Yeni Aile Profili Ekle
            </button>
          </div>
        </div>
      )}

      {profileEditOpen && <ProfileEditModal onClose={() => setProfileEditOpen(false)} />}
      {addProfileOpen && <AddProfileModal onClose={() => setAddProfileOpen(false)} />}
    </div>
  );
};
