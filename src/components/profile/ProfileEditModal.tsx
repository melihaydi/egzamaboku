import React, { useRef, useState } from 'react';
import { X, Camera, Trash2, Save, User } from 'lucide-react';
import { useApp } from '../../context/useApp';
import type { BodyLocation } from '../../types';

const BODY_AREAS: BodyLocation[] = ['Sol Kol', 'Sağ Kol', 'Yüz & Boyun', 'Eller & Bilekler', 'Göğüs & Sırt', 'Bacaklar'];

const MAX_SOURCE_FILE_BYTES = 8 * 1024 * 1024; // 8MB - kaynak dosya boyutu sınırı
const TARGET_DIMENSION = 512; // Depolamadan önce fotoğraf bu boyuta küçültülür

function resizePhotoToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Dosya okunamadı.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Görsel yüklenemedi.'));
      img.onload = () => {
        const scale = Math.min(1, TARGET_DIMENSION / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas oluşturulamadı.'));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

interface ProfileEditModalProps {
  onClose: () => void;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ onClose }) => {
  const { activeProfile, updateActiveProfile } = useApp();
  const [name, setName] = useState(activeProfile.name);
  const [age, setAge] = useState(String(activeProfile.age));
  const [eczemaType, setEczemaType] = useState(activeProfile.eczemaType);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(activeProfile.avatarUrl);
  const [primaryLocations, setPrimaryLocations] = useState<BodyLocation[]>(activeProfile.primaryLocations);
  const [photoError, setPhotoError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const toggleLocation = (loc: BodyLocation) => {
    setPrimaryLocations(prev => prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]);
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPhotoError('Lütfen bir resim dosyası seçin.');
      return;
    }
    if (file.size > MAX_SOURCE_FILE_BYTES) {
      setPhotoError('Fotoğraf çok büyük (maksimum 8MB).');
      return;
    }

    try {
      const dataUrl = await resizePhotoToDataUrl(file);
      setAvatarUrl(dataUrl);
      setPhotoError('');
    } catch {
      setPhotoError('Fotoğraf işlenirken bir sorun oluştu, lütfen tekrar deneyin.');
    }
  };

  const handleSave = () => {
    const parsedAge = parseInt(age, 10);
    updateActiveProfile({
      name: name.trim() || activeProfile.name,
      age: Number.isFinite(parsedAge) && parsedAge > 0 ? parsedAge : activeProfile.age,
      eczemaType: eczemaType.trim() || activeProfile.eczemaType,
      avatarUrl,
      primaryLocations
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
            <User className="w-5 h-5" />
          </span>
          <h2 className="text-lg font-bold text-white">Profili Düzenle</h2>
        </div>

        {/* Fotoğraf */}
        <div className="flex flex-col items-center gap-3">
          <div className={`w-24 h-24 rounded-full overflow-hidden border-4 border-neutral-800 flex items-center justify-center font-black text-2xl text-white bg-gradient-to-tr ${activeProfile.avatarColor}`}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profil fotoğrafı" className="w-full h-full object-cover" />
            ) : (
              <span>{name ? name[0] : '?'}</span>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            className="hidden"
          />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-semibold flex items-center gap-1.5"
            >
              <Camera className="w-4 h-4 text-neutral-300" />
              Fotoğraf Yükle
            </button>
            {avatarUrl && (
              <button
                type="button"
                onClick={() => setAvatarUrl(undefined)}
                className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40"
                aria-label="Fotoğrafı kaldır"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          {photoError && <p className="text-[11px] text-rose-400">{photoError}</p>}
        </div>

        {/* Form Alanları */}
        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">Ad Soyad</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:outline-none"
            />
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
                value={eczemaType}
                onChange={e => setEczemaType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">Genelde Etkilenen Bölgeler</label>
            <div className="flex flex-wrap gap-1.5">
              {BODY_AREAS.map(loc => {
                const selected = primaryLocations.includes(loc);
                return (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => toggleLocation(loc)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all ${
                      selected ? 'bg-white text-neutral-950 border-white' : 'bg-neutral-950 text-neutral-400 border-neutral-700 hover:text-neutral-200'
                    }`}
                  >
                    {loc}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 font-bold text-sm flex items-center justify-center gap-2 shadow-md"
        >
          <Save className="w-4 h-4" />
          Kaydet
        </button>
      </div>
    </div>
  );
};
