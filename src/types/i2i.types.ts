// Image-to-Image (i2i) 生成システム専用の型定義

import type { AISelections } from './ai.types';
import type { FishDesign } from './common.types';

// i2i生成モード
export type GenerationMode = 'initial' | 'i2i';

// ベース画像の情報
export interface BaseImageData {
  id: string;
  imageData: string; // Base64エンコードされたCanvas画像
  width: number;
  height: number;
  fishDesign: FishDesign; // 生成元のFishDesign
  createdAt: Date;
}

// i2i生成用のパラメータ
export interface I2IGenerationParams {
  baseImage: BaseImageData;
  aiSelections: AISelections;
  prompt: string; // 変換用のプロンプト
  strength?: number; // 変換強度 (0.0-1.0)
  preserveStyle?: boolean; // スタイル保持フラグ
}

// i2i生成の結果
export interface I2IGenerationResult {
  success: boolean;
  data?: {
    imageData: string; // Base64エンコードされた結果画像
    originalImage: string; // 元のベース画像
    prompt: string; // 使用されたプロンプト
    generationTime: number; // 生成時間（ミリ秒）
    model: string; // 使用されたAIモデル
  };
  error?: string;
  timestamp: Date;
}

// i2i生成の状態
export type I2IGenerationStatus = 'idle' | 'generating-base' | 'generating-i2i' | 'success' | 'error';

// i2i生成の状態管理
export interface I2IGenerationState {
  mode: GenerationMode;
  status: I2IGenerationStatus;
  baseImage?: BaseImageData;
  progress?: number;
  message?: string;
  result?: I2IGenerationResult;
  error?: string;
}

// AI選択からFishDesign設定への変換マップ
export interface AIToCreateConversionMap {
  bodyType: {
    [key in AISelections['bodyType']]: {
      shape: FishDesign['base']['shape'];
      defaultColor: string;
    };
  };
  baseColor: {
    [key in AISelections['baseColor']]: {
      bodyColor: string;
      finColor: string;
    };
  };
  size: {
    [key in AISelections['size']]: {
      scale: number;
    };
  };
  fins: {
    [key in AISelections['fins']]: {
      finSize: number;
      finType: string;
    };
  };
  eyes: {
    [key in AISelections['eyes']]: {
      eyeSize: number;
      eyeType: string;
    };
  };
  pattern: {
    [key in AISelections['pattern']]: {
      patternType: FishDesign['bodyPattern']['type'];
      intensity: number;
    };
  };
}

// Canvas描画用の共通インターフェース
export interface FishCanvasConfig {
  width: number;
  height: number;
  backgroundColor?: string;
  scale?: number;
  centered?: boolean;
}

// Canvas描画結果
export interface CanvasRenderResult {
  success: boolean;
  imageData?: string; // Base64データ
  canvas?: HTMLCanvasElement;
  error?: string;
  dimensions: {
    width: number;
    height: number;
  };
}

// i2i用のプロンプト設定
export interface I2IPromptConfig {
  preserveTransparency: boolean; // 透過保持
  enhanceColors: boolean; // 色彩強化
  maintainStructure: boolean; // 構造維持
  styleTransfer: boolean; // スタイル変換
  customInstructions?: string; // カスタム指示
}

// i2i生成履歴
export interface I2IGenerationHistory {
  id: string;
  baseImageId: string;
  originalSelections: AISelections;
  finalResult: string; // Base64画像
  generationTime: number;
  createdAt: Date;
  rating?: number; // ユーザー評価（1-5）
}

// i2i設定のプリセット
export interface I2IPreset {
  id: string;
  name: string;
  description: string;
  config: I2IPromptConfig;
  strength: number;
  example?: string; // サンプル画像のBase64
}