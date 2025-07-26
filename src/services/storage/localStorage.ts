import type { Theme, UserPreferences } from '../../types/common.types';

const THEME_KEY = 'starry-night-theme';
const USER_PREFERENCES_KEY = 'starry-night-preferences';

export const getStoredTheme = (): Theme | null => {
  try {
    const storedTheme = localStorage.getItem(THEME_KEY);
    return storedTheme ? JSON.parse(storedTheme) : null;
  } catch (error) {
    console.error('Error reading theme from localStorage:', error);
    return null;
  }
};

export const setStoredTheme = (theme: Theme): void => {
  try {
    localStorage.setItem(THEME_KEY, JSON.stringify(theme));
  } catch (error) {
    console.error('Error saving theme to localStorage:', error);
  }
};

export const getUserPreferences = (): UserPreferences | null => {
  try {
    const preferences = localStorage.getItem(USER_PREFERENCES_KEY);
    return preferences ? JSON.parse(preferences) : null;
  } catch (error) {
    console.error('Error reading preferences from localStorage:', error);
    return null;
  }
};

export const setUserPreferences = (preferences: UserPreferences): void => {
  try {
    localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving preferences to localStorage:', error);
  }
};

export const clearStorage = (): void => {
  try {
    localStorage.removeItem(THEME_KEY);
    localStorage.removeItem(USER_PREFERENCES_KEY);
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};