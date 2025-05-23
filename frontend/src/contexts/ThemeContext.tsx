/**
 * Theme Context for managing application theme and styling
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { THEME } from '../constants/theme';
import { COLORS } from '../constants/colors';

/**
 * Theme mode options
 */
export type ThemeMode = 'dark' | 'light' | 'auto';

/**
 * Theme context interface
 */
interface ThemeContextType {
  theme: typeof THEME;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  colors: typeof COLORS;
  isDark: boolean;
  toggleMode: () => void;
}

/**
 * Theme provider props
 */
interface ThemeProviderProps {
  children: ReactNode;
  defaultMode?: ThemeMode;
}

/**
 * Create the theme context
 */
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Custom hook to use theme context
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Theme provider component
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultMode = 'dark'
}) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    // Try to get saved mode from localStorage
    const savedMode = localStorage.getItem('theme-mode') as ThemeMode;
    return savedMode || defaultMode;
  });

  const [isDark, setIsDark] = useState<boolean>(true);

  // Determine if dark mode should be active
  useEffect(() => {
    let shouldBeDark = true;

    if (mode === 'light') {
      shouldBeDark = false;
    } else if (mode === 'auto') {
      // Check system preference
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      shouldBeDark = mediaQuery.matches;

      // Listen for system theme changes
      const handleChange = (e: MediaQueryListEvent) => {
        setIsDark(e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    setIsDark(shouldBeDark);
  }, [mode]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;

    // Set CSS custom properties based on theme
    Object.entries(COLORS).forEach(([key, value]) => {
      const cssVarName = `--color-${key.toLowerCase().replace(/_/g, '-')}`;
      root.style.setProperty(cssVarName, value);
    });

    // Add theme class to body
    document.body.className = document.body.className.replace(
      /theme-(dark|light)/g,
      ''
    );
    document.body.classList.add(`theme-${isDark ? 'dark' : 'light'}`);

    // Set background color
    document.body.style.backgroundColor = COLORS.BACKGROUND;
    document.body.style.color = COLORS.TEXT_LIGHT;
  }, [isDark]);

  // Save mode to localStorage when it changes
  const handleSetMode = (newMode: ThemeMode) => {
    setMode(newMode);
    localStorage.setItem('theme-mode', newMode);
  };

  // Toggle between dark and light modes
  const toggleMode = () => {
    const newMode = mode === 'dark' ? 'light' : 'dark';
    handleSetMode(newMode);
  };

  const contextValue: ThemeContextType = {
    theme: THEME,
    mode,
    setMode: handleSetMode,
    colors: COLORS,
    isDark,
    toggleMode,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;