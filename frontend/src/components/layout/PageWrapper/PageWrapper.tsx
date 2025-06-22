/**
 * PageWrapper Component
 * Обеспечивает одинаковую высоту для всех страниц
 */
import React from 'react';
import classNames from 'classnames';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  center?: boolean; // Центрировать контент (для страниц типа "Not Found")
  fill?: boolean;   // Заполнить всю высоту
}

export const PageWrapper: React.FC<PageWrapperProps> = ({
  children,
  className,
  center = false,
  fill = true,
}) => {
  const wrapperClasses = classNames(
    'page-wrapper',
    {
      'page-center': center,
      'page-fill': fill,
      'page-content-full': !center && fill,
    },
    className
  );

  return (
    <div className={wrapperClasses}>
      {children}
    </div>
  );
};

export default PageWrapper;