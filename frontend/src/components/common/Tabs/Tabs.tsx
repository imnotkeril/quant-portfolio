import React, { useState, useCallback, Children, isValidElement } from 'react';
import classNames from 'classnames';
import styles from './Tabs.module.css';

// Tab Pane Props
export interface TabPaneProps {
  children: React.ReactNode;
  tab: React.ReactNode;
  key: string;
  disabled?: boolean;
  className?: string;
}

// Main Tabs Props
export interface TabsProps {
  children: React.ReactNode;
  activeKey?: string;
  defaultActiveKey?: string;
  onChange?: (activeKey: string) => void;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  type?: 'line' | 'card' | 'pill';
  position?: 'top' | 'bottom' | 'left' | 'right';
  centered?: boolean;
  animated?: boolean;
  tabBarExtraContent?: React.ReactNode;
  'data-testid'?: string;
}

// Tab Pane Component
const TabPane: React.FC<TabPaneProps> = ({ children, className }) => {
  return (
    <div className={classNames(styles.tabPane, className)}>
      {children}
    </div>
  );
};

// Main Tabs Component
const Tabs: React.FC<TabsProps> = ({
  children,
  activeKey,
  defaultActiveKey,
  onChange,
  className,
  size = 'medium',
  type = 'line',
  position = 'top',
  centered = false,
  animated = true,
  tabBarExtraContent,
  'data-testid': testId,
}) => {
  const [internalActiveKey, setInternalActiveKey] = useState<string>(() => {
    if (activeKey !== undefined) return activeKey;
    if (defaultActiveKey !== undefined) return defaultActiveKey;

    // Find first non-disabled tab
    const firstTab = Children.toArray(children).find((child) => {
      if (isValidElement(child) && child.props) {
        return !child.props.disabled;
      }
      return false;
    }) as React.ReactElement<TabPaneProps>;

    return firstTab?.key as string || '';
  });

  const currentActiveKey = activeKey !== undefined ? activeKey : internalActiveKey;

  const handleTabClick = useCallback((key: string, disabled?: boolean) => {
    if (disabled) return;

    if (activeKey === undefined) {
      setInternalActiveKey(key);
    }

    if (onChange) {
      onChange(key);
    }
  }, [activeKey, onChange]);

  const tabsClasses = classNames(
    styles.tabs,
    styles[`size-${size}`],
    styles[`type-${type}`],
    styles[`position-${position}`],
    {
      [styles.centered]: centered,
      [styles.animated]: animated,
    },
    className
  );

  const tabBarClasses = classNames(
    styles.tabBar,
    {
      [styles.vertical]: position === 'left' || position === 'right',
      [styles.horizontal]: position === 'top' || position === 'bottom',
    }
  );

  const contentClasses = classNames(
    styles.tabContent,
    {
      [styles.animated]: animated,
    }
  );

  // Extract tab information from children
  const tabs = Children.map(children, (child) => {
    if (isValidElement(child)) {
      const { key, props } = child as React.ReactElement<TabPaneProps>;
      return {
        key: key as string,
        tab: props.tab,
        disabled: props.disabled,
        children: props.children,
      };
    }
    return null;
  }).filter(Boolean);

  const activeTabContent = tabs?.find(tab => tab?.key === currentActiveKey)?.children;

  const renderTabBar = () => (
    <div className={tabBarClasses}>
      <div className={styles.tabList} role="tablist">
        {tabs?.map((tab) => {
          if (!tab) return null;

          const tabClasses = classNames(
            styles.tab,
            {
              [styles.active]: tab.key === currentActiveKey,
              [styles.disabled]: tab.disabled,
            }
          );

          return (
            <div
              key={tab.key}
              className={tabClasses}
              role="tab"
              tabIndex={tab.disabled ? -1 : 0}
              aria-selected={tab.key === currentActiveKey}
              aria-disabled={tab.disabled}
              onClick={() => handleTabClick(tab.key, tab.disabled)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleTabClick(tab.key, tab.disabled);
                }
              }}
            >
              {tab.tab}
            </div>
          );
        })}
      </div>

      {tabBarExtraContent && (
        <div className={styles.tabBarExtra}>
          {tabBarExtraContent}
        </div>
      )}
    </div>
  );

  const renderContent = () => (
    <div className={contentClasses} role="tabpanel">
      {activeTabContent}
    </div>
  );

  const isVertical = position === 'left' || position === 'right';
  const tabBarFirst = position === 'top' || position === 'left';

  return (
    <div className={tabsClasses} data-testid={testId}>
      {isVertical ? (
        <div className={styles.verticalLayout}>
          {tabBarFirst ? renderTabBar() : renderContent()}
          {tabBarFirst ? renderContent() : renderTabBar()}
        </div>
      ) : (
        <>
          {tabBarFirst ? renderTabBar() : renderContent()}
          {tabBarFirst ? renderContent() : renderTabBar()}
        </>
      )}
    </div>
  );
};

// Create compound component interface
interface TabsComponent extends React.FC<TabsProps> {
  TabPane: typeof TabPane;
}

// Create the compound component
const TabsWithSubComponents = Tabs as TabsComponent;
TabsWithSubComponents.TabPane = TabPane;

export { TabPane };
export default TabsWithSubComponents;