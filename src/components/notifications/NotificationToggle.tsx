import React, { useEffect, useState } from 'react';
import { Bell, BellOff, BellRing } from 'lucide-react';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission
} from '../../lib/notifications';

export const NotificationToggle: React.FC = () => {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('unsupported');

  useEffect(() => {
    setPermission(getNotificationPermission());
  }, []);

  if (!isNotificationSupported()) return null;

  const handleClick = async () => {
    if (permission !== 'default') return;
    const result = await requestNotificationPermission();
    setPermission(result);
  };

  const label =
    permission === 'granted' ? 'Bildirimler Açık: Bakım ve enjeksiyon/doktor hatırlatıcıları uygulama açıkken gösterilir'
    : permission === 'denied' ? 'Bildirimler Engellendi: Tarayıcı site ayarlarından açabilirsiniz'
    : 'Bakım ve Enjeksiyon Hatırlatıcılarını Etkinleştir';

  const Icon = permission === 'granted' ? BellRing : permission === 'denied' ? BellOff : Bell;

  return (
    <button
      onClick={handleClick}
      title={label}
      aria-label={label}
      className={`hidden sm:flex p-2 rounded-xl border text-xs transition-all ${
        permission === 'granted'
          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
          : permission === 'denied'
          ? 'bg-neutral-800 text-neutral-600 border-neutral-700 cursor-not-allowed'
          : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-neutral-200'
      }`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
};
