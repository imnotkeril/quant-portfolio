import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: 'small' | 'medium' | 'large' | 'full';
  centered?: boolean;
  closable?: boolean;
  maskClosable?: boolean;
  className?: string;
  bodyClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
}

/**
 * Modal component following Wild Market Capital design system
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  width = 'medium',
  centered = true,
  closable = true,
  maskClosable = true,
  className,
  bodyClassName,
  headerClassName,
  footerClassName
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && closable) {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        isOpen &&
        maskClosable
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden'; // Prevent body scrolling when modal is open
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto'; // Re-enable body scrolling when modal is closed
    };
  }, [isOpen, onClose, closable, maskClosable]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex overflow-auto bg-background/80 backdrop-blur-sm transition-opacity">
      <div
        className={classNames(
          'relative m-auto rounded-lg bg-background shadow-lg border border-divider',
          {
            'w-full max-w-md': width === 'small',
            'w-full max-w-2xl': width === 'medium',
            'w-full max-w-4xl': width === 'large',
            'w-11/12': width === 'full',
            'my-4': !centered,
            'my-auto': centered
          },
          className
        )}
        ref={modalRef}
      >
        {/* Header */}
        {(title || closable) && (
          <div
            className={classNames(
              'flex items-center justify-between p-4 border-b border-divider',
              headerClassName
            )}
          >
            {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
            {closable && (
              <button
                className="ml-auto text-neutral-gray hover:text-white transition-colors"
                onClick={onClose}
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div
          className={classNames(
            'p-6',
            bodyClassName
          )}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className={classNames(
              'flex justify-end p-4 border-t border-divider',
              footerClassName
            )}
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};