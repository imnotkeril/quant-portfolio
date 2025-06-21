// src/components/common/Dropdown/Dropdown.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import classNames from 'classnames';
import { Button } from '../Button/Button';
import styles from './Dropdown.module.css';

export interface DropdownMenuItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
  children?: DropdownMenuItem[];
  onClick?: (item: DropdownMenuItem) => void;
}

interface DropdownProps {
  menu: DropdownMenuItem[];
  trigger?: 'hover' | 'click' | 'contextMenu';
  placement?: 'bottom' | 'bottomLeft' | 'bottomRight' | 'top' | 'topLeft' | 'topRight' | 'left' | 'right';
  arrow?: boolean;
  disabled?: boolean;
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  overlay?: React.ReactNode;
  overlayClassName?: string;
  overlayStyle?: React.CSSProperties;
  getPopupContainer?: () => HTMLElement;
  autoAdjustOverflow?: boolean;
  destroyPopupOnHide?: boolean;
  children: React.ReactElement;
  className?: string;
  dropdownRender?: (menu: React.ReactNode) => React.ReactNode;
}

export const Dropdown: React.FC<DropdownProps> = ({
  menu,
  trigger = 'click',
  placement = 'bottomLeft',
  arrow = false,
  disabled = false,
  visible,
  onVisibleChange,
  overlay,
  overlayClassName,
  overlayStyle,
  getPopupContainer,
  autoAdjustOverflow = true,
  destroyPopupOnHide = false,
  children,
  className,
  dropdownRender,
}) => {
  const [internalVisible, setInternalVisible] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const isVisible = visible !== undefined ? visible : internalVisible;

  // Calculate position based on placement
  const calculatePosition = useCallback(() => {
    if (!triggerRef.current || !menuRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const menuRect = menuRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    let top = 0;
    let left = 0;

    // Calculate base position
    switch (placement) {
      case 'bottom':
        top = triggerRect.bottom + 4;
        left = triggerRect.left + (triggerRect.width - menuRect.width) / 2;
        break;
      case 'bottomLeft':
        top = triggerRect.bottom + 4;
        left = triggerRect.left;
        break;
      case 'bottomRight':
        top = triggerRect.bottom + 4;
        left = triggerRect.right - menuRect.width;
        break;
      case 'top':
        top = triggerRect.top - menuRect.height - 4;
        left = triggerRect.left + (triggerRect.width - menuRect.width) / 2;
        break;
      case 'topLeft':
        top = triggerRect.top - menuRect.height - 4;
        left = triggerRect.left;
        break;
      case 'topRight':
        top = triggerRect.top - menuRect.height - 4;
        left = triggerRect.right - menuRect.width;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - menuRect.height) / 2;
        left = triggerRect.left - menuRect.width - 4;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - menuRect.height) / 2;
        left = triggerRect.right + 4;
        break;
    }

    // Auto adjust overflow
    if (autoAdjustOverflow) {
      if (left < 8) left = 8;
      if (left + menuRect.width > viewport.width - 8) {
        left = viewport.width - menuRect.width - 8;
      }
      if (top < 8) top = 8;
      if (top + menuRect.height > viewport.height - 8) {
        top = Math.max(8, triggerRect.top - menuRect.height - 4);
      }
    }

    setPosition({ top, left });
  }, [placement, autoAdjustOverflow]);

  // Handle visibility change
  const handleVisibleChange = useCallback((newVisible: boolean) => {
    if (disabled) return;

    if (visible === undefined) {
      setInternalVisible(newVisible);
    }
    onVisibleChange?.(newVisible);
  }, [disabled, visible, onVisibleChange]);

  // Handle trigger events
  const handleTriggerClick = useCallback(() => {
    if (trigger === 'click') {
      handleVisibleChange(!isVisible);
    }
  }, [trigger, isVisible, handleVisibleChange]);

  const handleTriggerMouseEnter = useCallback(() => {
    if (trigger === 'hover') {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      handleVisibleChange(true);
    }
  }, [trigger, handleVisibleChange]);

  const handleTriggerMouseLeave = useCallback(() => {
    if (trigger === 'hover') {
      timeoutRef.current = setTimeout(() => {
        handleVisibleChange(false);
      }, 100);
    }
  }, [trigger, handleVisibleChange]);

  const handleMenuMouseEnter = useCallback(() => {
    if (trigger === 'hover' && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, [trigger]);

  const handleMenuMouseLeave = useCallback(() => {
    if (trigger === 'hover') {
      timeoutRef.current = setTimeout(() => {
        handleVisibleChange(false);
      }, 100);
    }
  }, [trigger, handleVisibleChange]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (trigger === 'contextMenu') {
      e.preventDefault();
      setPosition({ top: e.clientY, left: e.clientX });
      handleVisibleChange(true);
    }
  }, [trigger, handleVisibleChange]);

  // Handle menu item click
  const handleMenuItemClick = useCallback((item: DropdownMenuItem) => {
    if (item.disabled) return;

    item.onClick?.(item);

    if (!item.children) {
      handleVisibleChange(false);
    }
  }, [handleVisibleChange]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        handleVisibleChange(false);
        break;
      case 'Enter':
      case ' ':
        if (!isVisible) {
          e.preventDefault();
          handleVisibleChange(true);
        }
        break;
    }
  }, [isVisible, handleVisibleChange]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        handleVisibleChange(false);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible, handleVisibleChange]);

  // Calculate position when visible
  useEffect(() => {
    if (isVisible) {
      // Use setTimeout to ensure DOM is updated
      setTimeout(calculatePosition, 0);
      window.addEventListener('resize', calculatePosition);
      window.addEventListener('scroll', calculatePosition);

      return () => {
        window.removeEventListener('resize', calculatePosition);
        window.removeEventListener('scroll', calculatePosition);
      };
    }
  }, [isVisible, calculatePosition]);

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Render menu items
  const renderMenuItem = (item: DropdownMenuItem, index: number) => {
    if (item.divider) {
      return <div key={item.key || index} className={styles.divider} />;
    }

    return (
      <div
        key={item.key || index}
        className={classNames(styles.menuItem, {
          [styles.disabled]: item.disabled,
          [styles.danger]: item.danger,
        })}
        onClick={() => handleMenuItemClick(item)}
        role="menuitem"
        tabIndex={item.disabled ? -1 : 0}
        aria-disabled={item.disabled}
      >
        {item.icon && <span className={styles.menuItemIcon}>{item.icon}</span>}
        <span className={styles.menuItemLabel}>{item.label}</span>
        {item.children && (
          <span className={styles.menuItemArrow}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9,18 15,12 9,6" />
            </svg>
          </span>
        )}
      </div>
    );
  };

  const renderMenu = () => {
    if (overlay) {
      return overlay;
    }

    const menuContent = (
      <div className={styles.menu} role="menu">
        {menu.map(renderMenuItem)}
      </div>
    );

    return dropdownRender ? dropdownRender(menuContent) : menuContent;
  };

  // Clone trigger element and add event handlers
  const triggerElement = React.cloneElement(children, {
    ref: triggerRef,
    onClick: (e: React.MouseEvent) => {
      children.props.onClick?.(e);
      handleTriggerClick();
    },
    onMouseEnter: (e: React.MouseEvent) => {
      children.props.onMouseEnter?.(e);
      handleTriggerMouseEnter();
    },
    onMouseLeave: (e: React.MouseEvent) => {
      children.props.onMouseLeave?.(e);
      handleTriggerMouseLeave();
    },
    onContextMenu: (e: React.MouseEvent) => {
      children.props.onContextMenu?.(e);
      handleContextMenu(e);
    },
    onKeyDown: (e: React.KeyboardEvent) => {
      children.props.onKeyDown?.(e);
      handleKeyDown(e);
    },
    className: classNames(children.props.className, {
      [styles.triggerActive]: isVisible,
    }),
    'aria-haspopup': 'menu',
    'aria-expanded': isVisible,
  });

  return (
    <div className={classNames(styles.dropdown, className)}>
      {triggerElement}

      {isVisible && (!destroyPopupOnHide || isVisible) && (
        <div
          ref={dropdownRef}
          className={classNames(styles.dropdownMenu, overlayClassName)}
          style={{
            ...overlayStyle,
            position: 'fixed',
            top: position.top,
            left: position.left,
            zIndex: 1000,
          }}
          onMouseEnter={handleMenuMouseEnter}
          onMouseLeave={handleMenuMouseLeave}
        >
          <div ref={menuRef}>
            {arrow && (
              <div
                className={classNames(styles.arrow, styles[`arrow-${placement}`])}
              />
            )}
            {renderMenu()}
          </div>
        </div>
      )}
    </div>
  );
};