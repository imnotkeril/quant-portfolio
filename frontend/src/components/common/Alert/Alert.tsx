// src/components/common/Alert/Alert.tsx
import React, { useState } from 'react';
import classNames from 'classnames';
import styles from './Alert.module.css';

export type AlertType = 'success' | 'info' | 'warning' | 'error';

interface AlertProps {
  type?: AlertType;
  message: React.ReactNode;
  description?: React.ReactNode;
  showIcon?: boolean;
  closable?: boolean;
  closeText?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  onClose?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  afterClose?: () => void;
  banner?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const defaultIcons = {
  success: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20,6 9,17 4,12" />
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  warning: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
};

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  message,
  description,
  showIcon = false,
  closable = false,
  closeText,
  icon,
  action,
  onClose,
  afterClose,
  banner = false,
  className,
  style,
}) => {
  const [visible, setVisible] = useState(true);
  const [closing, setClosing] = useState(false);

  const handleClose = (e: React.MouseEvent<HTMLButtonElement>) => {
    setClosing(true);

    // Trigger animation
    setTimeout(() => {
      setVisible(false);
      onClose?.(e);
      afterClose?.();
    }, 200); // Animation duration
  };

  if (!visible) {
    return null;
  }

  const alertIcon = icon || (showIcon ? defaultIcons[type] : null);
  const hasDescription = !!description;

  return (
    <div
      className={classNames(
        styles.alert,
        styles[type],
        {
          [styles.withIcon]: !!alertIcon,
          [styles.withDescription]: hasDescription,
          [styles.banner]: banner,
          [styles.closable]: closable,
          [styles.closing]: closing,
        },
        className
      )}
      style={style}
      role="alert"
      aria-live="polite"
    >
      {alertIcon && (
        <div className={styles.alertIcon}>
          {alertIcon}
        </div>
      )}

      <div className={styles.alertContent}>
        <div className={styles.alertMessage}>
          {message}
        </div>

        {description && (
          <div className={styles.alertDescription}>
            {description}
          </div>
        )}
      </div>

      {action && (
        <div className={styles.alertAction}>
          {action}
        </div>
      )}

      {closable && (
        <button
          type="button"
          className={styles.alertCloseIcon}
          onClick={handleClose}
          aria-label="Close alert"
        >
          {closeText || (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
};