import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { ThemeMode } from '../types/common';
import { THEME } from '../constants/theme';

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  themeColors: typeof THEME.colors;
}

const defaultTheme: ThemeMode = 'dark';

const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  toggleTheme: () => {},
  setTheme: () => {},
  themeColors: THEME.colors,
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    // Try to get theme from localStorage
    const savedTheme = localStorage.getItem('theme') as ThemeMode | null;
    return savedTheme || defaultTheme;
  });

  // Effect to save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('theme', theme);

    // Add theme class to body
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${theme}`);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  // In a real implementation, we would have different color sets for light/dark themes
  // For now, we'll use the same colors for both themes
  const themeColors = THEME.colors;

  const contextValue: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme,
    themeColors,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};