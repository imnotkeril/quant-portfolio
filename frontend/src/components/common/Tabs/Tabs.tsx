import React, { useState } from 'react';
import classNames from 'classnames';

interface TabItemProps {
  key: string;
  title: React.ReactNode;
  children: React.ReactNode;
  disabled?: boolean;
}

export const TabItem: React.FC<TabItemProps> = ({ children }) => {
  return <div>{children}</div>;
};

interface TabsProps {
  defaultActiveKey?: string;
  activeKey?: string;
  onChange?: (activeKey: string) => void;
  children: React.ReactElement<TabItemProps> | React.ReactElement<TabItemProps>[];
  type?: 'line' | 'card';
  size?: 'small' | 'medium' | 'large';
  centered?: boolean;
  className?: string;
  tabBarClassName?: string;
  contentClassName?: string;
}

/**
 * Tabs component following Wild Market Capital design system
 */
export const Tabs: React.FC<TabsProps> = ({
  defaultActiveKey,
  activeKey: propActiveKey,
  onChange,
  children,
  type = 'line',
  size = 'medium',
  centered = false,
  className,
  tabBarClassName,
  contentClassName
}) => {
  // Convert children to array for easier processing
  const tabItems = React.Children.toArray(children) as React.ReactElement<TabItemProps>[];

  // Initialize activeKey
  const [internalActiveKey, setInternalActiveKey] = useState<string>(() => {
    // If activeKey prop is provided, use it
    if (propActiveKey) return propActiveKey;

    // Otherwise use defaultActiveKey if provided
    if (defaultActiveKey) return defaultActiveKey;

    // Fallback to first tab if available
    return tabItems.length > 0 ? tabItems[0].key as string : '';
  });

  // Use controlled or uncontrolled activeKey
  const activeKey = propActiveKey !== undefined ? propActiveKey : internalActiveKey;

  // Handle tab change
  const handleTabChange = (key: string) => {
    if (propActiveKey === undefined) {
      setInternalActiveKey(key);
    }
    onChange?.(key);
  };

  return (
    <div className={classNames('w-full', className)}>
      {/* Tab Bar */}
      <div
        className={classNames(
          'flex mb-4 border-b border-divider',
          {
            'justify-center': centered,
            'justify-start': !centered
          },
          tabBarClassName
        )}
      >
        {tabItems.map((tab) => {
          const key = tab.key as string;
          const isActive = key === activeKey;
          const isDisabled = tab.props.disabled;

          return (
            <div
              key={key}
              className={classNames(
                'transition-all',
                {
                  // Type styles
                  'px-1 -mb-px': type === 'line',
                  'px-0.5': type === 'card',

                  // Size styles
                  'mr-6': type === 'line' && size === 'medium',
                  'mr-4': type === 'line' && size === 'small',
                  'mr-8': type === 'line' && size === 'large'
                }
              )}
            >
              <button
                className={classNames(
                  'transition-all whitespace-nowrap',
                  {
                    // Type styles - line
                    'border-b-2 pb-3': type === 'line',
                    'border-accent text-white': type === 'line' && isActive && !isDisabled,
                    'border-transparent text-neutral-gray hover:text-white hover:border-accent/50': type === 'line' && !isActive && !isDisabled,

                    // Type styles - card
                    'rounded-t px-4 py-2': type === 'card',
                    'bg-background text-white border-t border-l border-r border-divider': type === 'card' && isActive && !isDisabled,
                    'bg-transparent text-neutral-gray hover:text-white hover:bg-divider/10': type === 'card' && !isActive && !isDisabled,

                    // Disabled state
                    'opacity-50 cursor-not-allowed border-transparent': isDisabled,

                    // Size styles
                    'text-sm': size === 'small',
                    'text-base': size === 'medium',
                    'text-lg': size === 'large'
                  }
                )}
                onClick={() => !isDisabled && handleTabChange(key)}
                disabled={isDisabled}
              >
                {tab.props.title}
              </button>
            </div>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className={contentClassName}>
        {tabItems.map((tab) => {
          const key = tab.key as string;
          if (key !== activeKey) return null;
          return <div key={key}>{tab.props.children}</div>;
        })}
      </div>
    </div>
  );
};

Tabs.Item = TabItem;