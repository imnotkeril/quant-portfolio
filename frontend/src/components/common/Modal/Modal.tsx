/**
 * Modal Component
 * Universal modal dialog with different sizes and variants
 */
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import { useClickOutside } from '../../../hooks/useClickOutside';
import styles from './Modal.module.css';

export type ModalSize = 'small' | 'medium' | 'large' | 'xlarge' | 'fullscreen';
export type ModalVariant = 'default' | 'confirm' | 'side';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: ModalSize;
  variant?: ModalVariant;
  children: React.ReactNode;
  footer?: React.ReactNode;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
  backdropClassName?: string;
  contentClassName?: string;
  'data-testid'?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'medium',
  variant = 'default',
  children,
  footer,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className,
  backdropClassName,
  contentClassName,
  'data-testid': testId,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle click outside modal content
  useClickOutside(modalRef, () => {
    if (closeOnBackdropClick) {
      onClose();
    }
  }, isOpen);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  // Handle focus management
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Prevent body scroll
      document.body.style.overflow = 'hidden';

      // Focus the modal
      setTimeout(() => {
        modalRef.current?.focus();
      }, 0);
    } else {
      // Restore body scroll
      document.body.style.overflow = '';

      // Restore focus to previous element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const backdropClasses = classNames(
    styles.backdrop,
    styles[variant],
    {
      [styles.show]: isOpen,
    },
    backdropClassName
  );

  const modalClasses = classNames(
    styles.modal,
    styles[size],
    styles[variant],
    className
  );

  const contentClasses = classNames(
    styles.content,
    contentClassName
  );

  const modalContent = (
    <div
      ref={backdropRef}
      className={backdropClasses}
      data-testid={testId}
    >
      <div
        ref={modalRef}
        className={modalClasses}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        tabIndex={-1}
      >
        <div className={contentClasses}>
          {(title || showCloseButton) && (
            <div className={styles.header}>
              {title && (
                <h2 id="modal-title" className={styles.title}>
                  {title}
                </h2>
              )}

              {showCloseButton && (
                <button
                  type="button"
                  className={styles.closeButton}
                  onClick={onClose}
                  aria-label="Close modal"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>
          )}

          <div className={styles.body}>
            {children}
          </div>

          {footer && (
            <div className={styles.footer}>
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render modal in portal
  return createPortal(modalContent, document.body);
};

export default Modal;