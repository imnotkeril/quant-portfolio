/**
 * EmptyPageState Component
 * Универсальный компонент для страниц с минимальным контентом
 * Обеспечивает одинаковую высоту всех страниц
 */
import React from 'react';
import classNames from 'classnames';

interface EmptyPageStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const EmptyPageState: React.FC<EmptyPageStateProps> = ({
  title,
  description,
  icon,
  actions,
  className,
}) => {
  return (
    <div className={classNames('page-center', className)}>
      {icon && (
        <div style={{
          fontSize: '64px',
          marginBottom: 'var(--spacing-l)',
          opacity: 0.6,
          color: 'var(--color-text-muted)'
        }}>
          {icon}
        </div>
      )}

      <h1 style={{
        fontSize: 'var(--font-size-h1)',
        fontWeight: 'var(--font-weight-bold)',
        color: 'var(--color-text-primary)',
        margin: '0 0 var(--spacing-m) 0',
        textAlign: 'center'
      }}>
        {title}
      </h1>

      {description && (
        <p style={{
          fontSize: 'var(--font-size-body)',
          color: 'var(--color-text-secondary)',
          maxWidth: '500px',
          lineHeight: 'var(--line-height-body)',
          margin: '0 0 var(--spacing-xl) 0',
          textAlign: 'center'
        }}>
          {description}
        </p>
      )}

      {actions && (
        <div style={{
          display: 'flex',
          gap: 'var(--spacing-m)',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {actions}
        </div>
      )}
    </div>
  );
};

export default EmptyPageState;