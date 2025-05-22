import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { NotificationMessage, NotificationType } from '../types/common';
import { UI_DEFAULTS } from '../constants/defaults';

interface NotificationContextType {
  notifications: NotificationMessage[];
  addNotification: (
    type: NotificationType,
    title: string,
    message: string,
    autoHide?: boolean,
    duration?: number
  ) => string;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  addNotification: () => '',
  removeNotification: () => {},
  clearAllNotifications: () => {},
});

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);

  // Add a new notification
  const addNotification = useCallback(
    (
      type: NotificationType,
      title: string,
      message: string,
      autoHide = true,
      duration = UI_DEFAULTS.TOAST_AUTO_HIDE_DURATION
    ): string => {
      const id = uuidv4();
      const notification: NotificationMessage = {
        id,
        type,
        title,
        message,
        autoHide,
        duration,
      };

      setNotifications(prevNotifications => [...prevNotifications, notification]);

      // Auto-hide notification after specified duration if autoHide is true
      if (autoHide) {
        setTimeout(() => {
          removeNotification(id);
        }, duration);
      }

      return id;
    },
    []
  );

  // Remove a notification by ID
  const removeNotification = useCallback((id: string) => {
    setNotifications(prevNotifications =>
      prevNotifications.filter(notification => notification.id !== id)
    );
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Context value
  const contextValue: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};