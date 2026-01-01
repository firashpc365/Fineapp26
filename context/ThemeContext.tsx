
import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = 'ocean' | 'nebula' | 'gold' | 'arctic' | 'sunset' | 'forest' | 'midnight' | 'crimson' | 'neon';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children?: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('ocean');

  useEffect(() => {
    // 1. Check local storage
    const savedTheme = localStorage.getItem('app-theme') as Theme;
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    // 2. Apply theme to Body
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};
