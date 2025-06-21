// src/components/common/Card/Card.tsx
import React from 'react';
import classNames from 'classnames';
import styles from './Card.module.css';

interface CardMetaProps {
  avatar?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}

interface CardGridProps {
  gutter?: number | [number, number];
  hoverable?: boolean;
  className?: string;
  children: React.ReactNode;
}

interface CardProps {
  title?: React.ReactNode;
  extra?: React.ReactNode;
  bordered?: boolean;
  hoverable?: boolean;
  loading?: boolean;
  bodyStyle?: React.CSSProperties;
  headStyle?: React.CSSProperties;
  className?: string;
  size?: 'default' | 'small';
  type?: 'inner';
  cover?: React.ReactNode;
  actions?: React.ReactNode[];
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseEnter?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLDivElement>) => void;
  tabList?: Array<{
    key: string;
    tab: React.ReactNode;
    disabled?: boolean;
  }>;
  activeTabKey?: string;
  defaultActiveTabKey?: string;
  onTabChange?: (key: string) => void;
  tabBarExtraContent?: React.ReactNode;
  tabProps?: any;
  style?: React.CSSProperties;
}

const CardMeta: React.FC<CardMetaProps> = ({
  avatar,
  title,
  description,
  className,
}) => (
  <div className={classNames(styles.cardMeta, className)}>
    {avatar && <div className={styles.cardMetaAvatar}>{avatar}</div>}
    <div className={styles.cardMetaDetail}>
      {title && <div className={styles.cardMetaTitle}>{title}</div>}
      {description && <div className={styles.cardMetaDescription}>{description}</div>}
    </div>
  </div>
);

const CardGrid: React.FC<CardGridProps> = ({
  gutter = 0,
  hoverable = true,
  className,
  children,
}) => {
  const gutterValue = Array.isArray(gutter) ? gutter : [gutter, gutter];

  return (
    <div
      className={classNames(styles.cardGrid, { [styles.hoverable]: hoverable }, className)}
      style={{
        marginLeft: -gutterValue[0] / 2,
        marginRight: -gutterValue[0] / 2,
        marginTop: -gutterValue[1] / 2,
        marginBottom: -gutterValue[1] / 2,
      }}
    >
      {React.Children.map(children, child => (
        <div
          className={styles.cardGridItem}
          style={{
            paddingLeft: gutterValue[0] / 2,
            paddingRight: gutterValue[0] / 2,
            paddingTop: gutterValue[1] / 2,
            paddingBottom: gutterValue[1] / 2,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

export const Card: React.FC<CardProps> & {
  Meta: typeof CardMeta;
  Grid: typeof CardGrid;
} = ({
  title,
  extra,
  bordered = true,
  hoverable = false,
  loading = false,
  bodyStyle,
  headStyle,
  className,
  size = 'default',
  type,
  cover,
  actions,
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
  tabList,
  activeTabKey,
  defaultActiveTabKey,
  onTabChange,
  tabBarExtraContent,
  style,
}) => {
  const [internalActiveKey, setInternalActiveKey] = React.useState(
    activeTabKey || defaultActiveTabKey || (tabList?.[0]?.key)
  );

  const currentActiveKey = activeTabKey !== undefined ? activeTabKey : internalActiveKey;

  const handleTabChange = (key: string) => {
    if (activeTabKey === undefined) {
      setInternalActiveKey(key);
    }
    onTabChange?.(key);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick(e as any);
    }
  };

  if (loading) {
    return (
      <div
        className={classNames(
          styles.card,
          styles[size],
          {
            [styles.bordered]: bordered,
            [styles.loading]: loading,
            [styles.inner]: type === 'inner',
          },
          className
        )}
        style={style}
      >
        <div className={styles.cardBody} style={bodyStyle}>
          <div className={styles.loadingContent}>
            <div className={styles.loadingPlaceholder}>
              <div className={styles.loadingBar} />
              <div className={styles.loadingBar} />
              <div className={styles.loadingBar} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={classNames(
        styles.card,
        styles[size],
        {
          [styles.bordered]: bordered,
          [styles.hoverable]: hoverable,
          [styles.clickable]: !!onClick,
          [styles.inner]: type === 'inner',
        },
        className
      )}
      style={style}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onKeyDown={onClick ? handleKeyDown : undefined}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
    >
      {cover && <div className={styles.cardCover}>{cover}</div>}

      {(title || extra || tabList) && (
        <div className={styles.cardHead} style={headStyle}>
          {title && (
            <div className={styles.cardHeadWrapper}>
              <div className={styles.cardTitle}>{title}</div>
            </div>
          )}

          {tabList && (
            <div className={styles.cardTabBar}>
              <div className={styles.cardTabList}>
                {tabList.map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    className={classNames(styles.cardTab, {
                      [styles.cardTabActive]: tab.key === currentActiveKey,
                      [styles.cardTabDisabled]: tab.disabled,
                    })}
                    onClick={() => !tab.disabled && handleTabChange(tab.key)}
                    disabled={tab.disabled}
                    role="tab"
                    aria-selected={tab.key === currentActiveKey}
                    tabIndex={tab.disabled ? -1 : 0}
                  >
                    {tab.tab}
                  </button>
                ))}
              </div>
              {tabBarExtraContent && (
                <div className={styles.cardTabBarExtra}>
                  {tabBarExtraContent}
                </div>
              )}
            </div>
          )}

          {extra && <div className={styles.cardExtra}>{extra}</div>}
        </div>
      )}

      <div className={styles.cardBody} style={bodyStyle}>
        {children}
      </div>

      {actions && actions.length > 0 && (
        <ul className={styles.cardActions}>
          {actions.map((action, index) => (
            <li key={index} className={styles.cardAction}>
              {action}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

Card.Meta = CardMeta;
Card.Grid = CardGrid;
export default Card;