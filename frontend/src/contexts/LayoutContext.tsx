/**
 * Layout Context for managing application layout state
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/**
 * Sidebar state
 */
export type SidebarState = 'expanded' | 'collapsed' | 'hidden';

/**
 * Layout breakpoint
 */
export type LayoutBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

/**
 * Layout context interface
 */
interface LayoutContextType {
  // Sidebar state
  sidebarState: SidebarState;
  setSidebarState: (state: SidebarState) => void;
  toggleSidebar: () => void;

  // Screen size and responsive behavior
  screenSize: LayoutBreakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;

  // Panel states
  rightPanelOpen: boolean;
  setRightPanelOpen: (open: boolean) => void;
  toggleRightPanel: () => void;

  // Full screen mode
  isFullScreen: boolean;
  setFullScreen: (fullScreen: boolean) => void;
  toggleFullScreen: () => void;

  // Loading states
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  // Modal management
  activeModal: string | null;
  openModal: (modalId: string) => void;
  closeModal: () => void;
}

/**
 * Layout provider props
 */
interface LayoutProviderProps {
  children: ReactNode;
}

/**
 * Create the layout context
 */
const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

/**
 * Custom hook to use layout context
 */
export const useLayout = (): LayoutContextType => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};

/**
 * Get screen size breakpoint from window width
 */
const getBreakpoint = (width: number): LayoutBreakpoint => {
  if (width < 480) return 'xs';
  if (width < 640) return 'sm';
  if (width < 768) return 'md';
  if (width < 1024) return 'lg';
  if (width < 1280) return 'xl';
  return 'xxl';
};

/**
 * Layout provider component
 */
export const LayoutProvider: React.FC<LayoutProviderProps> = ({ children }) => {
  // Get initial sidebar state from localStorage or set default based on screen size
  const [sidebarState, setSidebarState] = useState<SidebarState>(() => {
    const saved = localStorage.getItem('sidebar-state') as SidebarState;
    if (saved) return saved;

    // Default based on initial screen size
    const width = window.innerWidth;
    return width >= 1024 ? 'expanded' : 'collapsed';
  });

  const [screenSize, setScreenSize] = useState<LayoutBreakpoint>(() =>
    getBreakpoint(window.innerWidth)
  );

  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Derived responsive states
  const isMobile = screenSize === 'xs' || screenSize === 'sm';
  const isTablet = screenSize === 'md';
  const isDesktop = screenSize === 'lg' || screenSize === 'xl' || screenSize === 'xxl';

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const newBreakpoint = getBreakpoint(window.innerWidth);
      setScreenSize(newBreakpoint);

      // Auto-adjust sidebar based on screen size
      if (newBreakpoint === 'xs' || newBreakpoint === 'sm') {
        // Mobile: collapse sidebar
        if (sidebarState === 'expanded') {
          setSidebarState('collapsed');
        }
      } else if (newBreakpoint === 'md') {
        // Tablet: collapsed by default
        if (sidebarState === 'hidden') {
          setSidebarState('collapsed');
        }
      } else {
        // Desktop: expanded by default
        if (sidebarState === 'hidden') {
          setSidebarState('expanded');
        }
      }

      // Close right panel on mobile/tablet
      if ((newBreakpoint === 'xs' || newBreakpoint === 'sm') && rightPanelOpen) {
        setRightPanelOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarState, rightPanelOpen]);

  // Save sidebar state to localStorage
  const handleSetSidebarState = (state: SidebarState) => {
    setSidebarState(state);
    localStorage.setItem('sidebar-state', state);
  };

  // Toggle sidebar between expanded and collapsed
  const toggleSidebar = () => {
    if (isMobile) {
      // On mobile, toggle between collapsed and hidden
      handleSetSidebarState(sidebarState === 'hidden' ? 'collapsed' : 'hidden');
    } else {
      // On desktop, toggle between expanded and collapsed
      handleSetSidebarState(sidebarState === 'expanded' ? 'collapsed' : 'expanded');
    }
  };

  // Toggle right panel
  const toggleRightPanel = () => {
    setRightPanelOpen(!rightPanelOpen);
  };

  // Toggle full screen mode
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullScreen(true);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullScreen(false);
      });
    }
  };

  // Handle full screen change events
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  // Modal management
  const openModal = (modalId: string) => {
    setActiveModal(modalId);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setActiveModal(null);
    // Restore body scroll
    document.body.style.overflow = 'unset';
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && activeModal) {
        closeModal();
      }
    };

    if (activeModal) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [activeModal]);

  const contextValue: LayoutContextType = {
    sidebarState,
    setSidebarState: handleSetSidebarState,
    toggleSidebar,

    screenSize,
    isMobile,
    isTablet,
    isDesktop,

    rightPanelOpen,
    setRightPanelOpen,
    toggleRightPanel,

    isFullScreen,
    setFullScreen: setIsFullScreen,
    toggleFullScreen,

    isLoading,
    setLoading: setIsLoading,

    activeModal,
    openModal,
    closeModal,
  };

  return (
    <LayoutContext.Provider value={contextValue}>
      {children}
    </LayoutContext.Provider>
  );
};

export default LayoutContext;