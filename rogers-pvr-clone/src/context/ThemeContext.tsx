import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Appearance } from 'react-native';

interface ThemeContextType {
  isDark: boolean;
  theme: 'light' | 'dark' | 'auto';
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  colors: ThemeColors;
}

export interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  rogersRed: string;
  guideHeader: string;
  programNow: string;
  programNext: string;
}

const lightColors: ThemeColors = {
  background: '#ffffff',
  foreground: '#0a0a0a',
  card: '#ffffff',
  cardForeground: '#0a0a0a',
  primary: '#E31837', // Rogers red
  primaryForeground: '#ffffff',
  secondary: '#f4f4f5',
  secondaryForeground: '#0a0a0a',
  muted: '#f4f4f5',
  mutedForeground: '#71717a',
  accent: '#f4f4f5',
  accentForeground: '#0a0a0a',
  destructive: '#ef4444',
  destructiveForeground: '#ffffff',
  border: '#e4e4e7',
  input: '#e4e4e7',
  ring: '#E31837',
  rogersRed: '#E31837',
  guideHeader: '#1a1a2e',
  programNow: '#E31837',
  programNext: '#2d2d44',
};

const darkColors: ThemeColors = {
  background: '#0a0a0a',
  foreground: '#fafafa',
  card: '#0a0a0a',
  cardForeground: '#fafafa',
  primary: '#E31837', // Rogers red
  primaryForeground: '#ffffff',
  secondary: '#27272a',
  secondaryForeground: '#fafafa',
  muted: '#27272a',
  mutedForeground: '#a1a1aa',
  accent: '#27272a',
  accentForeground: '#fafafa',
  destructive: '#7f1d1d',
  destructiveForeground: '#ffffff',
  border: '#27272a',
  input: '#27272a',
  ring: '#E31837',
  rogersRed: '#E31837',
  guideHeader: '#1a1a2e',
  programNow: '#E31837',
  programNext: '#2d2d44',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<'light' | 'dark' | 'auto'>('dark');
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const updateTheme = () => {
      if (theme === 'auto') {
        const colorScheme = Appearance.getColorScheme();
        setIsDark(colorScheme === 'dark');
      } else {
        setIsDark(theme === 'dark');
      }
    };

    updateTheme();

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (theme === 'auto') {
        setIsDark(colorScheme === 'dark');
      }
    });

    return () => subscription.remove();
  }, [theme]);

  const setTheme = (newTheme: 'light' | 'dark' | 'auto') => {
    setThemeState(newTheme);
  };

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDark, theme, setTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
