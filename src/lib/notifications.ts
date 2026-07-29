// Bildirim yardımcıları: gerçek tarayıcı Notification API'sini sarmalar.
// Önemli sınır: sekme/tarayıcı tamamen kapalıyken çalışan gerçek arka plan push
// bildirimleri için bir push sunucusu (VAPID anahtarları + backend) gerekir; bu
// istemci-taraflı uygulamada böyle bir sunucu yoktur. Burada yalnızca uygulama
// açıkken veya arka plan sekmesinde çalışırken tetiklenen gerçek bildirimler gösterilir.

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) return 'unsupported';
  if (Notification.permission !== 'default') return Notification.permission;
  return Notification.requestPermission();
}

export async function showAppNotification(title: string, body: string, tag: string): Promise<void> {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return;

  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, { body, tag, icon: '/icon-192.png' });
      return;
    } catch {
      // Servis çalışanı üzerinden gösterilemedi; doğrudan Notification API'ye düş
    }
  }

  try {
    new Notification(title, { body, tag });
  } catch {
    // Bildirim gösterilemedi (izin geri çekilmiş olabilir); sessizce yoksay
  }
}
