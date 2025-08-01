import type { Theme, UserPreferences, FishDesign } from '../../types/common.types';

const THEME_KEY = 'starry-night-theme';
const DARK_MODE_KEY = 'starry-night-dark-mode';
const USER_PREFERENCES_KEY = 'starry-night-preferences';
const AQUARIUM_FISH_KEY = 'starry-night-aquarium-fish';

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
    localStorage.removeItem(DARK_MODE_KEY);
    localStorage.removeItem(USER_PREFERENCES_KEY);
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

// ダークモード専用の保存・読み込み機能
export const getDarkMode = (): boolean => {
  try {
    const darkMode = localStorage.getItem(DARK_MODE_KEY);
    return darkMode === 'true';
  } catch (error) {
    console.error('Error reading dark mode from localStorage:', error);
    return false; // デフォルトはライトモード
  }
};

export const setDarkMode = (isDarkMode: boolean): void => {
  try {
    localStorage.setItem(DARK_MODE_KEY, isDarkMode.toString());
  } catch (error) {
    console.error('Error saving dark mode to localStorage:', error);
  }
};

// 金魚水槽関連の機能
export const saveFishToAquarium = (fishDesign: FishDesign): void => {
  try {
    const existingFish = getAquariumFish();
    
    // 同じIDの金魚があれば更新、なければ追加
    const fishIndex = existingFish.findIndex(fish => fish.id === fishDesign.id);
    if (fishIndex >= 0) {
      existingFish[fishIndex] = fishDesign;
    } else {
      existingFish.push(fishDesign);
    }
    
    localStorage.setItem(AQUARIUM_FISH_KEY, JSON.stringify(existingFish));
  } catch (error) {
    console.error('Error saving fish to aquarium:', error);
  }
};

export const getAquariumFish = (): FishDesign[] => {
  try {
    const fishData = localStorage.getItem(AQUARIUM_FISH_KEY);
    return fishData ? JSON.parse(fishData) : [];
  } catch (error) {
    console.error('Error loading fish from aquarium:', error);
    return [];
  }
};

export const removeFishFromAquarium = (fishId: string): void => {
  try {
    const existingFish = getAquariumFish();
    const updatedFish = existingFish.filter(fish => fish.id !== fishId);
    localStorage.setItem(AQUARIUM_FISH_KEY, JSON.stringify(updatedFish));
  } catch (error) {
    console.error('Error removing fish from aquarium:', error);
  }
};

export const clearAquarium = (): void => {
  try {
    localStorage.removeItem(AQUARIUM_FISH_KEY);
  } catch (error) {
    console.error('Error clearing aquarium:', error);
  }
};