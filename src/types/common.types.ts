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
  bodyPattern?: BodyPattern;
  accessories: Accessory[];
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

export type PartCategory = 'base' | 'dorsalFin' | 'pectoralFins' | 'tailFin' | 'eyes' | 'mouth' | 'scales' | 'pattern' | 'accessory';
export type DesignStep = 'base' | 'parts' | 'pattern' | 'accessory' | 'customize';

// 体の模様パターン
export interface BodyPattern {
  id: string;
  name: string;
  type: 'solid' | 'spotted' | 'striped' | 'polka' | 'calico' | 'gradient';
  description: string;
  colors?: string[]; // パターンに使用する色（キャリコなど）
  intensity?: number; // パターンの濃さ (0.1-1.0)
  scale?: number; // パターンのサイズ (0.5-2.0)
  direction?: 'horizontal' | 'vertical' | 'diagonal'; // 縞模様の方向
  seed?: number; // 一貫した模様生成のためのシード値
}

// アクセサリー
export interface Accessory {
  id: string;
  name: string;
  category: 'crown' | 'hat' | 'glasses' | 'ribbon' | 'bow' | 'jewelry';
  description: string;
  position: { x: number; y: number }; // 相対位置
  size: number; // サイズ倍率
  rotation?: number; // 回転角度
  color?: string; // アクセサリーの色
  visible: boolean; // 表示/非表示
}

// ランダム生成の設定
export interface RandomGenerationOptions {
  includeBase?: boolean;
  includeParts?: boolean;
  includeColors?: boolean;
  includePatterns?: boolean;
  includeAccessories?: boolean;
  keepCurrentSizes?: boolean;
}