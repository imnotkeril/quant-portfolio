/**
 * Tooltip Component
 * Floating tooltip with various placement options
 */
import React, { useState, useRef, useEffect, cloneElement } from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import styles from './Tooltip.module.css';

export type TooltipPlacement =
  | 'top'
  | 'topLeft'
  | 'topRight'
  | 'bottom'
  | 'bottomLeft'
  | 'bottomRight'
  | 'left'
  | 'leftTop'
  | 'leftBottom'
  | 'right'
  | 'rightTop'
  | 'rightBottom';

export type TooltipTrigger = 'hover' | 'focus' | 'click' | 'contextMenu';

interface TooltipProps {
  children: React.ReactElement;
  title?: React.ReactNode;
  placement?: TooltipPlacement;
  trigger?: TooltipTrigger | TooltipTrigger[];
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
  overlayClassName?: string;
  overlayStyle?: React.CSSProperties;
  color?: string;
  arrow?: boolean;
  destroyTooltipOnHide?: boolean;
  getPopupContainer?: () => HTMLElement;
  className?: string;
  'data-testid'?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  title,
  placement = 'top',
  trigger = 'hover',
  visible,
  onVisibleChange,
  mouseEnterDelay = 100,
  mouseLeaveDelay = 100,
  overlayClassName,
  overlayStyle,
  color,
  arrow = true,
  destroyTooltipOnHide = false,
  getPopupContainer,
  className,
  'data-testid': testId,
}) => {
  const [internalVisible, setInternalVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const enterTimeoutRef = useRef<NodeJS.Timeout>();
  const leaveTimeoutRef = useRef<NodeJS.Timeout>();

  const isVisible = visible !== undefined ? visible : internalVisible;
  const triggers = Array.isArray(trigger) ? trigger : [trigger];

  // Mount effect
  useEffect(() => {
    setMounted(true);
  }, []);

  // Clear timeouts on unmount
  useEffect(() => {
    return () => {
      if (enterTimeoutRef.current) {
        clearTimeout(enterTimeoutRef.current);
      }
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
      }
    };
  }, []);

  // Update position when visible
  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      updatePosition();
    }
  }, [isVisible, title, placement]);

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollX = window.pageXOffset;
    const scrollY = window.pageYOffset;

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = triggerRect.top + scrollY - tooltipRect.height - 8;
        left = triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'topLeft':
        top = triggerRect.top + scrollY - tooltipRect.height - 8;
        left = triggerRect.left + scrollX;
        break;
      case 'topRight':
        top = triggerRect.top + scrollY - tooltipRect.height - 8;
        left = triggerRect.right + scrollX - tooltipRect.width;
        break;
      case 'bottom':
        top = triggerRect.bottom + scrollY + 8;
        left = triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottomLeft':
        top = triggerRect.bottom + scrollY + 8;
        left = triggerRect.left + scrollX;
        break;
      case 'bottomRight':
        top = triggerRect.bottom + scrollY + 8;
        left = triggerRect.right + scrollX - tooltipRect.width;
        break;
      case 'left':
        top = triggerRect.top + scrollY + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left + scrollX - tooltipRect.width - 8;
        break;
      case 'leftTop':
        top = triggerRect.top + scrollY;
        left = triggerRect.left + scrollX - tooltipRect.width - 8;
        break;
      case 'leftBottom':
        top = triggerRect.bottom + scrollY - tooltipRect.height;
        left = triggerRect.left + scrollX - tooltipRect.width - 8;
        break;
      case 'right':
        top = triggerRect.top + scrollY + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + scrollX + 8;
        break;
      case 'rightTop':
        top = triggerRect.top + scrollY;
        left = triggerRect.right + scrollX + 8;
        break;
      case 'rightBottom':
        top = triggerRect.bottom + scrollY - tooltipRect.height;
        left = triggerRect.right + scrollX + 8;
        break;
    }

    // Keep tooltip within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < 0) left = 8;
    if (left + tooltipRect.width > viewportWidth) {
      left = viewportWidth - tooltipRect.width - 8;
    }
    if (top < scrollY) top = scrollY + 8;
    if (top + tooltipRect.height > scrollY + viewportHeight) {
      top = scrollY + viewportHeight - tooltipRect.height - 8;
    }

    setPosition({ top, left });
  };

  const handleVisibleChange = (newVisible: boolean) => {
    if (visible === undefined) {
      setInternalVisible(newVisible);
    }
    onVisibleChange?.(newVisible);
  };

  const handleMouseEnter = () => {
    if (!triggers.includes('hover')) return;

    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = undefined;
    }

    if (!isVisible) {
      enterTimeoutRef.current = setTimeout(() => {
        handleVisibleChange(true);
      }, mouseEnterDelay);
    }
  };

  const handleMouseLeave = () => {
    if (!triggers.includes('hover')) return;

    if (enterTimeoutRef.current) {
      clearTimeout(enterTimeoutRef.current);
      enterTimeoutRef.current = undefined;
    }

    if (isVisible) {
      leaveTimeoutRef.current = setTimeout(() => {
        handleVisibleChange(false);
      }, mouseLeaveDelay);
    }
  };

  const handleClick = (event: React.MouseEvent) => {
    if (!triggers.includes('click')) return;

    event.preventDefault();
    handleVisibleChange(!isVisible);
  };

  const handleFocus = () => {
    if (!triggers.includes('focus')) return;
    handleVisibleChange(true);
  };

  const handleBlur = () => {
    if (!triggers.includes('focus')) return;
    handleVisibleChange(false);
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    if (!triggers.includes('contextMenu')) return;

    event.preventDefault();
    handleVisibleChange(true);
  };

  // Don't render if no title
  if (!title) {
    return children;
  }

  const tooltipClasses = classNames(
    styles.tooltip,
    styles[placement],
    {
      [styles.visible]: isVisible,
      [styles.withArrow]: arrow,
    },
    overlayClassName
  );

  const tooltipStyle: React.CSSProperties = {
    ...overlayStyle,
    top: position.top,
    left: position.left,
    backgroundColor: color,
    zIndex: 1000,
  };

  // Clone trigger element and add event handlers
  const triggerElement = cloneElement(children, {
    ref: (node: HTMLElement) => {
      triggerRef.current = node;

      // Handle existing ref
      if (typeof children.ref === 'function') {
        children.ref(node);
      } else if (children.ref) {
        (children.ref as React.MutableRefObject<HTMLElement>).current = node;
      }
    },
    className: classNames(children.props.className, className),
    onMouseEnter: (e: React.MouseEvent) => {
      children.props.onMouseEnter?.(e);
      handleMouseEnter();
    },
    onMouseLeave: (e: React.MouseEvent) => {
      children.props.onMouseLeave?.(e);
      handleMouseLeave();
    },
    onClick: (e: React.MouseEvent) => {
      children.props.onClick?.(e);
      handleClick(e);
    },
    onFocus: (e: React.FocusEvent) => {
      children.props.onFocus?.(e);
      handleFocus();
    },
    onBlur: (e: React.FocusEvent) => {
      children.props.onBlur?.(e);
      handleBlur();
    },
    onContextMenu: (e: React.MouseEvent) => {
      children.props.onContextMenu?.(e);
      handleContextMenu(e);
    },
  });

  const tooltipElement = (
    <div
      ref={tooltipRef}
      className={tooltipClasses}
      style={tooltipStyle}
      data-testid={testId}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {arrow && <div className={styles.arrow} />}
      <div className={styles.content}>
        {title}
      </div>
    </div>
  );

  const container = getPopupContainer ? getPopupContainer() : document.body;

  return (
    <>
      {triggerElement}
      {mounted && (isVisible || !destroyTooltipOnHide) && createPortal(tooltipElement, container)}
    </>
  );
};

export default Tooltip;