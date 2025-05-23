/**
 * Notification Context for managing application notifications and alerts
 */
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

/**
 * Notification type
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

/**
 * Notification position
 */
export type NotificationPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-center'
  | 'bottom-center';

/**
 * Single notification interface
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  createdAt: Date;
}

/**
 * Notification context interface
 */
interface NotificationContextType {
  notifications: Notification[];
  position: NotificationPosition;
  setPosition: (position: NotificationPosition) => void;

  // Add notifications
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => string;
  success: (message: string, title?: string, options?: Partial<Notification>) => string;
  error: (message: string, title?: string, options?: Partial<Notification>) => string;
  warning: (message: string, title?: string, options?: Partial<Notification>) => string;
  info: (message: string, title?: string, options?: Partial<Notification>) => string;

  // Remove notifications
  removeNotification: (id: string) => void;
  clearAll: () => void;

  // Global loading state
  isGlobalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;

  // Progress notifications
  showProgress: (id: string, progress: number, message?: string) => void;
  hideProgress: (id: string) => void;
}

/**
 * Notification provider props
 */
interface NotificationProviderProps {
  children: ReactNode;
  defaultPosition?: NotificationPosition;
  maxNotifications?: number;
}

/**
 * Create the notification context
 */
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

/**
 * Custom hook to use notification context
 */
export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

/**
 * Generate unique ID for notifications
 */
const generateId = (): string => {
  return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Notification provider component
 */
export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  defaultPosition = 'top-right',
  maxNotifications = 5
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [position, setPosition] = useState<NotificationPosition>(defaultPosition);
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [progressNotifications, setProgressNotifications] = useState<Map<string, any>>(new Map());

  // Add a new notification
  const addNotification = useCallback((
    notificationData: Omit<Notification, 'id' | 'createdAt'>
  ): string => {
    const id = generateId();
    const notification: Notification = {
      ...notificationData,
      id,
      createdAt: new Date(),
      duration: notificationData.duration ?? 5000, // Default 5 seconds
    };

    setNotifications(prev => {
      const newNotifications = [notification, ...prev];

      // Limit the number of notifications
      if (newNotifications.length > maxNotifications) {
        return newNotifications.slice(0, maxNotifications);
      }

      return newNotifications;
    });

    // Auto-remove notification after duration (if not persistent)
    if (!notification.persistent && notification.duration && notification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration);
    }

    return id;
  }, [maxNotifications]);

  // Remove a notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods for different notification types
  const success = useCallback((
    message: string,
    title?: string,
    options?: Partial<Notification>
  ): string => {
    return addNotification({
      type: 'success',
      message,
      title,
      ...options,
    });
  }, [addNotification]);

  const error = useCallback((
    message: string,
    title?: string,
    options?: Partial<Notification>
  ): string => {
    return addNotification({
      type: 'error',
      message,
      title,
      persistent: true, // Errors are persistent by default
      ...options,
    });
  }, [addNotification]);

  const warning = useCallback((
    message: string,
    title?: string,
    options?: Partial<Notification>
  ): string => {
    return addNotification({
      type: 'warning',
      message,
      title,
      duration: 7000, // Warnings last longer
      ...options,
    });
  }, [addNotification]);

  const info = useCallback((
    message: string,
    title?: string,
    options?: Partial<Notification>
  ): string => {
    return addNotification({
      type: 'info',
      message,
      title,
      ...options,
    });
  }, [addNotification]);

  // Progress notification methods
  const showProgress = useCallback((id: string, progress: number, message?: string) => {
    setProgressNotifications(prev => {
      const newMap = new Map(prev);
      newMap.set(id, { progress, message, id });
      return newMap;
    });
  }, []);

  const hideProgress = useCallback((id: string) => {
    setProgressNotifications(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }, []);

  const contextValue: NotificationContextType = {
    notifications,
    position,
    setPosition,

    addNotification,
    success,
    error,
    warning,
    info,

    removeNotification,
    clearAll,

    isGlobalLoading,
    setGlobalLoading: setIsGlobalLoading,

    showProgress,
    hideProgress,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;