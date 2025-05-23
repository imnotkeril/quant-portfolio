/**
 * Alert Component
 * Display important messages with various types and actions
 */
import React, { useState } from 'react';
import classNames from 'classnames';
import styles from './Alert.module.css';

export type AlertType = 'success' | 'info' | 'warning' | 'error';

interface AlertProps {
  type?: AlertType;
  message: React.ReactNode;
  description?: React.ReactNode;
  showIcon?: boolean;
  icon?: React.ReactNode;
  closable?: boolean;
  closeText?: React.ReactNode;
  onClose?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  afterClose?: () => void;
  action?: React.ReactNode;
  banner?: boolean;
  className?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
}

const defaultIcons = {
  success: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22,4 12,14.01 9,11.01"/>
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
  warning: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  ),
};

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  message,
  description,
  showIcon = false,
  icon,
  closable = false,
  closeText,
  onClose,
  afterClose,
  action,
  banner = false,
  className,
  style,
  'data-testid': testId,
}) => {
  const [visible, setVisible] = useState(true);
  const [closing, setClosing] = useState(false);

  const handleClose = (event: React.MouseEvent<HTMLButtonElement>) => {
    setClosing(true);
    onClose?.(event);

    // Start close animation
    setTimeout(() => {
      setVisible(false);
      afterClose?.();
    }, 200);
  };

  if (!visible) {
    return null;
  }

  const alertClasses = classNames(
    styles.alert,
    styles[type],
    {
      [styles.withIcon]: showIcon,
      [styles.withDescription]: !!description,
      [styles.banner]: banner,
      [styles.closable]: closable,
      [styles.closing]: closing,
    },
    className
  );

  const renderIcon = () => {
    if (!showIcon) return null;

    const iconToRender = icon || defaultIcons[type];

    return (
      <div className={styles.icon}>
        {iconToRender}
      </div>
    );
  };

  const renderCloseButton = () => {
    if (!closable) return null;

    return (
      <button
        type="button"
        className={styles.closeButton}
        onClick={handleClose}
        aria-label="Close alert"
      >
        {closeText || (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        )}
      </button>
    );
  };

  return (
    <div
      className={alertClasses}
      style={style}
      role="alert"
      data-testid={testId}
    >
      {renderIcon()}

      <div className={styles.content}>
        <div className={styles.message}>
          {message}
        </div>

        {description && (
          <div className={styles.description}>
            {description}
          </div>
        )}
      </div>

      {action && (
        <div className={styles.action}>
          {action}
        </div>
      )}

      {renderCloseButton()}
    </div>
  );
};

export default Alert;