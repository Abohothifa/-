import { useEffect, useRef, useState } from 'react';
import { ReminderSettings, ThikrCategory } from '../types/athkar';
import { getLocalDateKey } from '../utils/arabic';

export type NotificationPermissionState = NotificationPermission | 'unsupported';

export function useReminders(
  reminders: ReminderSettings,
  onInAppReminder?: (category: ThikrCategory, title: string, body: string) => void
) {
  const [permission, setPermission] = useState<NotificationPermissionState>(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  });

  const lastTriggeredRef = useRef<Record<string, string>>({});

  const requestPermission = async (): Promise<NotificationPermissionState> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPermission('unsupported');
      return 'unsupported';
    }
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch {
      return permission;
    }
  };

  const triggerNotification = (title: string, body: string, category: ThikrCategory) => {
    if (onInAppReminder) {
      onInAppReminder(category, title, body);
    }

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/pwa-192x192.png',
          dir: 'rtl',
          lang: 'ar',
          silent: true,
        });
      } catch {
        // Fallback already handled via in-app reminder
      }
    }
  };

  const sendTestNotification = async (category: ThikrCategory) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      await requestPermission();
    }
    if (category === 'morning') {
      triggerNotification(
        'تذكير أذكار الصباح',
        'حفظكم الله، حان موعد قراءة أذكار الصباح.',
        'morning'
      );
    } else {
      triggerNotification(
        'تذكير أذكار المساء',
        'حفظكم الله، حان موعد قراءة أذكار المساء.',
        'evening'
      );
    }
  };

  useEffect(() => {
    if (!reminders.masterEnabled) return;

    const checkSchedule = () => {
      const now = new Date();
      const today = getLocalDateKey(now);
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const currentHHMM = `${hh}:${mm}`;

      if (reminders.morning.enabled && reminders.morning.time === currentHHMM) {
        const key = `morning-${today}-${currentHHMM}`;
        if (lastTriggeredRef.current.morning !== key) {
          lastTriggeredRef.current.morning = key;
          triggerNotification(
            'أذكار الصباح',
            'أصبحنا وأصبح الملك لله — لا تنسَ أذكار الصباح.',
            'morning'
          );
        }
      }

      if (reminders.evening.enabled && reminders.evening.time === currentHHMM) {
        const key = `evening-${today}-${currentHHMM}`;
        if (lastTriggeredRef.current.evening !== key) {
          lastTriggeredRef.current.evening = key;
          triggerNotification(
            'أذكار المساء',
            'أمسينا وأمسى الملك لله — لا تنسَ أذكار المساء.',
            'evening'
          );
        }
      }
    };

    checkSchedule();
    const interval = window.setInterval(checkSchedule, 20000);
    return () => window.clearInterval(interval);
  }, [reminders, onInAppReminder]);

  return {
    permission,
    requestPermission,
    sendTestNotification,
  };
}
