import type { Theme, UserPreferences, FishDesign } from '../../types/common.types';
import type { AISelections } from '../../types/ai.types';
import { checkLocalStorageCapacity, calculateBase64Size } from './imageCompression';

const THEME_KEY = 'starry-night-theme';
const DARK_MODE_KEY = 'starry-night-dark-mode';
const USER_PREFERENCES_KEY = 'starry-night-preferences';
const AQUARIUM_FISH_KEY = 'starry-night-aquarium-fish';
const AI_FISH_IMAGES_KEY = 'starry-night-ai-fish-images';

// AI生成画像魚の型定義
export interface AIFishImage {
  id: string;
  name: string;
  imageData: string; // Base64エンコード画像データ（圧縮済み）
  type: 'ai-generated';
  aiModel: 'chatgpt' | 'gemini';
  generatedAt: string; // ISO文字列形式で保存
  selections: AISelections; // 生成時の設定
}

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

// AI生成画像魚の水槽関連機能
export const saveFishImageToAquarium = (aiFishImage: AIFishImage): void => {
  try {
    const existingImages = getAIFishImages();
    
    // 新しい画像データのサイズを計算
    const newImageSize = calculateBase64Size(aiFishImage.imageData);
    console.log(`💾 Saving AI fish image: ${aiFishImage.name} (${Math.round(newImageSize / 1024)} KB)`);
    
    // 容量チェック（新しい画像を追加する場合のみ）
    const imageIndex = existingImages.findIndex(img => img.id === aiFishImage.id);
    if (imageIndex < 0) { // 新規追加の場合
      const capacityCheck = checkLocalStorageCapacity(newImageSize);
      
      if (!capacityCheck.hasCapacity) {
        console.warn(`⚠️ Storage capacity insufficient. Current: ${Math.round(capacityCheck.currentUsage / 1024)} KB, Available: ${Math.round(capacityCheck.availableSpace / 1024)} KB, Required: ${Math.round(newImageSize / 1024)} KB`);
        
        // 容量不足の場合、古い画像を自動削除
        const freedSpace = cleanupOldImages(newImageSize);
        console.log(`🗑️ Freed ${Math.round(freedSpace / 1024)} KB by removing old images`);
        
        // 再度容量チェック
        const recheckCapacity = checkLocalStorageCapacity(newImageSize);
        if (!recheckCapacity.hasCapacity) {
          throw new Error('Insufficient storage space even after cleanup. Please manually delete some images.');
        }
      }
    }
    
    // 更新された画像リストを取得（クリーンアップ後）
    const updatedImages = getAIFishImages();
    
    // 同じIDの画像があれば更新、なければ追加
    const updatedImageIndex = updatedImages.findIndex(img => img.id === aiFishImage.id);
    if (updatedImageIndex >= 0) {
      updatedImages[updatedImageIndex] = aiFishImage;
    } else {
      updatedImages.push(aiFishImage);
    }
    
    localStorage.setItem(AI_FISH_IMAGES_KEY, JSON.stringify(updatedImages));
    console.log(`✅ Successfully saved AI fish image to aquarium`);
    
  } catch (error) {
    console.error('Error saving AI fish image to aquarium:', error);
    // エラーを再スローして上位でキャッチできるようにする
    throw error;
  }
};

export const getAIFishImages = (): AIFishImage[] => {
  try {
    const imageData = localStorage.getItem(AI_FISH_IMAGES_KEY);
    return imageData ? JSON.parse(imageData) : [];
  } catch (error) {
    console.error('Error loading AI fish images from aquarium:', error);
    return [];
  }
};

export const removeAIFishImageFromAquarium = (imageId: string): void => {
  try {
    const existingImages = getAIFishImages();
    const updatedImages = existingImages.filter(img => img.id !== imageId);
    localStorage.setItem(AI_FISH_IMAGES_KEY, JSON.stringify(updatedImages));
  } catch (error) {
    console.error('Error removing AI fish image from aquarium:', error);
  }
};

export const clearAIFishImages = (): void => {
  try {
    localStorage.removeItem(AI_FISH_IMAGES_KEY);
  } catch (error) {
    console.error('Error clearing AI fish images:', error);
  }
};

/**
 * 古いAI魚画像を削除して容量を確保する（FIFO方式）
 * @param requiredSpace - 必要な容量（バイト）
 * @returns 確保できた容量（バイト）
 */
function cleanupOldImages(requiredSpace: number): number {
  try {
    const existingImages = getAIFishImages();
    
    if (existingImages.length === 0) {
      return 0;
    }
    
    // 生成日時でソート（古い順）
    const sortedImages = existingImages.sort((a, b) => {
      const dateA = new Date(a.generatedAt).getTime();
      const dateB = new Date(b.generatedAt).getTime();
      return dateA - dateB;
    });
    
    let freedSpace = 0;
    const imagesToKeep: AIFishImage[] = [];
    
    // 古い画像から順に削除して、必要な容量を確保
    for (let i = 0; i < sortedImages.length; i++) {
      const image = sortedImages[i];
      const imageSize = calculateBase64Size(image.imageData);
      
      if (freedSpace >= requiredSpace) {
        // 必要な容量を確保できたら、残りの画像は保持
        imagesToKeep.push(...sortedImages.slice(i));
        break;
      } else {
        // まだ容量が足りない場合は削除
        freedSpace += imageSize;
        console.log(`🗑️ Removing old AI fish image: ${image.name} (${Math.round(imageSize / 1024)} KB)`);
      }
    }
    
    // 更新された画像リストを保存
    localStorage.setItem(AI_FISH_IMAGES_KEY, JSON.stringify(imagesToKeep));
    
    return freedSpace;
    
  } catch (error) {
    console.error('Error during cleanup of old images:', error);
    return 0;
  }
}

/**
 * localStorage使用状況の詳細を取得
 */
export const getStorageInfo = (): {
  totalUsage: number;
  aiFishImagesUsage: number;
  otherDataUsage: number;
  imageCount: number;
  availableSpace: number;
} => {
  try {
    // 全体使用量を計算
    let totalUsage = 0;
    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        totalUsage += localStorage[key].length;
      }
    }
    
    // AI魚画像の使用量を計算
    const aiFishImagesData = localStorage.getItem(AI_FISH_IMAGES_KEY) || '[]';
    const aiFishImagesUsage = aiFishImagesData.length;
    
    // その他のデータ使用量
    const otherDataUsage = totalUsage - aiFishImagesUsage;
    
    // 画像数
    const aiFishImages = getAIFishImages();
    const imageCount = aiFishImages.length;
    
    // 利用可能容量
    const capacityCheck = checkLocalStorageCapacity();
    
    return {
      totalUsage,
      aiFishImagesUsage,
      otherDataUsage,
      imageCount,
      availableSpace: capacityCheck.availableSpace
    };
    
  } catch (error) {
    console.error('Error getting storage info:', error);
    return {
      totalUsage: 0,
      aiFishImagesUsage: 0,
      otherDataUsage: 0,
      imageCount: 0,
      availableSpace: 0
    };
  }
};

// 水槽の全データ取得（JSON魚と画像魚の混在対応）
export const getAllAquariumData = (): { jsonFish: FishDesign[], aiFishImages: AIFishImage[] } => {
  return {
    jsonFish: getAquariumFish(),
    aiFishImages: getAIFishImages()
  };
};