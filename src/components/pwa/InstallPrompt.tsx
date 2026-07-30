import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

// Yalnızca beforeinstallprompt olayını destekleyen tarayıcılarda (Chrome/Edge/Android)
// çalışır. iOS Safari'de bu API hiç yoktur (kurulum yalnızca Paylaş > Ana Ekrana Ekle ile
// yapılabilir ve JS ile tetiklenemez); orada bu bileşen sessizce hiçbir şey göstermez —
// var olmayan bir "bir tıkla kur" yeteneği uydurulmaz.

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_STORAGE_KEY = 'dermiq:installPromptDismissed';

function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as { standalone?: boolean }).standalone === true;
}

export const InstallPrompt: React.FC = () => {
  const [deferredEvent, setDeferredEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_STORAGE_KEY) === '1');

  useEffect(() => {
    if (isStandalone()) return;

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredEvent(e as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => {
      setDeferredEvent(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  if (!deferredEvent || dismissed) return null;

  const handleInstall = async () => {
    await deferredEvent.prompt();
    await deferredEvent.userChoice;
    setDeferredEvent(null);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_STORAGE_KEY, '1');
    setDismissed(true);
  };

  return (
    <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-4 sm:left-auto sm:w-80 z-40 bg-neutral-900 border border-neutral-700 rounded-2xl p-4 shadow-2xl flex items-start gap-3">
      <span className="p-2 rounded-xl bg-neutral-800 border border-neutral-700 shrink-0">
        <Download className="w-4 h-4 text-neutral-300" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-white">DermIQ'yu Ana Ekrana Ekle</p>
        <p className="text-[11px] text-neutral-400 mt-0.5">Uygulamayı yükleyerek daha hızlı erişebilir, çevrimdışı da açabilirsin.</p>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={handleInstall}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 font-semibold text-[11px]"
          >
            Yükle
          </button>
          <button
            onClick={handleDismiss}
            className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 font-semibold text-[11px]"
          >
            Şimdi Değil
          </button>
        </div>
      </div>
      <button onClick={handleDismiss} aria-label="Kapat" className="p-1 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800 shrink-0">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
