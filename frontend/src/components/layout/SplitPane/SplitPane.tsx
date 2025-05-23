/**
 * SplitPane Component
 * Resizable split pane layout with drag handles
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import classNames from 'classnames';
import styles from './SplitPane.module.css';

export type SplitDirection = 'horizontal' | 'vertical';

interface SplitPaneProps {
  children: [React.ReactNode, React.ReactNode];
  direction?: SplitDirection;
  defaultSize?: number | string;
  minSize?: number;
  maxSize?: number;
  disabled?: boolean;
  allowResize?: boolean;
  onResize?: (size: number) => void;
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
  className?: string;
  paneClassName?: string;
  resizerClassName?: string;
  'data-testid'?: string;
}

export const SplitPane: React.FC<SplitPaneProps> = ({
  children,
  direction = 'vertical',
  defaultSize = 300,
  minSize = 100,
  maxSize = Infinity,
  disabled = false,
  allowResize = true,
  onResize,
  onResizeStart,
  onResizeEnd,
  className,
  paneClassName,
  resizerClassName,
  'data-testid': testId,
}) => {
  const [size, setSize] = useState<number>(() => {
    if (typeof defaultSize === 'string') {
      return parseInt(defaultSize, 10) || 300;
    }
    return defaultSize;
  });

  const [isResizing, setIsResizing] = useState(false);
  const splitPaneRef = useRef<HTMLDivElement>(null);
  const startPositionRef = useRef<number>(0);
  const startSizeRef = useRef<number>(0);

  const isVertical = direction === 'vertical';

  // Handle mouse down on resizer
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (disabled || !allowResize) return;

    event.preventDefault();
    setIsResizing(true);
    startPositionRef.current = isVertical ? event.clientX : event.clientY;
    startSizeRef.current = size;
    onResizeStart?.();

    // Add global event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [disabled, allowResize, isVertical, size, onResizeStart]);

  // Handle mouse move during resize
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isResizing) return;

    const currentPosition = isVertical ? event.clientX : event.clientY;
    const delta = currentPosition - startPositionRef.current;
    const newSize = Math.max(
      minSize,
      Math.min(maxSize, startSizeRef.current + delta)
    );

    setSize(newSize);
    onResize?.(newSize);
  }, [isResizing, isVertical, minSize, maxSize, onResize]);

  // Handle mouse up to end resize
  const handleMouseUp = useCallback(() => {
    if (!isResizing) return;

    setIsResizing(false);
    onResizeEnd?.();

    // Remove global event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [isResizing, onResizeEnd, handleMouseMove]);

  // Handle touch events for mobile
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (disabled || !allowResize) return;

    const touch = event.touches[0];
    setIsResizing(true);
    startPositionRef.current = isVertical ? touch.clientX : touch.clientY;
    startSizeRef.current = size;
    onResizeStart?.();

    // Add global touch event listeners
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  }, [disabled, allowResize, isVertical, size, onResizeStart]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!isResizing) return;

    event.preventDefault();
    const touch = event.touches[0];
    const currentPosition = isVertical ? touch.clientX : touch.clientY;
    const delta = currentPosition - startPositionRef.current;
    const newSize = Math.max(
      minSize,
      Math.min(maxSize, startSizeRef.current + delta)
    );

    setSize(newSize);
    onResize?.(newSize);
  }, [isResizing, isVertical, minSize, maxSize, onResize]);

  const handleTouchEnd = useCallback(() => {
    if (!isResizing) return;

    setIsResizing(false);
    onResizeEnd?.();

    // Remove global touch event listeners
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  }, [isResizing, onResizeEnd, handleTouchMove]);

  // Cleanup event listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (disabled || !allowResize) return;

    const step = 10;
    let newSize = size;

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        newSize = Math.max(minSize, size - step);
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        newSize = Math.min(maxSize, size + step);
        break;
      case 'Home':
        newSize = minSize;
        break;
      case 'End':
        newSize = maxSize;
        break;
      default:
        return;
    }

    event.preventDefault();
    setSize(newSize);
    onResize?.(newSize);
  }, [disabled, allowResize, size, minSize, maxSize, onResize]);

  const splitPaneClasses = classNames(
    styles.splitPane,
    styles[direction],
    {
      [styles.resizing]: isResizing,
      [styles.disabled]: disabled,
    },
    className
  );

  const firstPaneClasses = classNames(
    styles.pane,
    styles.firstPane,
    paneClassName
  );

  const secondPaneClasses = classNames(
    styles.pane,
    styles.secondPane,
    paneClassName
  );

  const resizerClasses = classNames(
    styles.resizer,
    {
      [styles.disabled]: disabled || !allowResize,
      [styles.active]: isResizing,
    },
    resizerClassName
  );

  const firstPaneStyle: React.CSSProperties = {
    [isVertical ? 'width' : 'height']: `${size}px`,
  };

  const secondPaneStyle: React.CSSProperties = {
    [isVertical ? 'width' : 'height']: `calc(100% - ${size}px)`,
  };

  return (
    <div
      ref={splitPaneRef}
      className={splitPaneClasses}
      data-testid={testId}
    >
      <div className={firstPaneClasses} style={firstPaneStyle}>
        {children[0]}
      </div>

      <div
        className={resizerClasses}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onKeyDown={handleKeyDown}
        tabIndex={disabled || !allowResize ? -1 : 0}
        role="separator"
        aria-orientation={direction}
        aria-valuenow={size}
        aria-valuemin={minSize}
        aria-valuemax={maxSize}
        aria-label={`Resize ${direction} pane`}
      >
        <div className={styles.resizerHandle}>
          {isVertical ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="12" r="1"/>
              <circle cx="9" cy="5" r="1"/>
              <circle cx="9" cy="19" r="1"/>
              <circle cx="15" cy="12" r="1"/>
              <circle cx="15" cy="5" r="1"/>
              <circle cx="15" cy="19" r="1"/>
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="9" r="1"/>
              <circle cx="5" cy="9" r="1"/>
              <circle cx="19" cy="9" r="1"/>
              <circle cx="12" cy="15" r="1"/>
              <circle cx="5" cy="15" r="1"/>
              <circle cx="19" cy="15" r="1"/>
            </svg>
          )}
        </div>
      </div>

      <div className={secondPaneClasses} style={secondPaneStyle}>
        {children[1]}
      </div>
    </div>
  );
};

export default SplitPane;