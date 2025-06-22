/**
 * Footer Component - СТИЛЬНАЯ КОМПАКТНАЯ ВЕРСИЯ
 * Application footer с современным дизайном
 */
import React from 'react';
import classNames from 'classnames';
import { useLayout } from '../../../contexts/LayoutContext';
import styles from './Footer.module.css';

interface FooterProps {
  className?: string;
  'data-testid'?: string;
}

export const Footer: React.FC<FooterProps> = ({
  className,
  'data-testid': testId,
}) => {
  const { sidebarState, isMobile, isFullScreen } = useLayout();

  const footerClasses = classNames(
    styles.footer,
    {
      [styles.collapsed]: sidebarState === 'collapsed',
      [styles.hidden]: sidebarState === 'hidden',
      [styles.mobile]: isMobile,
      [styles.fullScreen]: isFullScreen,
    },
    className
  );

  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Support', href: '/support' },
    { label: 'Documentation', href: '/docs' },
  ];

  const socialLinks = [
    {
      label: 'GitHub',
      href: 'https://github.com',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
        </svg>
      ),
    },
    {
      label: 'Twitter',
      href: 'https://twitter.com',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
        </svg>
      ),
    },
    {
      label: 'LinkedIn',
      href: 'https://linkedin.com',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
          <rect x="2" y="9" width="4" height="12"/>
          <circle cx="4" cy="4" r="2"/>
        </svg>
      ),
    },
  ];

  return (
    <footer className={footerClasses} data-testid={testId}>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Left Section - Brand & Copyright */}
          <div className={styles.leftSection}>
            <div className={styles.brand}>
              <div className={styles.brandIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div className={styles.brandText}>
                <span className={styles.brandName}>Wild Market</span>
                <span className={styles.brandSub}>Capital</span>
              </div>
            </div>
            <div className={styles.copyright}>
              © {currentYear} Wild Market Capital. All rights reserved.
            </div>
          </div>

          {/* Center Section - Links & Social */}
          <div className={styles.centerSection}>
            <div className={styles.quickLinks}>
              {quickLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={styles.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className={styles.socialLinks}>
              {socialLinks.map((social) => (
                <a
                  key={social.href}
                  href={social.href}
                  className={styles.socialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Right Section - Status & Version */}
          <div className={styles.rightSection}>
            <div className={styles.status}>
              <div className={styles.statusIndicator} />
              <span className={styles.statusText}>All systems operational</span>
            </div>

            <div className={styles.version}>
              <span>Version</span>
              <span className={styles.versionNumber}>1.0.0</span>
            </div>

            <div className={styles.tech}>
              Built with React • TypeScript • FastAPI
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;