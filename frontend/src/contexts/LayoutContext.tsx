import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface LayoutContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  contentWidth: number;
  setContentWidth: (width: number) => void;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

const LayoutContext = createContext<LayoutContextType>({
  sidebarOpen: true,
  toggleSidebar: () => {},
  setSidebarOpen: () => {},
  contentWidth: window.innerWidth,
  setContentWidth: () => {},
  isMobile: false,
  isTablet: false,
  isDesktop: true,
});

interface LayoutProviderProps {
  children: ReactNode;
}

export const LayoutProvider: React.FC<LayoutProviderProps> = ({ children }) => {
  // Breakpoints
  const MOBILE_BREAKPOINT = 768;
  const TABLET_BREAKPOINT = 1024;

  // Initial window width
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Whether the sidebar is open
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // On mobile, default to closed
    return window.innerWidth >= MOBILE_BREAKPOINT;
  });

  // Content width (total width minus sidebar if open)
  const [contentWidth, setContentWidth] = useState(window.innerWidth);

  // Media query states
  const isMobile = windowWidth < MOBILE_BREAKPOINT;
  const isTablet = windowWidth >= MOBILE_BREAKPOINT && windowWidth < TABLET_BREAKPOINT;
  const isDesktop = windowWidth >= TABLET_BREAKPOINT;

  // Effect to handle window resize
  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      setWindowWidth(newWidth);

      // Auto-close sidebar on mobile
      if (newWidth < MOBILE_BREAKPOINT && sidebarOpen) {
        setSidebarOpen(false);
      }

      // Auto-open sidebar when transitioning from mobile to desktop
      if (newWidth >= MOBILE_BREAKPOINT && windowWidth < MOBILE_BREAKPOINT) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [windowWidth, sidebarOpen]);

  // Effect to update content width when sidebar state or window width changes
  useEffect(() => {
    // Calculate content width based on sidebar state
    // This is a simplified example; in a real app, you'd use actual sidebar width
    const SIDEBAR_WIDTH = 250;
    setContentWidth(sidebarOpen && !isMobile ? windowWidth - SIDEBAR_WIDTH : windowWidth);
  }, [sidebarOpen, windowWidth, isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const contextValue: LayoutContextType = {
    sidebarOpen,
    toggleSidebar,
    setSidebarOpen,
    contentWidth,
    setContentWidth,
    isMobile,
    isTablet,
    isDesktop,
  };

  return (
    <LayoutContext.Provider value={contextValue}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = (): LayoutContextType => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};