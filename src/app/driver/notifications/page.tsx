
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, Info, Megaphone, Sparkles, AlertCircle, TrendingUp, Check, Clock, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { driverTranslations } from '@/locales/driver';

interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  priority: string;
  created_at: string;
  is_read: boolean;
  read_at: string | null;
}

const glassCard = {
  background: 'rgba(10,15,30,0.75)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(212,175,55,0.15)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
};

async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

function showBrowserNotification(title: string, body: string, type: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const iconMap: Record<string, string> = {
    alert: '🚨',
    announcement: '📢',
    update: '✨',
    promotion: '📈',
    news: 'ℹ️',
  };
  try {
    const notif = new Notification(`${iconMap[type] || '🔔'} ${title}`, {
      body,
      tag: `driver-notif-${Date.now()}`,
    });
    notif.onclick = () => {
      window.focus();
      notif.close();
    };
  } catch (e) {
    void 0;
  }
}

export default function DriverNotificationsPage() {
  const { language } = useLanguage();
  const t = driverTranslations[language];
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');
  const prevIdsRef = useRef<Set<number>>(new Set());
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNotifications = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await api.get<Notification[]>('/notifications/driver');

      // Detect new unread notifications and show browser push notifications
      const newUnread = data.filter(
        (n) => !n.is_read && !prevIdsRef.current.has(n.id)
      );
      newUnread.forEach((n) => {
        showBrowserNotification(n.title, n.message, n.notification_type);
      });

      prevIdsRef.current = new Set(data.map((n) => n.id));
      setNotifications(data);
    } catch (error: any) {
      if (!silent) toast.error(error.message || t.error);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchNotifications();
    if ('Notification' in window) {
      setNotifPermission(Notification.permission);
    }
  }, [fetchNotifications]);

  // Smart polling: every 30s when tab is visible, paused when hidden
  useEffect(() => {
    const startPolling = () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = setInterval(() => {
        if (!document.hidden) fetchNotifications(true);
      }, 30000);
    };

    startPolling();
    document.addEventListener('visibilitychange', startPolling);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      document.removeEventListener('visibilitychange', startPolling);
    };
  }, [fetchNotifications]);

  const handleRequestPermission = async () => {
    await requestNotificationPermission();
    if ('Notification' in window) {
      setNotifPermission(Notification.permission);
    }
    if (Notification.permission === 'granted') {
      toast.success(
        language === 'ar'
          ? 'تم تفعيل الإشعارات بنجاح'
          : language === 'nl'
          ? 'Meldingen ingeschakeld'
          : 'Notifications activées'
      );
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await api.post('/notifications/mark-read', { notification_id: notificationId });
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      );
    } catch (error: any) {
      console.error("Operation failed");
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.is_read);
    if (unread.length === 0) return;
    await Promise.all(unread.map((n) => markAsRead(n.id)));
    toast.success(
      language === 'ar'
        ? 'تم تحديد الكل كمقروء'
        : language === 'nl'
        ? 'Alles als gelezen gemarkeerd'
        : 'Tout marqué comme lu'
    );
  };

  const getTypeConfig = (type: string) => {
    const configs: Record<string, { icon: React.ElementType; gradient: string; glow: string }> = {
      news: { icon: Info, gradient: 'from-blue-500 to-blue-600', glow: 'rgba(59,130,246,0.4)' },
      announcement: { icon: Megaphone, gradient: 'from-purple-500 to-purple-600', glow: 'rgba(168,85,247,0.4)' },
      update: { icon: Sparkles, gradient: 'from-green-500 to-green-600', glow: 'rgba(34,197,94,0.4)' },
      alert: { icon: AlertCircle, gradient: 'from-red-500 to-red-600', glow: 'rgba(239,68,68,0.4)' },
      promotion: { icon: TrendingUp, gradient: 'from-amber-500 to-yellow-600', glow: 'rgba(212,175,55,0.4)' },
    };
    return configs[type] || { icon: Bell, gradient: 'from-slate-500 to-slate-600', glow: 'rgba(100,116,139,0.4)' };
  };

  const getPriorityStyle = (priority: string): React.CSSProperties => {
    const styles: Record<string, React.CSSProperties> = {
      urgent: { background: 'rgba(239,68,68,0.18)', color: '#f87171', border: '1px solid rgba(239,68,68,0.35)' },
      high: { background: 'rgba(249,115,22,0.18)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.35)' },
      normal: { background: 'rgba(59,130,246,0.18)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.35)' },
      low: { background: 'rgba(212,175,55,0.12)', color: 'rgba(212,175,55,0.9)', border: '1px solid rgba(212,175,55,0.25)' },
    };
    return styles[priority] || styles.normal;
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      urgent: t.urgent,
      high: t.high,
      normal: t.normal,
      low: t.low,
    };
    return labels[priority] || priority;
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Bell className="w-10 h-10" style={{ color: '#d4af37' }} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-24">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1
              className="text-2xl font-black tracking-tight"
              style={{
                background: 'linear-gradient(90deg, #b8860b, #d4af37, #ffd700)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {t.notifications}
            </h1>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' }}
                className="inline-flex items-center gap-1.5 mt-1.5 px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  background: 'rgba(239,68,68,0.18)',
                  border: '1px solid rgba(239,68,68,0.35)',
                  color: '#f87171',
                }}
              >
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full bg-red-400"
                />
                {unreadCount} {t.newNotifications}
              </motion.div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => fetchNotifications()}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{
                background: 'rgba(212,175,55,0.1)',
                border: '1px solid rgba(212,175,55,0.2)',
              }}
            >
              <RefreshCw className="w-4 h-4" style={{ color: '#d4af37' }} />
            </motion.button>

            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{
                background: 'rgba(212,175,55,0.12)',
                border: '1px solid rgba(212,175,55,0.25)',
              }}
            >
              <Bell className="w-6 h-6" style={{ color: '#d4af37' }} />
            </motion.div>
          </div>
        </div>
        <p className="text-sm" style={{ color: 'rgba(212,175,55,0.78)' }}>
          {t.latestNews}
        </p>
      </motion.div>

      {/* Browser notification permission banner */}
      <AnimatePresence>
        {notifPermission === 'default' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div
              className="p-4 rounded-2xl flex items-center justify-between gap-3"
              style={{
                background: 'rgba(212,175,55,0.08)',
                border: '1px solid rgba(212,175,55,0.25)',
              }}
            >
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 flex-shrink-0" style={{ color: '#d4af37' }} />
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  {language === 'ar'
                    ? 'فعّل الإشعارات لتلقي التنبيهات الفورية'
                    : language === 'nl'
                    ? 'Schakel meldingen in voor directe waarschuwingen'
                    : 'Activez les notifications pour des alertes instantanées'}
                </p>
              </div>
              <motion.button
                onClick={handleRequestPermission}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-xl text-xs font-bold flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #b8860b, #d4af37)',
                  color: '#1a1200',
                }}
              >
                {language === 'ar'
                  ? 'تفعيل'
                  : language === 'nl'
                  ? 'Inschakelen'
                  : 'Activer'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mark all as read */}
      {unreadCount > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 flex justify-end"
        >
          <motion.button
            onClick={markAllAsRead}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
            style={{
              background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.25)',
              color: '#4ade80',
            }}
          >
            <Check className="w-3.5 h-3.5" />
            {language === 'ar'
              ? 'تحديد الكل كمقروء'
              : language === 'nl'
              ? 'Alles als gelezen markeren'
              : 'Tout marquer comme lu'}
          </motion.button>
        </motion.div>
      )}

      {/* Notifications List */}
      <div className="space-y-3">
        <AnimatePresence>
          {notifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="p-12 rounded-3xl text-center" style={glassCard}>
                <div
                  className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4"
                  style={{
                    background: 'rgba(212,175,55,0.1)',
                    border: '1px solid rgba(212,175,55,0.2)',
                  }}
                >
                  <Bell className="w-10 h-10" style={{ color: 'rgba(212,175,55,0.6)' }} />
                </div>
                <p style={{ color: 'rgba(212,175,55,0.78)' }}>{t.noNotifications}</p>
              </div>
            </motion.div>
          ) : (
            notifications.map((notification, index) => {
              const config = getTypeConfig(notification.notification_type);
              const Icon = config.icon;
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.04 }}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => !notification.is_read && markAsRead(notification.id)}
                  className="cursor-pointer"
                >
                  <div
                    className="p-5 rounded-3xl transition-all"
                    style={{
                      ...glassCard,
                      ...(notification.is_read
                        ? {}
                        : {
                            border: '1px solid rgba(212,175,55,0.3)',
                            boxShadow:
                              '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(212,175,55,0.12)',
                          }),
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}
                        style={{ boxShadow: `0 4px 16px ${config.glow}` }}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </motion.div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-base font-bold text-white">
                            {notification.title}
                          </h3>
                          {!notification.is_read && (
                            <motion.div
                              animate={{ scale: [1, 1.3, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1"
                              style={{
                                background: '#d4af37',
                                boxShadow: '0 0 8px rgba(212,175,55,0.8)',
                              }}
                            />
                          )}
                        </div>

                        <p
                          className="text-sm mb-3 line-clamp-3"
                          style={{ color: 'rgba(255,255,255,0.82)' }}
                        >
                          {notification.message}
                        </p>

                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-semibold"
                            style={getPriorityStyle(notification.priority)}
                          >
                            {getPriorityLabel(notification.priority)}
                          </span>

                          <div
                            className="flex items-center gap-1 text-xs"
                            style={{ color: 'rgba(212,175,55,0.7)' }}
                          >
                            <Clock className="w-3 h-3" />
                            <span>
                              {new Date(notification.created_at).toLocaleDateString(
                                language === 'nl' ? 'nl-BE' : language === 'ar' ? 'ar-SA' : 'fr-BE'
                              )}
                            </span>
                          </div>

                          {notification.is_read && (
                            <div className="flex items-center gap-1 text-xs text-green-400">
                              <Check className="w-3 h-3" />
                              <span>{t.read}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
