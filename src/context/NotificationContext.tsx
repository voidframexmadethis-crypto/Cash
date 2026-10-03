import React, { createContext, useContext, useState, useEffect } from 'react';
import { SystemNotification, NotificationPreferences } from '../types';

interface NotificationContextType {
  notifications: SystemNotification[];
  preferences: NotificationPreferences;
  unreadCount: number;
  addNotification: (notification: Omit<SystemNotification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => void;
  toast: SystemNotification | null;
  dismissToast: () => void;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  browserNotifications: false,
  orderAlerts: true,
  paymentAlerts: true,
  beatActivityAlerts: true,
  securityAlerts: true,
  promotionalAlerts: true,
};

const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif-1',
    type: 'system',
    title: 'Command Center Online',
    message: 'CASHMERE KID$ Music Platform Engine initialized successfully.',
    timestamp: new Date().toISOString(),
    isRead: false
  },
  {
    id: 'notif-2',
    type: 'security',
    title: 'PayPal Security Verification Active',
    message: 'Server-side payment capture verification active on all checkout orders.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    isRead: false
  }
];

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    try {
      const saved = localStorage.getItem('cashmere_notifications');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
    try {
      const saved = localStorage.getItem('cashmere_notification_prefs');
      return saved ? JSON.parse(saved) : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  const [toast, setToast] = useState<SystemNotification | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('cashmere_notifications', JSON.stringify(notifications));
    } catch (e) {
      console.error('Failed to persist notifications:', e);
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem('cashmere_notification_prefs', JSON.stringify(preferences));
    } catch (e) {
      console.error('Failed to persist preferences:', e);
    }
  }, [preferences]);

  const addNotification = (notifData: Omit<SystemNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotif: SystemNotification = {
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      ...notifData,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    setNotifications(prev => [newNotif, ...prev]);
    setToast(newNotif);

    // Auto-dismiss toast after 5 seconds
    setTimeout(() => {
      setToast(prev => (prev?.id === newNotif.id ? null : prev));
    }, 5000);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const updatePreferences = (prefs: Partial<NotificationPreferences>) => {
    setPreferences(prev => ({ ...prev, ...prefs }));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      preferences,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearNotifications,
      updatePreferences,
      toast,
      dismissToast: () => setToast(null)
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};
