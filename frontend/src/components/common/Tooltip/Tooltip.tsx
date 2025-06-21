// src/components/common/Tooltip/Tooltip.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import styles from './Tooltip.module.css';

export type TooltipPlacement =
  | 'top' | 'topLeft' | 'topRight'
  | 'bottom' | 'bottomLeft' | 'bottomRight'
  | 'left' | 'leftTop' | 'leftBottom'
  | 'right' | 'rightTop' | 'rightBottom';

export type TooltipTrigger = 'hover' | 'focus' | 'click' | 'contextMenu';

interface TooltipProps {
  title: React.ReactNode;
  placement?: TooltipPlacement;
  trigger?: TooltipTrigger | TooltipTrigger[];
  visible?: boolean;
  defaultVisible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  overlayClassName?: string;
  overlayStyle?: React.CSSProperties;
  overlayInnerStyle?: React.CSSProperties;
  color?: string;
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
  getPopupContainer?: () => HTMLElement;
  autoAdjustOverflow?: boolean;
  arrowPointAtCenter?: boolean;
  destroyTooltipOnHide?: boolean;
  align?: {
    points?: string[];
    offset?: number[];
    targetOffset?: number[];
  };
  children: React.ReactElement;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  title,
  placement = 'top',
  trigger = 'hover',
  visible,
  defaultVisible = false,
  onVisibleChange,
  overlayClassName,
  overlayStyle,
  overlayInnerStyle,
  color,
  mouseEnterDelay = 100,
  mouseLeaveDelay = 100,
  getPopupContainer,
  autoAdjustOverflow = true,
  arrowPointAtCenter = false,
  destroyTooltipOnHide = false,
  align,
  children,
  className,
}) => {
  const [internalVisible, setInternalVisible] = useState(defaultVisible);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const enterTimeoutRef = useRef<NodeJS.Timeout>();
  const leaveTimeoutRef = useRef<NodeJS.Timeout>();

  const isVisible = visible !== undefined ? visible : internalVisible;
  const triggers = Array.isArray(trigger) ? trigger : [trigger];

  // Calculate position based on placement
  const calculatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    let top = 0;
    let left = 0;
    const gap = 8; // Distance between trigger and tooltip

    // Calculate base position
    switch (placement) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - gap;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'topLeft':
        top = triggerRect.top - tooltipRect.height - gap;
        left = triggerRect.left;
        break;
      case 'topRight':
        top = triggerRect.top - tooltipRect.height - gap;
        left = triggerRect.right - tooltipRect.width;
        break;
      case 'bottom':
        top = triggerRect.bottom + gap;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottomLeft':
        top = triggerRect.bottom + gap;
        left = triggerRect.left;
        break;
      case 'bottomRight':
        top = triggerRect.bottom + gap;
        left = triggerRect.right - tooltipRect.width;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - gap;
        break;
      case 'leftTop':
        top = triggerRect.top;
        left = triggerRect.left - tooltipRect.width - gap;
        break;
      case 'leftBottom':
        top = triggerRect.bottom - tooltipRect.height;
        left = triggerRect.left - tooltipRect.width - gap;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + gap;
        break;
      case 'rightTop':
        top = triggerRect.top;
        left = triggerRect.right + gap;
        break;
      case 'rightBottom':
        top = triggerRect.bottom - tooltipRect.height;
        left = triggerRect.right + gap;
        break;
    }

    // Auto adjust overflow
    if (autoAdjustOverflow) {
      if (left < 8) left = 8;
      if (left + tooltipRect.width > viewport.width - 8) {
        left = viewport.width - tooltipRect.width - 8;
      }
      if (top < 8) top = 8;
      if (top + tooltipRect.height > viewport.height - 8) {
        top = Math.max(8, triggerRect.top - tooltipRect.height - gap);
      }
    }

    // Apply custom align offset
    if (align?.offset) {
      left += align.offset[0] || 0;
      top += align.offset[1] || 0;
    }

    setPosition({ top, left });
  }, [placement, autoAdjustOverflow, align]);

  // Handle visibility change
  const handleVisibleChange = useCallback((newVisible: boolean) => {
    if (visible === undefined) {
      setInternalVisible(newVisible);
    }
    onVisibleChange?.(newVisible);
  }, [visible, onVisibleChange]);

  // Show tooltip with delay
  const showTooltip = useCallback(() => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = undefined;
    }

    if (!isVisible) {
      enterTimeoutRef.current = setTimeout(() => {
        handleVisibleChange(true);
      }, mouseEnterDelay);
    }
  }, [isVisible, mouseEnterDelay, handleVisibleChange]);

  // Hide tooltip with delay
  const hideTooltip = useCallback(() => {
    if (enterTimeoutRef.current) {
      clearTimeout(enterTimeoutRef.current);
      enterTimeoutRef.current = undefined;
    }

    if (isVisible) {
      leaveTimeoutRef.current = setTimeout(() => {
        handleVisibleChange(false);
      }, mouseLeaveDelay);
    }
  }, [isVisible, mouseLeaveDelay, handleVisibleChange]);

  // Immediate show/hide for click trigger
  const toggleTooltip = useCallback(() => {
    handleVisibleChange(!isVisible);
  }, [isVisible, handleVisibleChange]);

  // Handle context menu
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setPosition({ top: e.clientY, left: e.clientX });
    handleVisibleChange(true);
  }, [handleVisibleChange]);

  // Keyboard handlers
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isVisible) {
      handleVisibleChange(false);
    }
  }, [isVisible, handleVisibleChange]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        handleVisibleChange(false);
      }
    };

    if (isVisible && triggers.includes('click')) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible, triggers, handleVisibleChange]);

  // Calculate position when visible
  useEffect(() => {
    if (isVisible) {
      // Use setTimeout to ensure DOM is updated
      setTimeout(calculatePosition, 0);
      window.addEventListener('resize', calculatePosition);
      window.addEventListener('scroll', calculatePosition, true);

      return () => {
        window.removeEventListener('resize', calculatePosition);
        window.removeEventListener('scroll', calculatePosition, true);
      };
    }
  }, [isVisible, calculatePosition]);

  // Cleanup timeouts
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

  // Don't render if no title
  if (!title) {
    return children;
  }

  // Get container element
  const getContainer = (): HTMLElement => {
    if (getPopupContainer) {
      return getPopupContainer();
    }
    return document.body;
  };

  // Create trigger event handlers
  const triggerProps: any = {};

  if (triggers.includes('hover')) {
    triggerProps.onMouseEnter = (e: React.MouseEvent) => {
      children.props.onMouseEnter?.(e);
      showTooltip();
    };
    triggerProps.onMouseLeave = (e: React.MouseEvent) => {
      children.props.onMouseLeave?.(e);
      hideTooltip();
    };
  }

  if (triggers.includes('focus')) {
    triggerProps.onFocus = (e: React.FocusEvent) => {
      children.props.onFocus?.(e);
      showTooltip();
    };
    triggerProps.onBlur = (e: React.FocusEvent) => {
      children.props.onBlur?.(e);
      hideTooltip();
    };
  }

  if (triggers.includes('click')) {
    triggerProps.onClick = (e: React.MouseEvent) => {
      children.props.onClick?.(e);
      toggleTooltip();
    };
  }

  if (triggers.includes('contextMenu')) {
    triggerProps.onContextMenu = (e: React.MouseEvent) => {
      children.props.onContextMenu?.(e);
      handleContextMenu(e);
    };
  }

  triggerProps.onKeyDown = (e: React.KeyboardEvent) => {
    children.props.onKeyDown?.(e);
    handleKeyDown(e);
  };

  // Clone trigger element with event handlers
  const triggerElement = React.cloneElement(children, {
    ...triggerProps,
    ref: triggerRef,
    className: classNames(children.props.className, className),
  });

  const tooltipContent = (
    <div
      ref={tooltipRef}
      className={classNames(
        styles.tooltip,
        styles[placement.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)],
        {
          [styles.visible]: isVisible,
        },
        overlayClassName
      )}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: 1060,
        ...overlayStyle,
      }}
      onMouseEnter={triggers.includes('hover') ? showTooltip : undefined}
      onMouseLeave={triggers.includes('hover') ? hideTooltip : undefined}
      role="tooltip"
      aria-hidden={!isVisible}
    >
      <div
        className={styles.tooltipContent}
        style={{
          backgroundColor: color,
          ...overlayInnerStyle,
        }}
      >
        {title}
      </div>
      <div
        className={classNames(
          styles.tooltipArrow,
          styles[`arrow-${placement.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}`]
        )}
        style={color ? { borderColor: `transparent transparent ${color} transparent` } : {}}
      />
    </div>
  );

  return (
    <>
      {triggerElement}
      {isVisible && !destroyTooltipOnHide && createPortal(tooltipContent, getContainer())}
      {isVisible && destroyTooltipOnHide && createPortal(tooltipContent, getContainer())}
    </>
  );
};