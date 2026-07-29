import React from 'react';
import type { BodyLocation } from '../../types';

interface BodyMapProps {
  value: BodyLocation | '';
  onSelect: (loc: BodyLocation) => void;
  // Bölge başına gerçek kayıt sayısı (ör. fotoğraf taraması adedi) — tahmin değil,
  // yalnızca mevcut geçmiş verinin görsel özeti olarak hafif bir vurgu için kullanılır.
  counts?: Partial<Record<BodyLocation, number>>;
}

const REGION_ORDER: BodyLocation[] = ['Yüz & Boyun', 'Göğüs & Sırt', 'Sol Kol', 'Sağ Kol', 'Eller & Bilekler', 'Bacaklar'];

export const BodyMap: React.FC<BodyMapProps> = ({ value, onSelect, counts }) => {
  const regionClass = (loc: BodyLocation) => {
    if (value === loc) return 'fill-white';
    if ((counts?.[loc] ?? 0) > 0) return 'fill-neutral-600 hover:fill-neutral-500';
    return 'fill-neutral-800 hover:fill-neutral-700';
  };

  const handleKeyDown = (e: React.KeyboardEvent, loc: BodyLocation) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(loc);
    }
  };

  const regionProps = (loc: BodyLocation) => ({
    onClick: () => onSelect(loc),
    onKeyDown: (e: React.KeyboardEvent) => handleKeyDown(e, loc),
    role: 'button' as const,
    tabIndex: 0,
    'aria-label': loc,
    'aria-pressed': value === loc,
    className: `cursor-pointer outline-none stroke-neutral-600 transition-colors ${regionClass(loc)}`
  });

  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 220 360" className="w-full max-w-[170px]">
        <g {...regionProps('Yüz & Boyun')}>
          <title>Yüz &amp; Boyun</title>
          <ellipse cx="110" cy="38" rx="26" ry="30" strokeWidth="1.5" />
          <rect x="97" y="64" width="26" height="20" strokeWidth="1.5" />
        </g>
        <g {...regionProps('Göğüs & Sırt')}>
          <title>Göğüs &amp; Sırt</title>
          <rect x="68" y="84" width="84" height="112" rx="18" strokeWidth="1.5" />
        </g>
        <g {...regionProps('Sol Kol')}>
          <title>Sol Kol</title>
          <rect x="32" y="90" width="30" height="118" rx="14" strokeWidth="1.5" />
        </g>
        <g {...regionProps('Sağ Kol')}>
          <title>Sağ Kol</title>
          <rect x="158" y="90" width="30" height="118" rx="14" strokeWidth="1.5" />
        </g>
        <g {...regionProps('Eller & Bilekler')}>
          <title>Eller &amp; Bilekler</title>
          <circle cx="47" cy="222" r="16" strokeWidth="1.5" />
          <circle cx="173" cy="222" r="16" strokeWidth="1.5" />
        </g>
        <g {...regionProps('Bacaklar')}>
          <title>Bacaklar</title>
          <rect x="72" y="200" width="32" height="150" rx="14" strokeWidth="1.5" />
          <rect x="116" y="200" width="32" height="150" rx="14" strokeWidth="1.5" />
        </g>
      </svg>

      <div className="flex flex-wrap justify-center gap-1.5">
        {REGION_ORDER.map(loc => (
          <button
            key={loc}
            type="button"
            onClick={() => onSelect(loc)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all ${
              value === loc ? 'bg-white text-neutral-950 border-white' : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:text-neutral-200'
            }`}
          >
            {loc}{counts?.[loc] ? ` (${counts[loc]})` : ''}
          </button>
        ))}
      </div>
    </div>
  );
};
