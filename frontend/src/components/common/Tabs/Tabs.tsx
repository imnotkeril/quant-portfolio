// src/components/common/Tabs/Tabs.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import classNames from 'classnames';
import styles from './Tabs.module.css';

export type TabsType = 'line' | 'card' | 'editable-card';
export type TabsPosition = 'top' | 'right' | 'bottom' | 'left';
export type TabsSize = 'small' | 'default' | 'large';

export interface TabPaneProps {
  tab: React.ReactNode;
  key: string;
  disabled?: boolean;
  closable?: boolean;
  closeIcon?: React.ReactNode;
  forceRender?: boolean;
  children?: React.ReactNode;
}

interface TabsProps {
  activeKey?: string;
  defaultActiveKey?: string;
  type?: TabsType;
  size?: TabsSize;
  tabPosition?: TabsPosition;
  animated?: boolean | { inkBar?: boolean; tabPane?: boolean };
  tabBarExtraContent?: React.ReactNode | { left?: React.ReactNode; right?: React.ReactNode };
  tabBarGutter?: number;
  tabBarStyle?: React.CSSProperties;
  hideAdd?: boolean;
  centered?: boolean;
  destroyInactiveTabPane?: boolean;
  onChange?: (activeKey: string) => void;
  onTabClick?: (activeKey: string, e: React.MouseEvent) => void;
  onTabScroll?: (direction: 'left' | 'right' | 'top' | 'bottom') => void;
  onEdit?: (targetKey: React.MouseEvent | React.KeyboardEvent | string, action: 'add' | 'remove') => void;
  children?: React.ReactElement<TabPaneProps> | React.ReactElement<TabPaneProps>[];
  className?: string;
  style?: React.CSSProperties;
  tabBarClassName?: string;
  addIcon?: React.ReactNode;
  removeIcon?: React.ReactNode;
  moreIcon?: React.ReactNode;
  indicator?: {
    size?: (origin: number) => number;
    align?: 'start' | 'center' | 'end';
  };
}

const TabPane: React.FC<TabPaneProps> = ({ children }) => {
  return <>{children}</>;
};

export const Tabs: React.FC<TabsProps> & { TabPane: typeof TabPane } = ({
  activeKey,
  defaultActiveKey,
  type = 'line',
  size = 'default',
  tabPosition = 'top',
  animated = true,
  tabBarExtraContent,
  tabBarGutter,
  tabBarStyle,
  hideAdd = false,
  centered = false,
  destroyInactiveTabPane = false,
  onChange,
  onTabClick,
  onTabScroll,
  onEdit,
  children,
  className,
  style,
  tabBarClassName,
  addIcon,
  removeIcon,
  moreIcon,
  indicator,
}) => {
  const [internalActiveKey, setInternalActiveKey] = useState<string>('');
  const [inkBarStyle, setInkBarStyle] = useState<React.CSSProperties>({});
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  const tabsRef = useRef<HTMLDivElement>(null);
  const tabBarRef = useRef<HTMLDivElement>(null);
  const inkBarRef = useRef<HTMLDivElement>(null);

  // Get tabs from children
  const tabs = React.Children.toArray(children).filter(
    (child): child is React.ReactElement<TabPaneProps> =>
      React.isValidElement(child) && child.type === TabPane
  );

  // Initialize active key
  useEffect(() => {
    if (!internalActiveKey && tabs.length > 0) {
      const firstEnabledTab = tabs.find(tab => !tab.props.disabled);
      if (firstEnabledTab) {
        setInternalActiveKey(defaultActiveKey || firstEnabledTab.props.key || '');
      }
    }
  }, [tabs, defaultActiveKey, internalActiveKey]);

  const currentActiveKey = activeKey !== undefined ? activeKey : internalActiveKey;

  // Update ink bar position
  const updateInkBar = useCallback(() => {
    if (!tabBarRef.current || type !== 'line') return;

    const activeTab = tabBarRef.current.querySelector(
      `[data-key="${currentActiveKey}"]`
    ) as HTMLElement;

    if (activeTab) {
      const tabBarRect = tabBarRef.current.getBoundingClientRect();
      const activeTabRect = activeTab.getBoundingClientRect();

      const isVertical = tabPosition === 'left' || tabPosition === 'right';

      if (isVertical) {
        const top = activeTabRect.top - tabBarRect.top;
        const height = activeTabRect.height;
        setInkBarStyle({
          top,
          height,
          transform: 'none',
        });
      } else {
        const left = activeTabRect.left - tabBarRect.left;
        const width = activeTabRect.width;
        setInkBarStyle({
          left,
          width,
          transform: 'none',
        });
      }
    }
  }, [currentActiveKey, tabPosition, type]);

  // Check if scrolling is needed
  const checkScrolling = useCallback(() => {
    if (!tabBarRef.current) return;

    const container = tabBarRef.current;
    const isVertical = tabPosition === 'left' || tabPosition === 'right';

    if (isVertical) {
      setShowScrollButtons(container.scrollHeight > container.clientHeight);
    } else {
      setShowScrollButtons(container.scrollWidth > container.clientWidth);
    }
  }, [tabPosition]);

  // Handle tab click
  const handleTabClick = (key: string, e: React.MouseEvent) => {
    if (activeKey === undefined) {
      setInternalActiveKey(key);
    }
    onChange?.(key);
    onTabClick?.(key, e);
  };

  // Handle tab close
  const handleTabClose = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(key, 'remove');
  };

  // Handle add tab
  const handleAddTab = (e: React.MouseEvent) => {
    onEdit?.(e, 'add');
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, key: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTabClick(key, e as any);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();

      const currentIndex = tabs.findIndex(tab => tab.props.key === currentActiveKey);
      const isVertical = tabPosition === 'left' || tabPosition === 'right';
      const isNext = (isVertical && e.key === 'ArrowDown') || (!isVertical && e.key === 'ArrowRight');

      let nextIndex = isNext ? currentIndex + 1 : currentIndex - 1;

      // Wrap around
      if (nextIndex >= tabs.length) nextIndex = 0;
      if (nextIndex < 0) nextIndex = tabs.length - 1;

      // Find next enabled tab
      let attempts = 0;
      while (tabs[nextIndex]?.props.disabled && attempts < tabs.length) {
        nextIndex = isNext ? nextIndex + 1 : nextIndex - 1;
        if (nextIndex >= tabs.length) nextIndex = 0;
        if (nextIndex < 0) nextIndex = tabs.length - 1;
        attempts++;
      }

      if (!tabs[nextIndex]?.props.disabled) {
        handleTabClick(tabs[nextIndex].props.key, e as any);
      }
    }
  };

  // Handle scroll
  const handleScroll = (direction: 'left' | 'right' | 'top' | 'bottom') => {
    if (!tabBarRef.current) return;

    const container = tabBarRef.current;
    const isVertical = tabPosition === 'left' || tabPosition === 'right';
    const scrollAmount = 100;

    if (isVertical) {
      const newScrollTop = direction === 'top'
        ? container.scrollTop - scrollAmount
        : container.scrollTop + scrollAmount;
      container.scrollTo({ top: newScrollTop, behavior: 'smooth' });
    } else {
      const newScrollLeft = direction === 'left'
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;
      container.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }

    onTabScroll?.(direction);
  };

  // Effects
  useEffect(() => {
    updateInkBar();
    checkScrolling();

    const handleResize = () => {
      updateInkBar();
      checkScrolling();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateInkBar, checkScrolling]);

  // Animation settings
  const animationConfig = typeof animated === 'boolean'
    ? { inkBar: animated, tabPane: animated }
    : { inkBar: true, tabPane: true, ...animated };

  // Render tab bar extra content
  const renderExtraContent = () => {
    if (!tabBarExtraContent) return null;

    if (React.isValidElement(tabBarExtraContent) || typeof tabBarExtraContent === 'string') {
      return <div className={styles.tabBarExtraContent}>{tabBarExtraContent}</div>;
    }

    const extraContent = tabBarExtraContent as { left?: React.ReactNode; right?: React.ReactNode };
    return (
      <>
        {extraContent.left && (
          <div className={styles.tabBarExtraLeft}>{extraContent.left}</div>
        )}
        {extraContent.right && (
          <div className={styles.tabBarExtraRight}>{extraContent.right}</div>
        )}
      </>
    );
  };

  // Render scroll buttons
  const renderScrollButtons = () => {
    if (!showScrollButtons) return null;

    const isVertical = tabPosition === 'left' || tabPosition === 'right';

    return (
      <>
        <button
          type="button"
          className={classNames(styles.scrollButton, styles.scrollPrev)}
          onClick={() => handleScroll(isVertical ? 'top' : 'left')}
          aria-label={`Scroll ${isVertical ? 'up' : 'left'}`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {isVertical ? (
              <polyline points="18,15 12,9 6,15" />
            ) : (
              <polyline points="15,18 9,12 15,6" />
            )}
          </svg>
        </button>
        <button
          type="button"
          className={classNames(styles.scrollButton, styles.scrollNext)}
          onClick={() => handleScroll(isVertical ? 'bottom' : 'right')}
          aria-label={`Scroll ${isVertical ? 'down' : 'right'}`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {isVertical ? (
              <polyline points="6,9 12,15 18,9" />
            ) : (
              <polyline points="9,18 15,12 9,6" />
            )}
          </svg>
        </button>
      </>
    );
  };

  // Render tab button
  const renderTab = (tab: React.ReactElement<TabPaneProps>) => {
    const { key, tab: tabNode, disabled, closable, closeIcon } = tab.props;
    const isActive = key === currentActiveKey;

    return (
      <div
        key={key}
        data-key={key}
        className={classNames(
          styles.tab,
          styles[size],
          {
            [styles.active]: isActive,
            [styles.disabled]: disabled,
            [styles.closable]: closable,
          }
        )}
        onClick={disabled ? undefined : (e) => handleTabClick(key, e)}
        onKeyDown={disabled ? undefined : (e) => handleKeyDown(e, key)}
        role="tab"
        tabIndex={disabled ? -1 : isActive ? 0 : -1}
        aria-selected={isActive}
        aria-disabled={disabled}
        style={tabBarGutter ? { marginRight: tabBarGutter } : undefined}
      >
        <span className={styles.tabContent}>
          {tabNode}
        </span>

        {closable && !disabled && (
          <button
            type="button"
            className={styles.tabCloseButton}
            onClick={(e) => handleTabClose(key, e)}
            aria-label={`Close ${key}`}
          >
            {closeIcon || (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            )}
          </button>
        )}
      </div>
    );
  };

  // Render tab content
  const renderTabContent = () => {
    const activeTab = tabs.find(tab => tab.props.key === currentActiveKey);

    if (!activeTab) return null;

    if (destroyInactiveTabPane) {
      return (
        <div className={styles.tabPane} key={currentActiveKey}>
          {activeTab.props.children}
        </div>
      );
    }

    return tabs.map(tab => {
      const { key, forceRender, children } = tab.props;
      const isActive = key === currentActiveKey;

      if (!isActive && !forceRender) return null;

      return (
        <div
          key={key}
          className={classNames(styles.tabPane, {
            [styles.hidden]: !isActive,
            [styles.animated]: animationConfig.tabPane,
          })}
          role="tabpanel"
          aria-hidden={!isActive}
        >
          {children}
        </div>
      );
    });
  };

  const isVertical = tabPosition === 'left' || tabPosition === 'right';

  return (
    <div
      ref={tabsRef}
      className={classNames(
        styles.tabs,
        styles[type],
        styles[size],
        styles[tabPosition],
        {
          [styles.centered]: centered,
          [styles.vertical]: isVertical,
        },
        className
      )}
      style={style}
    >
      <div
        className={classNames(styles.tabBar, tabBarClassName)}
        style={tabBarStyle}
      >
        {renderExtraContent()}

        <div className={styles.tabNav}>
          {renderScrollButtons()}

          <div
            ref={tabBarRef}
            className={styles.tabList}
            role="tablist"
          >
            {tabs.map(renderTab)}

            {type === 'line' && (
              <div
                ref={inkBarRef}
                className={classNames(styles.inkBar, {
                  [styles.animated]: animationConfig.inkBar,
                })}
                style={inkBarStyle}
              />
            )}
          </div>

          {type === 'editable-card' && !hideAdd && (
            <button
              type="button"
              className={styles.addButton}
              onClick={handleAddTab}
              aria-label="Add tab"
            >
              {addIcon || (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      <div className={styles.tabContent}>
        {renderTabContent()}
      </div>
    </div>
  );
};

Tabs.TabPane = TabPane;

export default Tabs;
export { TabPane };