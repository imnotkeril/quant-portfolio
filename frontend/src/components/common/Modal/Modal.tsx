// src/components/common/Modal/Modal.tsx
import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import { Button } from '../Button/Button';
import styles from './Modal.module.css';

interface ModalProps {
  open: boolean;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onCancel?: () => void;
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
}

export const Modal: React.FC<ModalProps> = ({
  open,
  title,
  children,
  footer,
  onCancel,
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
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (keyboard && e.key === 'Escape' && open) {
      onCancel?.();
    }
  }, [keyboard, open, onCancel]);

  // Handle mask click
  const handleMaskClick = useCallback((e: React.MouseEvent) => {
    if (maskClosable && e.target === e.currentTarget) {
      onCancel?.();
    }
  }, [maskClosable, onCancel]);

  // Focus management
  useEffect(() => {
    if (open) {
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Focus the modal content
      setTimeout(() => {
        if (modalContentRef.current) {
          const focusableElement = modalContentRef.current.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          ) as HTMLElement;

          if (focusableElement) {
            focusableElement.focus();
          } else {
            modalContentRef.current.focus();
          }
        }
      }, 100);
    } else {
      // Return focus to previous element
      if (focusTriggerAfterClose && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }
  }, [open, focusTriggerAfterClose]);

  // Keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  // After open change callback
  useEffect(() => {
    afterOpenChange?.(open);
  }, [open, afterOpenChange]);

  // After close callback
  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        afterClose?.();
      }, 200); // Animation duration
      return () => clearTimeout(timer);
    }
  }, [open, afterClose]);

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
    if (open) {
      document.addEventListener('keydown', handleTabKey);
      return () => document.removeEventListener('keydown', handleTabKey);
    }
  }, [open, handleTabKey]);

  // Default footer
  const defaultFooter = footer !== null && (
    <div className={styles.footer}>
      {onCancel && (
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={confirmLoading}
        >
          {cancelText}
        </Button>
      )}
      {onOk && (
        <Button
          variant="primary"
          onClick={onOk}
          loading={confirmLoading}
          disabled={confirmLoading}
        >
          {okText}
        </Button>
      )}
    </div>
  );

  // Don't render if not open and not forceRender
  if (!open && !forceRender) {
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
          [styles.hidden]: !open,
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
            width: typeof width === 'number' ? `${width}px` : width,
            height: typeof height === 'number' ? `${height}px` : height,
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
          tabIndex={-1}
        >
          {closable && (
            <button
              type="button"
              className={styles.closeButton}
              onClick={onCancel}
              aria-label="Close modal"
            >
              {closeIcon || (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              )}
            </button>
          )}

          {title && (
            <div className={styles.header}>
              <div id="modal-title" className={styles.title}>
                {title}
              </div>
            </div>
          )}

          <div
            className={styles.body}
            style={bodyStyle}
          >
            {children}
          </div>

          {(footer !== null) && (footer || defaultFooter)}
        </div>
      </div>
    </div>
  );

  const renderModal = modalRender ? modalRender(modalContent) : modalContent;

  return createPortal(renderModal, getContainerElement());
};