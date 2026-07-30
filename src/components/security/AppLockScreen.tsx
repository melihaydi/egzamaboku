import React, { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { useApp } from '../../context/useApp';

interface AppLockScreenProps {
  onUnlock: () => void;
}

function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(1, Math.ceil(ms / 1000));
  if (totalSeconds >= 60) {
    return `${Math.ceil(totalSeconds / 60)} dakika`;
  }
  return `${totalSeconds} saniye`;
}

export const AppLockScreen: React.FC<AppLockScreenProps> = ({ onUnlock }) => {
  const { verifyPinCode, pinLockedUntil, recordFailedPinAttempt, resetPinAttempts } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const isLocked = !!pinLockedUntil && pinLockedUntil > now;

  // Kilit süresi dolduğunda formu otomatik olarak yeniden etkinleştirmek için geri sayımı tazeler.
  useEffect(() => {
    if (!isLocked) return;
    const interval = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(interval);
  }, [isLocked]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || checking || isLocked) return;
    setChecking(true);
    const ok = await verifyPinCode(pin);
    setChecking(false);
    if (ok) {
      resetPinAttempts();
      onUnlock();
    } else {
      recordFailedPinAttempt();
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-8 space-y-5 text-center">
        <div className="w-14 h-14 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7 text-neutral-300" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">DermIQ Kilitli</h1>
          <p className="text-xs text-neutral-500 mt-1">
            {isLocked ? 'Çok fazla yanlış deneme yapıldı.' : 'Devam etmek için PIN kodunu girin.'}
          </p>
        </div>
        <input
          autoFocus
          type="password"
          inputMode="numeric"
          value={pin}
          disabled={isLocked}
          onChange={e => { setPin(e.target.value); setError(false); }}
          placeholder="PIN"
          className={`w-full text-center tracking-[0.5em] text-xl px-4 py-3 rounded-2xl bg-neutral-950 border text-white focus:outline-none disabled:opacity-40 ${error ? 'border-rose-500' : 'border-neutral-800'}`}
        />
        {error && !isLocked && <p className="text-xs text-rose-400">Hatalı PIN. Tekrar deneyin.</p>}
        {isLocked && (
          <p className="text-xs text-rose-400">
            Güvenlik nedeniyle {formatRemaining(pinLockedUntil! - now)} sonra tekrar deneyebilirsin.
          </p>
        )}
        <button
          type="submit"
          disabled={!pin || checking || isLocked}
          className="w-full py-3 rounded-2xl bg-white hover:bg-neutral-200 text-neutral-950 font-semibold text-sm disabled:opacity-40 transition-all"
        >
          {checking ? 'Kontrol ediliyor...' : isLocked ? 'Kilitli' : 'Kilidi Aç'}
        </button>
      </form>
    </div>
  );
};
