import React, { useState } from 'react';
import { KeyRound, Check, X } from 'lucide-react';
import { useApp } from '../../context/useApp';

export const PinLockSettings: React.FC = () => {
  const { pinLockEnabled, setPinCode, clearPinCode, verifyPinCode } = useApp();
  const [mode, setMode] = useState<'idle' | 'create' | 'remove'>('idle');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [error, setError] = useState('');

  const resetForm = () => {
    setMode('idle');
    setPin('');
    setConfirmPin('');
    setCurrentPin('');
    setError('');
  };

  const handleCreate = async () => {
    if (pin.length < 4) {
      setError('PIN en az 4 haneli olmalı.');
      return;
    }
    if (pin !== confirmPin) {
      setError('PIN tekrarı eşleşmiyor.');
      return;
    }
    await setPinCode(pin);
    resetForm();
  };

  const handleRemove = async () => {
    const ok = await verifyPinCode(currentPin);
    if (!ok) {
      setError('Mevcut PIN hatalı.');
      return;
    }
    clearPinCode();
    resetForm();
  };

  return (
    <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-bold text-white block flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-neutral-400" />
            Uygulama Kilidi (PIN)
          </span>
          <span className="text-[10px] text-neutral-400">
            {pinLockEnabled ? 'Uygulama açılışında PIN istenir.' : 'Hassas sağlık verilerini korumak için bir PIN belirleyin.'}
          </span>
        </div>
        {mode === 'idle' && (
          pinLockEnabled ? (
            <button onClick={() => setMode('remove')} className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-[11px] font-semibold shrink-0">
              PIN Kaldır
            </button>
          ) : (
            <button onClick={() => setMode('create')} className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-[11px] font-semibold shrink-0">
              PIN Oluştur
            </button>
          )
        )}
      </div>

      {mode === 'create' && (
        <div className="space-y-2 pt-2 border-t border-neutral-800">
          <input
            type="password"
            inputMode="numeric"
            placeholder="Yeni PIN (en az 4 hane)"
            value={pin}
            onChange={e => setPin(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none"
          />
          <input
            type="password"
            inputMode="numeric"
            placeholder="Yeni PIN (tekrar)"
            value={confirmPin}
            onChange={e => setConfirmPin(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none"
          />
          {error && <p className="text-[10px] text-rose-400">{error}</p>}
          <div className="flex gap-2">
            <button onClick={handleCreate} className="flex-1 py-2 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 font-semibold text-xs flex items-center justify-center gap-1.5">
              <Check className="w-3.5 h-3.5" /> Kaydet
            </button>
            <button onClick={resetForm} aria-label="Vazgeç" className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {mode === 'remove' && (
        <div className="space-y-2 pt-2 border-t border-neutral-800">
          <input
            type="password"
            inputMode="numeric"
            placeholder="Mevcut PIN"
            value={currentPin}
            onChange={e => setCurrentPin(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none"
          />
          {error && <p className="text-[10px] text-rose-400">{error}</p>}
          <div className="flex gap-2">
            <button onClick={handleRemove} className="flex-1 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold text-xs border border-rose-500/40 flex items-center justify-center gap-1.5">
              <Check className="w-3.5 h-3.5" /> PIN'i Kaldır
            </button>
            <button onClick={resetForm} aria-label="Vazgeç" className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
