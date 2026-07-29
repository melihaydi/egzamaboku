import { useEffect, useRef } from 'react';
import { useApp } from '../../context/useApp';
import { showAppNotification, getNotificationPermission } from '../../lib/notifications';

// Görünmez bileşen: kullanıcının kendi rutin adımları ve takvim etkinlikleri
// üzerinde periyodik kontrol yaparak gerçek tarayıcı bildirimleri tetikler.
// Uygulama sekmesi/tarayıcısı tamamen kapalıyken çalışmaz (push sunucusu yok);
// yalnızca uygulama açıkken veya arka plan sekmesindeyken çalışır.

const NOTIFIED_STORAGE_KEY = 'dermiq:notifiedReminders';
const CHECK_INTERVAL_MS = 30000;

function loadNotifiedSet(): Set<string> {
  try {
    const raw = localStorage.getItem(NOTIFIED_STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function persistNotifiedSet(set: Set<string>) {
  try {
    localStorage.setItem(NOTIFIED_STORAGE_KEY, JSON.stringify([...set].slice(-500)));
  } catch {
    // localStorage'a erişilemiyorsa sessizce yoksay
  }
}

export const ReminderScheduler: React.FC = () => {
  const { routines, calendarEvents } = useApp();
  const notifiedRef = useRef<Set<string>>(loadNotifiedSet());
  const routinesRef = useRef(routines);
  const calendarEventsRef = useRef(calendarEvents);

  routinesRef.current = routines;
  calendarEventsRef.current = calendarEvents;

  useEffect(() => {
    const markNotified = (key: string) => {
      notifiedRef.current.add(key);
      persistNotifiedSet(notifiedRef.current);
    };

    const check = () => {
      if (getNotificationPermission() !== 'granted') return;

      const now = new Date();
      const todayISO = now.toISOString().slice(0, 10);
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowISO = tomorrow.toISOString().slice(0, 10);
      const nowHHMM = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      routinesRef.current.forEach(task => {
        if (!task.reminderTime || task.completed || task.reminderTime !== nowHHMM) return;
        const key = `routine:${task.id}:${todayISO}`;
        if (notifiedRef.current.has(key)) return;
        markNotified(key);
        showAppNotification('Bakım Hatırlatıcısı', task.title, key);
      });

      calendarEventsRef.current.forEach(ev => {
        if (ev.type === 'injection' && ev.dateISO === tomorrowISO) {
          const key = `event-tomorrow:${ev.id}:${todayISO}`;
          if (!notifiedRef.current.has(key)) {
            markNotified(key);
            showAppNotification(`Yarın: ${ev.title}`, ev.description || 'Yarın için takviminde bir etkinlik var.', key);
          }
        }

        if ((ev.type === 'injection' || ev.type === 'doctorVisit' || ev.type === 'medication') && ev.dateISO === todayISO) {
          const key = `event-today:${ev.id}:${todayISO}`;
          if (!notifiedRef.current.has(key)) {
            markNotified(key);
            showAppNotification(`Bugün: ${ev.title}`, ev.description || 'Bugün için takviminde bir etkinlik var.', key);
          }
        }
      });
    };

    check();
    const interval = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return null;
};
