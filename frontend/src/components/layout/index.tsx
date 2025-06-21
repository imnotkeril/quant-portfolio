// src/components/layout/index.tsx
/**
 * Layout Components Export Index - FIXED VERSION
 */

// PageContainer
export { PageContainer } from './PageContainer/PageContainer';
export type { PageContainerProps } from './PageContainer/PageContainer';

// Header
export { Header } from './Header/Header';
export type { HeaderProps } from './Header/Header';

// Sidebar
export { Sidebar } from './Sidebar/Sidebar';
export type { SidebarProps } from './Sidebar/Sidebar';

// Footer
export { Footer } from './Footer/Footer';
export type { FooterProps } from './Footer/Footer';

// SplitPane
export { SplitPane } from './SplitPane/SplitPane';
export type { SplitDirection, SplitPaneProps } from './SplitPane/SplitPane';

// Default exports for compatibility
export { default as PageContainerDefault } from './PageContainer/PageContainer';
export { default as HeaderDefault } from './Header/Header';
export { default as SidebarDefault } from './Sidebar/Sidebar';
export { default as FooterDefault } from './Footer/Footer';
export { default as SplitPaneDefault } from './SplitPane/SplitPane';