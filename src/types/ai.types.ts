// AI金魚作成ツール専用の型定義

// AI生成に使用するモデル
export type AIModel = 'chatgpt' | 'gemini';

// AI生成モード（Gemini専用）
export type GenerationMode = 'initial' | 'i2i';

// AI作成のステップ
export type AIDesignStep = 'model' | 'basic' | 'details' | 'accessory' | 'generate';

// AI生成の状態
export type AIGenerationStatus = 'idle' | 'generating' | 'success' | 'error';

// AI作成のセレクション設定
export interface AISelections {
  // AI モデル選択
  model: AIModel;
  
  // 生成モード（Gemini選択時のみ有効）
  generationMode?: GenerationMode;
  
  // 基本特徴
  bodyType: 'round' | 'streamlined' | 'flat' | 'elongated';
  baseColor: 'red' | 'blue' | 'yellow' | 'white' | 'black' | 'colorful';
  size: 'small' | 'medium' | 'large';
  personality: 'calm' | 'active' | 'elegant' | 'unique';
  
  // 詳細特徴
  fins: 'standard' | 'large' | 'decorative' | 'simple';
  eyes: 'normal' | 'large' | 'small' | 'distinctive';
  pattern: 'none' | 'spotted' | 'striped' | 'polka' | 'gradient';
  
  // アクセサリー
  headAccessory: 'none' | 'crown' | 'hat' | 'ribbon';
  faceAccessory: 'none' | 'glasses' | 'sunglasses';
  neckAccessory: 'none' | 'necklace' | 'bowtie';
  
  // カスタムテキスト（補助入力）
  customText?: string;
}

// AI生成の結果
export interface AIGenerationResult {
  success: boolean;
  data?: unknown; // AI APIからのレスポンス
  error?: string;
  timestamp: Date;
}

// AI API リクエスト設定
export interface AIApiConfig {
  model: AIModel;
  apiKey?: string;
  temperature?: number;
  maxTokens?: number;
}

// セレクトボックスのオプション定義
export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

// カテゴリ別のセレクトオプション
export interface AIFeatureOptions {
  bodyTypes: SelectOption[];
  baseColors: SelectOption[];
  sizes: SelectOption[];
  personalities: SelectOption[];
  fins: SelectOption[];
  eyes: SelectOption[];
  patterns: SelectOption[];
  headAccessories: SelectOption[];
  faceAccessories: SelectOption[];
  neckAccessories: SelectOption[];
}

// AI生成の状態管理
export interface AIGenerationState {
  status: AIGenerationStatus;
  progress?: number;
  message?: string;
  error?: string;
  result?: unknown;
}

// AIモデル情報
export interface AIModelInfo {
  id: AIModel;
  name: string;
  description: string;
  features: string[];
  icon: string;
}