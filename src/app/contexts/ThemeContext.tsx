import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeMode = 'light' | 'dark';
type AccentColor = 'blue' | 'green' | 'purple' | 'orange';

interface ThemeContextType {
  mode: ThemeMode;
  accentColor: AccentColor;
  setMode: (mode: ThemeMode) => void;
  setAccentColor: (color: AccentColor) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('light');
  const [accentColor, setAccentColor] = useState<AccentColor>('green');

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark');
    root.classList.add('light');

    // Set accent color CSS variables
    const accentColors = {
      blue: { primary: '59 130 246', secondary: '147 197 253' },
      green: { primary: '34 197 94', secondary: '134 239 172' },
      purple: { primary: '168 85 247', secondary: '216 180 254' },
      orange: { primary: '249 115 22', secondary: '251 146 60' },
    };

    const colors = accentColors[accentColor];
    root.style.setProperty('--accent-primary', colors.primary);
    root.style.setProperty('--accent-secondary', colors.secondary);
  }, [mode, accentColor]);

  const toggleMode = () => {
    setMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ mode, accentColor, setMode, setAccentColor, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
