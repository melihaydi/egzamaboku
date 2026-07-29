import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { useApp } from '../../context/useApp';
import type { FamilyProfile } from '../../types';

const RELATIONSHIPS: FamilyProfile['relationship'][] = ['Kendi Profilim', 'Çocuğum', 'Eşim', 'Ebeveynim'];
const AVATAR_COLORS = [
  'from-neutral-700 to-neutral-900',
  'from-rose-700 to-neutral-900',
  'from-sky-700 to-neutral-900',
  'from-emerald-700 to-neutral-900',
  'from-amber-700 to-neutral-900',
  'from-violet-700 to-neutral-900'
];

interface AddProfileModalProps {
  onClose: () => void;
}

export const AddProfileModal: React.FC<AddProfileModalProps> = ({ onClose }) => {
  const { profiles, addProfile } = useApp();
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState<FamilyProfile['relationship']>('Çocuğum');
  const [age, setAge] = useState('');
  const [eczemaType, setEczemaType] = useState('');

  const handleCreate = () => {
    if (!name.trim()) return;
    const parsedAge = parseInt(age, 10);
    const avatarColor = AVATAR_COLORS[profiles.length % AVATAR_COLORS.length];
    addProfile({
      name: name.trim(),
      relationship,
      avatarColor,
      age: Number.isFinite(parsedAge) && parsedAge > 0 ? parsedAge : 0,
      eczemaType: eczemaType.trim() || 'Belirtilmedi',
      primaryLocations: []
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-700 rounded-3xl max-w-md w-full p-6 text-neutral-100 shadow-2xl space-y-5 relative">
        <button
          onClick={onClose}
          aria-label="Kapat"
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-200 rounded-xl hover:bg-neutral-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-neutral-800 text-neutral-300 border border-neutral-700">
            <UserPlus className="w-5 h-5" />
          </span>
          <h2 className="text-lg font-bold text-white">Yeni Aile Profili Ekle</h2>
        </div>
        <p className="text-xs text-neutral-500 -mt-3">
          Her profilin belirti, tedavi, fotoğraf ve diğer sağlık kayıtları birbirinden bağımsız tutulur.
        </p>

        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">Ad Soyad</label>
            <input
              type="text"
              autoFocus
              placeholder="Örn: Ayşe Doğan"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white placeholder-neutral-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">Yakınlık</label>
            <select
              value={relationship}
              onChange={e => setRelationship(e.target.value as FamilyProfile['relationship'])}
              className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-neutral-200 focus:outline-none"
            >
              {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">Yaş</label>
              <input
                type="number"
                min={0}
                max={120}
                value={age}
                onChange={e => setAge(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">Tanı / Egzama Tipi</label>
              <input
                type="text"
                placeholder="İsteğe bağlı"
                value={eczemaType}
                onChange={e => setEczemaType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white placeholder-neutral-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={!name.trim()}
          className="w-full py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 font-bold text-sm flex items-center justify-center gap-2 shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <UserPlus className="w-4 h-4" />
          Profili Oluştur
        </button>
      </div>
    </div>
  );
};
