// AI金魚生成システム専用の型定義
// 既存のFishDesign型とは独立した一体型システム

// AI生成パラメータ（ユーザー入力）
export interface AIGenerationParams {
  // 基本コンセプト
  concept: string; // 'elegant', 'mystical', 'powerful', 'cute', 'traditional', 'modern'
  
  // 感情・雰囲気
  mood: string; // 'calm', 'dynamic', 'graceful', 'playful', 'noble', 'mysterious'
  
  // 色彩の方向性
  colorTone: string; // 'warm', 'cool', 'vibrant', 'subtle', 'monochrome', 'rainbow'
  
  // サイズ感
  scale: 'small' | 'medium' | 'large';
  
  // 複雑さ
  complexity: 'simple' | 'moderate' | 'complex';
  
  // カスタム要求（自由テキスト）
  customRequest?: string;
  
  // 創造性レベル
  creativityLevel: number; // 0.1-1.0 (低い=伝統的, 高い=革新的)
}

// Canvas描画用の座標・形状データ
export interface DrawingPoint {
  x: number;
  y: number;
}

export interface ColorGradient {
  startColor: string;
  endColor: string;
  direction: 'horizontal' | 'vertical' | 'radial' | 'diagonal';
}

export interface AIFishShape {
  // メイン体形状
  bodyPath: DrawingPoint[];
  
  // ヒレの形状（一体的に定義）
  dorsalFin?: DrawingPoint[];
  pectoralFin?: DrawingPoint[];
  tailFin?: DrawingPoint[];
  ventralFin?: DrawingPoint[];
  analFin?: DrawingPoint[];
  
  // 目の位置と形状
  leftEye: {
    center: DrawingPoint;
    radius: number;
    shape: 'circle' | 'oval' | 'almond';
  };
  rightEye: {
    center: DrawingPoint;
    radius: number;
    shape: 'circle' | 'oval' | 'almond';
  };
  
  // 口の位置と形状
  mouth: {
    center: DrawingPoint;
    width: number;
    height: number;
    shape: 'line' | 'oval' | 'curve';
  };
}

export interface AIFishColoring {
  // 基本体色
  baseColor: string | ColorGradient;
  
  // ヒレの色
  finColors: {
    dorsal?: string | ColorGradient;
    pectoral?: string | ColorGradient;
    tail?: string | ColorGradient;
    ventral?: string | ColorGradient;
    anal?: string | ColorGradient;
  };
  
  // 目の色
  eyeColor: string;
  pupilColor: string;
  
  // 特殊効果
  shimmer?: {
    color: string;
    intensity: number; // 0-1
    pattern: 'random' | 'scales' | 'stripes';
  };
  
  // 模様（オプション）
  patterns?: Array<{
    type: 'spots' | 'stripes' | 'swirls' | 'scales' | 'abstract';
    color: string;
    opacity: number;
    scale: number;
    positions: DrawingPoint[];
  }>;
}

// AI生成金魚の完全なデータ構造
export interface AIFishDesign {
  id: string;
  name: string; // AI生成された名前
  
  // 生成パラメータ（参考用）
  generationParams: AIGenerationParams;
  
  // 描画データ
  shape: AIFishShape;
  coloring: AIFishColoring;
  
  // メタデータ
  description: string; // AI生成された説明
  culturalBackground?: string; // 文化的背景の説明
  
  // 技術データ
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  
  // 生成情報
  createdAt: Date;
  aiModel: string; // 'gemini-2.5-pro' など
  generationTime: number; // 生成にかかった時間（ミリ秒）
}

// AI API レスポンス型
export interface AIFishGenerationResponse {
  success: boolean;
  data?: {
    name: string;
    description: string;
    culturalBackground?: string;
    
    // Canvas描画用の詳細データ
    drawing: {
      // 体の形状（SVGパス風の文字列、または座標配列）
      bodyPath: string | DrawingPoint[];
      
      // ヒレの形状
      fins: {
        dorsal?: string | DrawingPoint[];
        pectoral?: string | DrawingPoint[];
        tail?: string | DrawingPoint[];
        ventral?: string | DrawingPoint[];
        anal?: string | DrawingPoint[];
      };
      
      // 顔のパーツ
      eyes: {
        left: { x: number; y: number; radius: number; shape: string };
        right: { x: number; y: number; radius: number; shape: string };
      };
      
      mouth: {
        x: number;
        y: number;
        width: number;
        height: number;
        shape: string;
      };
    };
    
    // 色彩データ
    colors: {
      body: string | { type: 'gradient'; colors: string[]; direction: string };
      fins: {
        dorsal?: string;
        pectoral?: string;
        tail?: string;
        ventral?: string;
        anal?: string;
      };
      eyes: string;
      pupils: string;
      patterns?: Array<{
        type: string;
        color: string;
        opacity: number;
        positions: Array<{ x: number; y: number }>;
      }>;
    };
    
    // エフェクト
    effects?: {
      shimmer?: {
        color: string;
        intensity: number;
        pattern: string;
      };
    };
  };
  error?: string;
  timestamp: Date;
}

// 生成状態管理
export type AIFishGenerationStatus = 'idle' | 'generating' | 'success' | 'error';

export interface AIFishGenerationState {
  status: AIFishGenerationStatus;
  progress?: number;
  message?: string;
  result?: AIFishDesign;
  error?: string;
}

// キャンバス描画用のプロパティ
export interface AIFishCanvasProps {
  fishDesign?: AIFishDesign;
  width?: number;
  height?: number;
  backgroundColor?: string;
  showGrid?: boolean;
  className?: string;
}

// 描画コンテキスト用のヘルパー型
export interface DrawingContext {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  scale: number;
  offsetX: number;
  offsetY: number;
}

// エクスポート用の設定
export interface AIFishExportOptions {
  format: 'png' | 'jpg' | 'svg';
  width: number;
  height: number;
  quality?: number; // JPG用
  backgroundColor?: string;
  includeMetadata?: boolean;
}