export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface Theme {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon?: string;
  link?: string;
}

export type UserPreferences = {
  theme?: string;
  language?: string;
  autoSave?: boolean;
  [key: string]: unknown;
};

// 魚デザイナー関連の型定義
export interface FishDesign {
  id: string;
  name: string;
  base: FishBase;
  parts: SelectedParts;
  customizations: FishCustomizations;
  createdAt: Date;
}

export interface FishBase {
  id: string;
  name: string;
  shape: 'round' | 'streamlined' | 'flat' | 'elongated';
  defaultColor: string;
  size: { width: number; height: number };
  description: string;
}

export interface SelectedParts {
  dorsalFin: FishPart;      // 背ビレ
  pectoralFins: FishPart;   // 胸ビレ
  tailFin: FishPart;        // 尾ビレ
  eyes: FishPart;           // 目
  mouth: FishPart;          // 口
  scales: FishPart;         // ウロコ模様
  bodyPattern?: FishPart;   // 体の模様
}

export interface FishPart {
  id: string;
  name: string;
  category: PartCategory;
  thumbnail: string;
  description: string;
  renderData: {
    shape: string;
    size: number;
    color?: string;
  };
}

export interface FishCustomizations {
  bodyColor: string;
  finColor: string;
  eyeColor: string;
  size: number;           // 全体サイズ (0.5-2.0)
  finSize: number;        // ヒレサイズ (0.7-1.5)
  eyeSize: number;        // 目サイズ (0.5-1.5)
  eyePosition: { x: number; y: number };
  mouthPosition: { x: number; y: number };
  dorsalFinPosition: { x: number; y: number };    // 背ビレ位置
  tailFinPosition: { x: number; y: number };      // 尾ビレ位置
  pectoralFinPosition: { x: number; y: number };  // 胸ビレ位置
}

export type PartCategory = 'base' | 'dorsalFin' | 'pectoralFins' | 'tailFin' | 'eyes' | 'mouth' | 'scales' | 'pattern';
export type DesignStep = 'base' | 'parts' | 'customize';