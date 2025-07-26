import { useState, useEffect } from 'react';
import type { Theme } from '../types/common.types';
import { getStoredTheme, setStoredTheme } from '../services/storage/localStorage';

const defaultTheme: Theme = {
  name: 'starry-night',
  primaryColor: '#1a1a2e',
  secondaryColor: '#ff6b6b',
  backgroundColor: '#0f0f1e',
  textColor: '#eee'
};

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  useEffect(() => {
    const storedTheme = getStoredTheme();
    if (storedTheme) {
      setTheme(storedTheme);
      applyTheme(storedTheme);
    } else {
      applyTheme(defaultTheme);
    }
  }, []);

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', theme.primaryColor);
    root.style.setProperty('--secondary-color', theme.secondaryColor);
    root.style.setProperty('--background-color', theme.backgroundColor);
    root.style.setProperty('--text-color', theme.textColor);
  };

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    setStoredTheme(newTheme);
    applyTheme(newTheme);
  };

  return { theme, changeTheme };
};