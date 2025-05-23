/**
 * Dropdown Component
 * Universal dropdown menu with customizable trigger and content
 */
import React, { useState, useRef, cloneElement } from 'react';
import classNames from 'classnames';
import { useClickOutside } from '../../../hooks/useClickOutside';
import styles from './Dropdown.module.css';

export type DropdownPlacement =
  | 'bottom-start'
  | 'bottom-end'
  | 'bottom-center'
  | 'top-start'
  | 'top-end'
  | 'top-center'
  | 'left-start'
  | 'left-end'
  | 'right-start'
  | 'right-end';

export type DropdownTrigger = 'click' | 'hover' | 'contextMenu';

export interface DropdownMenuItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
  onClick?: (event: React.MouseEvent) => void;
  children?: DropdownMenuItem[];
}

interface DropdownProps {
  children: React.ReactElement;
  overlay?: React.ReactNode;
  menu?: DropdownMenuItem[];
  placement?: DropdownPlacement;
  trigger?: DropdownTrigger | DropdownTrigger[];
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  disabled?: boolean;
  arrow?: boolean;
  offset?: [number, number];
  className?: string;
  overlayClassName?: string;
  'data-testid'?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  children,
  overlay,
  menu,
  placement = 'bottom-start',
  trigger = 'click',
  visible,
  onVisibleChange,
  disabled = false,
  arrow = true,
  offset = [0, 4],
  className,
  overlayClassName,
  'data-testid': testId,
}) => {
  const [internalVisible, setInternalVisible] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement>(null);

  const isVisible = visible !== undefined ? visible : internalVisible;
  const triggers = Array.isArray(trigger) ? trigger : [trigger];

  // Handle click outside
  useClickOutside(dropdownRef, () => {
    if (isVisible && triggers.includes('click')) {
      handleVisibleChange(false);
    }
  }, isVisible);

  const handleVisibleChange = (newVisible: boolean) => {
    if (disabled) return;

    if (visible === undefined) {
      setInternalVisible(newVisible);
    }
    onVisibleChange?.(newVisible);
  };

  const handleClick = (event: React.MouseEvent) => {
    if (disabled || !triggers.includes('click')) return;

    event.preventDefault();
    event.stopPropagation();
    handleVisibleChange(!isVisible);
  };

  const handleMouseEnter = () => {
    if (disabled || !triggers.includes('hover')) return;

    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }

    handleVisibleChange(true);
  };

  const handleMouseLeave = () => {
    if (disabled || !triggers.includes('hover')) return;

    const timeout = setTimeout(() => {
      handleVisibleChange(false);
    }, 100);

    setHoverTimeout(timeout);
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    if (disabled || !triggers.includes('contextMenu')) return;

    event.preventDefault();
    handleVisibleChange(true);
  };

  const handleMenuItemClick = (item: DropdownMenuItem, event: React.MouseEvent) => {
    if (item.disabled) return;

    item.onClick?.(event);

    // Close dropdown after item click unless it has children
    if (!item.children) {
      handleVisibleChange(false);
    }
  };

  const renderMenuItem = (item: DropdownMenuItem, level: number = 0): React.ReactNode => {
    if (item.divider) {
      return <div key={item.key} className={styles.divider} />;
    }

    const itemClasses = classNames(
      styles.menuItem,
      {
        [styles.disabled]: item.disabled,
        [styles.danger]: item.danger,
        [styles.hasChildren]: item.children && item.children.length > 0,
      }
    );

    return (
      <div
        key={item.key}
        className={itemClasses}
        onClick={(e) => handleMenuItemClick(item, e)}
      >
        <div className={styles.menuItemContent}>
          {item.icon && (
            <span className={styles.menuItemIcon}>{item.icon}</span>
          )}
          <span className={styles.menuItemLabel}>{item.label}</span>
          {item.children && item.children.length > 0 && (
            <span className={styles.menuItemArrow}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9,18 15,12 9,6" />
              </svg>
            </span>
          )}
        </div>

        {item.children && item.children.length > 0 && (
          <div className={styles.submenu}>
            {item.children.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderOverlay = () => {
    if (overlay) {
      return overlay;
    }

    if (menu && menu.length > 0) {
      return (
        <div className={styles.menu}>
          {menu.map(item => renderMenuItem(item))}
        </div>
      );
    }

    return null;
  };

  const overlayContent = renderOverlay();
  if (!overlayContent) {
    return children;
  }

  const dropdownClasses = classNames(
    styles.dropdown,
    {
      [styles.disabled]: disabled,
    },
    className
  );

  const overlayClasses = classNames(
    styles.overlay,
    styles[placement],
    {
      [styles.visible]: isVisible,
      [styles.withArrow]: arrow,
    },
    overlayClassName
  );

  // Clone trigger element and add event handlers
  const triggerElement = cloneElement(children, {
    ref: triggerRef,
    onClick: (e: React.MouseEvent) => {
      children.props.onClick?.(e);
      handleClick(e);
    },
    onContextMenu: (e: React.MouseEvent) => {
      children.props.onContextMenu?.(e);
      handleContextMenu(e);
    },
    onMouseEnter: (e: React.MouseEvent) => {
      children.props.onMouseEnter?.(e);
      handleMouseEnter();
    },
    onMouseLeave: (e: React.MouseEvent) => {
      children.props.onMouseLeave?.(e);
      handleMouseLeave();
    },
  });

  return (
    <div
      ref={dropdownRef}
      className={dropdownClasses}
      data-testid={testId}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {triggerElement}

      <div
        className={overlayClasses}
        style={{
          transform: `translate(${offset[0]}px, ${offset[1]}px)`,
        }}
      >
        {arrow && <div className={styles.arrow} />}
        <div className={styles.overlayContent}>
          {overlayContent}
        </div>
      </div>
    </div>
  );
};

export default Dropdown;