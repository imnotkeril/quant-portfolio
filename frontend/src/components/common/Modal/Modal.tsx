// frontend/src/components/common/Modal/Modal.tsx
import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import { Button } from '../Button/Button';
import styles from './Modal.module.css';

interface ModalProps {
  // Support both open and isOpen for backward compatibility
  open?: boolean;
  isOpen?: boolean;

  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;

  // Support both onCancel and onClose for backward compatibility
  onCancel?: () => void;
  onClose?: () => void;

  onOk?: () => void;
  okText?: string;
  cancelText?: string;
  confirmLoading?: boolean;
  destroyOnClose?: boolean;
  maskClosable?: boolean;
  keyboard?: boolean;
  centered?: boolean;
  width?: string | number;
  height?: string | number;
  zIndex?: number;
  className?: string;
  bodyStyle?: React.CSSProperties;
  maskStyle?: React.CSSProperties;
  wrapClassName?: string;
  getContainer?: HTMLElement | (() => HTMLElement) | string | false;
  forceRender?: boolean;
  focusTriggerAfterClose?: boolean;
  modalRender?: (node: React.ReactNode) => React.ReactNode;
  closeIcon?: React.ReactNode;
  closable?: boolean;
  afterClose?: () => void;
  afterOpenChange?: (open: boolean) => void;

  // Additional props for flexibility
  size?: 'small' | 'medium' | 'large';
}

export const Modal: React.FC<ModalProps> = ({
  open,
  isOpen,
  title,
  children,
  footer,
  onCancel,
  onClose,
  onOk,
  okText = 'OK',
  cancelText = 'Cancel',
  confirmLoading = false,
  destroyOnClose = false,
  maskClosable = true,
  keyboard = true,
  centered = false,
  width = 520,
  height,
  zIndex = 1000,
  className,
  bodyStyle,
  maskStyle,
  wrapClassName,
  getContainer,
  forceRender = false,
  focusTriggerAfterClose = true,
  modalRender,
  closeIcon,
  closable = true,
  afterClose,
  afterOpenChange,
  size = 'medium',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);

  // Determine if modal is open - support both open and isOpen props
  const isModalOpen = open !== undefined ? open : (isOpen !== undefined ? isOpen : false);

  // Determine close handler - support both onCancel and onClose props
  const handleClose = onClose || onCancel;

  // Handle escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (keyboard && e.key === 'Escape' && isModalOpen) {
      handleClose?.();
    }
  }, [keyboard, isModalOpen, handleClose]);

  // Handle mask click
  const handleMaskClick = useCallback((e: React.MouseEvent) => {
    if (maskClosable && e.target === e.currentTarget) {
      handleClose?.();
    }
  }, [maskClosable, handleClose]);

  // Add keyboard event listener
  useEffect(() => {
    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isModalOpen, handleKeyDown]);

  // Focus management
  useEffect(() => {
    if (isModalOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Focus the modal after a short delay to ensure it's rendered
      const timer = setTimeout(() => {
        if (modalContentRef.current) {
          modalContentRef.current.focus();
        }
      }, 100);

      return () => clearTimeout(timer);
    } else {
      // Return focus to previous element when modal closes
      if (focusTriggerAfterClose && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }
  }, [isModalOpen, focusTriggerAfterClose]);

  // Body scroll lock
  useEffect(() => {
    if (isModalOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isModalOpen]);

  // After open change callback
  useEffect(() => {
    afterOpenChange?.(isModalOpen);
  }, [isModalOpen, afterOpenChange]);

  // After close callback
  useEffect(() => {
    if (!isModalOpen) {
      const timer = setTimeout(() => {
        afterClose?.();
      }, 200); // Animation duration
      return () => clearTimeout(timer);
    }
  }, [isModalOpen, afterClose]);

  // Focus trap
  const handleTabKey = useCallback((e: KeyboardEvent) => {
    if (!modalContentRef.current || e.key !== 'Tab') return;

    const focusableElements = modalContentRef.current.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      document.addEventListener('keydown', handleTabKey);
      return () => document.removeEventListener('keydown', handleTabKey);
    }
  }, [isModalOpen, handleTabKey]);

  // Get modal width based on size
  const getModalWidth = () => {
    if (typeof width === 'number' || typeof width === 'string') {
      return width;
    }

    switch (size) {
      case 'small':
        return 400;
      case 'large':
        return 800;
      case 'medium':
      default:
        return 520;
    }
  };

  // Default footer
  const defaultFooter = footer !== null && (
    <div className={styles.footer}>
      {handleClose && (
        <Button
          variant="outline"
          onClick={handleClose}
          disabled={confirmLoading}
        >
          {cancelText}
        </Button>
      )}
      {onOk && (
        <Button
          variant="primary"
          onClick={onOk}
          disabled={confirmLoading}
        >
          {okText}
        </Button>
      )}
    </div>
  );

  // Don't render if not open and not forceRender
  if (!isModalOpen && !forceRender) {
    if (destroyOnClose) {
      return null;
    }
  }

  // Get container element
  const getContainerElement = (): HTMLElement => {
    if (getContainer === false) {
      return modalRef.current?.parentElement || document.body;
    }
    if (typeof getContainer === 'string') {
      return document.querySelector(getContainer) || document.body;
    }
    if (typeof getContainer === 'function') {
      return getContainer();
    }
    if (getContainer instanceof HTMLElement) {
      return getContainer;
    }
    return document.body;
  };

  const modalContent = (
    <div
      ref={modalRef}
      className={classNames(
        styles.modalRoot,
        {
          [styles.hidden]: !isModalOpen,
          [styles.centered]: centered,
        },
        wrapClassName
      )}
      style={{ zIndex, ...maskStyle }}
      onClick={handleMaskClick}
      role="presentation"
    >
      <div className={styles.modalWrap}>
        <div
          ref={modalContentRef}
          className={classNames(styles.modal, className)}
          style={{
            width: getModalWidth(),
            height,
            ...bodyStyle
          }}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
        >
          {/* Header */}
          {(title || closable) && (
            <div className={styles.header}>
              {title && (
                <div id="modal-title" className={styles.title}>
                  {title}
                </div>
              )}
              {closable && (
                <button
                  className={styles.closeButton}
                  onClick={handleClose}
                  aria-label="Close modal"
                >
                  {closeIcon || '×'}
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className={styles.body}>
            {children}
          </div>

          {/* Footer */}
          {footer !== null && (footer || defaultFooter)}
        </div>
      </div>
    </div>
  );

  // Render modal content
  if (modalRender) {
    return modalRender(modalContent);
  }

  // Use portal to render modal at the end of body
  return createPortal(modalContent, getContainerElement());
};

export default Modal;