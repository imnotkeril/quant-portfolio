/**
 * Tabs Component
 * Universal tabs navigation with customizable content panels
 */
import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';
import styles from './Tabs.module.css';

export type TabsType = 'line' | 'card' | 'editable-card';
export type TabsSize = 'small' | 'middle' | 'large';
export type TabsPosition = 'top' | 'right' | 'bottom' | 'left';

export interface TabItem {
  key: string;
  label: React.ReactNode;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  closable?: boolean;
  forceRender?: boolean;
}

interface TabsProps {
  items?: TabItem[];
  children?: React.ReactNode;
  activeKey?: string;
  defaultActiveKey?: string;
  onChange?: (activeKey: string) => void;
  onEdit?: (targetKey: string, action: 'add' | 'remove') => void;
  type?: TabsType;
  size?: TabsSize;
  tabPosition?: TabsPosition;
  animated?: boolean;
  centered?: boolean;
  destroyInactiveTabPane?: boolean;
  hideAdd?: boolean;
  moreIcon?: React.ReactNode;
  addIcon?: React.ReactNode;
  className?: string;
  tabBarClassName?: string;
  tabBarStyle?: React.CSSProperties;
  contentClassName?: string;
  'data-testid'?: string;
}

interface TabPaneProps {
  tab: React.ReactNode;
  key: string;
  children: React.ReactNode;
  disabled?: boolean;
  closable?: boolean;
  forceRender?: boolean;
  className?: string;
}

export const TabPane: React.FC<TabPaneProps> = ({ children }) => {
  return <>{children}</>;
};

export const Tabs: React.FC<TabsProps> = ({
  items,
  children,
  activeKey,
  defaultActiveKey,
  onChange,
  onEdit,
  type = 'line',
  size = 'middle',
  tabPosition = 'top',
  animated = true,
  centered = false,
  destroyInactiveTabPane = false,
  hideAdd = false,
  moreIcon,
  addIcon,
  className,
  tabBarClassName,
  tabBarStyle,
  contentClassName,
  'data-testid': testId,
}) => {
  const [internalActiveKey, setInternalActiveKey] = useState<string>(() => {
    if (activeKey) return activeKey;
    if (defaultActiveKey) return defaultActiveKey;
    if (items && items.length > 0) return items[0].key;
    return '';
  });

  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({});
  const tabsRef = useRef<HTMLDivElement>(null);
  const tabBarRef = useRef<HTMLDivElement>(null);

  const currentActiveKey = activeKey !== undefined ? activeKey : internalActiveKey;

  // Get tabs from items prop or children
  const tabs: TabItem[] = React.useMemo(() => {
    if (items) return items;

    // Extract tabs from children
    const childTabs: TabItem[] = [];
    React.Children.forEach(children, (child) => {
      if (React.isValidElement<TabPaneProps>(child) && child.type === TabPane) {
        childTabs.push({
          key: child.props.key || '',
          label: child.props.tab,
          children: child.props.children,
          disabled: child.props.disabled,
          closable: child.props.closable,
          forceRender: child.props.forceRender,
        });
      }
    });
    return childTabs;
  }, [items, children]);

  // Update indicator position
  useEffect(() => {
    if (type !== 'line' || !tabBarRef.current) return;

    const activeTabElement = tabBarRef.current.querySelector(
      `[data-tab-key="${currentActiveKey}"]`
    ) as HTMLElement;

    if (activeTabElement) {
      const tabBarRect = tabBarRef.current.getBoundingClientRect();
      const activeTabRect = activeTabElement.getBoundingClientRect();

      if (tabPosition === 'top' || tabPosition === 'bottom') {
        setIndicatorStyle({
          width: activeTabRect.width,
          transform: `translateX(${activeTabRect.left - tabBarRect.left}px)`,
        });
      } else {
        setIndicatorStyle({
          height: activeTabRect.height,
          transform: `translateY(${activeTabRect.top - tabBarRect.top}px)`,
        });
      }
    }
  }, [currentActiveKey, type, tabPosition, tabs]);

  const handleTabClick = (key: string, disabled?: boolean) => {
    if (disabled) return;

    if (activeKey === undefined) {
      setInternalActiveKey(key);
    }
    onChange?.(key);
  };

  const handleTabClose = (key: string, event: React.MouseEvent) => {
    event.stopPropagation();
    onEdit?.(key, 'remove');
  };

  const handleAddTab = () => {
    const newKey = `new-tab-${Date.now()}`;
    onEdit?.(newKey, 'add');
  };

  const renderTabBar = () => {
    const tabBarClasses = classNames(
      styles.tabBar,
      styles[`${tabPosition}TabBar`],
      styles[size],
      {
        [styles.centered]: centered,
        [styles.cardType]: type === 'card' || type === 'editable-card',
      },
      tabBarClassName
    );

    return (
      <div className={tabBarClasses} style={tabBarStyle} ref={tabBarRef}>
        <div className={styles.tabNav}>
          {tabs.map((tab) => {
            const isActive = tab.key === currentActiveKey;
            const tabClasses = classNames(
              styles.tab,
              {
                [styles.active]: isActive,
                [styles.disabled]: tab.disabled,
              }
            );

            return (
              <div
                key={tab.key}
                data-tab-key={tab.key}
                className={tabClasses}
                onClick={() => handleTabClick(tab.key, tab.disabled)}
                role="tab"
                aria-selected={isActive}
                aria-disabled={tab.disabled}
                tabIndex={tab.disabled ? -1 : 0}
              >
                <div className={styles.tabContent}>
                  {tab.icon && (
                    <span className={styles.tabIcon}>{tab.icon}</span>
                  )}
                  <span className={styles.tabLabel}>{tab.label}</span>
                  {tab.closable && type === 'editable-card' && (
                    <button
                      type="button"
                      className={styles.tabClose}
                      onClick={(e) => handleTabClose(tab.key, e)}
                      aria-label={`Close ${tab.label}`}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {type === 'editable-card' && !hideAdd && (
            <button
              type="button"
              className={styles.addTab}
              onClick={handleAddTab}
              aria-label="Add tab"
            >
              {addIcon || (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              )}
            </button>
          )}
        </div>

        {type === 'line' && (
          <div
            className={styles.indicator}
            style={indicatorStyle}
          />
        )}
      </div>
    );
  };

  const renderTabContent = () => {
    const activeTab = tabs.find(tab => tab.key === currentActiveKey);
    if (!activeTab) return null;

    const contentClasses = classNames(
      styles.tabContent,
      styles[`${tabPosition}Content`],
      {
        [styles.animated]: animated,
      },
      contentClassName
    );

    if (destroyInactiveTabPane) {
      return (
        <div className={contentClasses}>
          <div className={styles.tabPane} key={activeTab.key}>
            {activeTab.children}
          </div>
        </div>
      );
    }

    return (
      <div className={contentClasses}>
        {tabs.map((tab) => {
          const isActive = tab.key === currentActiveKey;
          const shouldRender = isActive || tab.forceRender;

          if (!shouldRender) return null;

          const paneClasses = classNames(
            styles.tabPane,
            {
              [styles.active]: isActive,
              [styles.hidden]: !isActive,
            }
          );

          return (
            <div key={tab.key} className={paneClasses}>
              {tab.children}
            </div>
          );
        })}
      </div>
    );
  };

  const tabsClasses = classNames(
    styles.tabs,
    styles[type],
    styles[tabPosition],
    className
  );

  return (
    <div
      ref={tabsRef}
      className={tabsClasses}
      data-testid={testId}
    >
      {renderTabBar()}
      {renderTabContent()}
    </div>
  );
};

// Add static property for compound component pattern
Tabs.TabPane = TabPane;

export default Tabs;