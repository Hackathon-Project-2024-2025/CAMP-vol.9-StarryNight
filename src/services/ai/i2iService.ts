// 統合i2i (Image-to-Image) サービス
// OpenAIとGemini両方のi2i機能を統合するラッパーサービス

import type { AIModel } from '../../types/ai.types';
import type { I2IGenerationParams, I2IGenerationResult } from '../../types/i2i.types';
import { generateI2IWithOpenAI } from './openaiI2IService';
import { generateI2IWithGemini } from './geminiI2IService';

// i2i生成のメイン関数
export async function generateI2I(
  params: I2IGenerationParams,
  model: AIModel = 'gemini'
): Promise<I2IGenerationResult> {
  console.log(`Starting i2i generation with ${model} model...`);
  
  try {
    let result: I2IGenerationResult;
    
    switch (model) {
      case 'chatgpt':
        result = await generateI2IWithOpenAI(params);
        break;
      case 'gemini':
        result = await generateI2IWithGemini(params);
        break;
      default:
        throw new Error(`Unsupported i2i model: ${model}`);
    }
    
    if (result.success) {
      console.log(`i2i generation completed successfully with ${model}`);
    } else {
      console.error(`i2i generation failed with ${model}:`, result.error);
    }
    
    return result;
    
  } catch (error) {
    console.error(`i2i generation error with ${model}:`, error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'i2i生成中に不明なエラーが発生しました。';
    
    return {
      success: false,
      error: errorMessage,
      timestamp: new Date()
    };
  }
}

// バッチi2i生成（複数のパラメータセットで並行生成）
export async function generateI2IBatch(
  paramsList: I2IGenerationParams[],
  model: AIModel = 'gemini'
): Promise<I2IGenerationResult[]> {
  console.log(`Starting batch i2i generation with ${paramsList.length} items using ${model}...`);
  
  const promises = paramsList.map(params => generateI2I(params, model));
  const results = await Promise.allSettled(promises);
  
  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      console.error(`Batch i2i generation failed for item ${index}:`, result.reason);
      return {
        success: false,
        error: `バッチ生成エラー: ${result.reason}`,
        timestamp: new Date()
      };
    }
  });
}

// モデル別の能力チェック
export function getI2ICapabilities(model: AIModel): {
  supportedFormats: string[];
  maxResolution: { width: number; height: number };
  supportsMask: boolean;
  supportsStrength: boolean;
  supportsStylePreservation: boolean;
} {
  switch (model) {
    case 'chatgpt':
      return {
        supportedFormats: ['png'],
        maxResolution: { width: 1024, height: 1024 },
        supportsMask: true,
        supportsStrength: false, // OpenAIはmaskベース
        supportsStylePreservation: true
      };
    case 'gemini':
      return {
        supportedFormats: ['png', 'jpg'],
        maxResolution: { width: 1024, height: 1024 },
        supportsMask: false, // Geminiは全体変換
        supportsStrength: true,
        supportsStylePreservation: true
      };
    default:
      return {
        supportedFormats: [],
        maxResolution: { width: 0, height: 0 },
        supportsMask: false,
        supportsStrength: false,
        supportsStylePreservation: false
      };
  }
}

// i2i生成のプリフライトチェック
export function validateI2IParams(
  params: I2IGenerationParams,
  model: AIModel
): { isValid: boolean; warnings: string[]; errors: string[] } {
  const warnings: string[] = [];
  const errors: string[] = [];
  const capabilities = getI2ICapabilities(model);
  
  // 画像形式チェック
  const imageFormat = params.baseImage.imageData.match(/data:image\/([a-z]+);base64,/)?.[1];
  if (imageFormat && !capabilities.supportedFormats.includes(imageFormat)) {
    warnings.push(`${model}では${imageFormat}形式がサポートされていない可能性があります`);
  }
  
  // 解像度チェック
  if (params.baseImage.width > capabilities.maxResolution.width ||
      params.baseImage.height > capabilities.maxResolution.height) {
    warnings.push(
      `画像サイズ(${params.baseImage.width}x${params.baseImage.height})が` +
      `最大解像度(${capabilities.maxResolution.width}x${capabilities.maxResolution.height})を超えています`
    );
  }
  
  // 強度パラメータチェック
  if (params.strength !== undefined && !capabilities.supportsStrength) {
    warnings.push(`${model}では変換強度の調整がサポートされていません`);
  }
  
  // 必須フィールドチェック
  if (!params.baseImage.imageData) {
    errors.push('ベース画像が指定されていません');
  }
  
  if (!params.aiSelections) {
    errors.push('AI設定が指定されていません');
  }
  
  if (!params.prompt) {
    errors.push('プロンプトが指定されていません');
  }
  
  return {
    isValid: errors.length === 0,
    warnings,
    errors
  };
}

// i2i生成結果の品質評価
export function evaluateI2IResult(result: I2IGenerationResult): {
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  feedback: string[];
  score: number;
} {
  const feedback: string[] = [];
  let score = 0;
  
  if (!result.success) {
    return {
      quality: 'poor',
      feedback: ['生成に失敗しました'],
      score: 0
    };
  }
  
  if (!result.data?.imageData) {
    return {
      quality: 'poor',
      feedback: ['画像データが取得できませんでした'],
      score: 0
    };
  }
  
  // 生成時間による評価
  if (result.data.generationTime < 10000) {
    score += 20;
    feedback.push('高速生成');
  } else if (result.data.generationTime < 30000) {
    score += 10;
    feedback.push('標準的な生成時間');
  } else {
    feedback.push('生成に時間がかかりました');
  }
  
  // 画像データサイズによる簡易品質評価
  const imageDataSize = result.data.imageData.length;
  if (imageDataSize > 100000) {
    score += 30;
    feedback.push('高詳細度');
  } else if (imageDataSize > 50000) {
    score += 20;
    feedback.push('標準的な詳細度');
  } else {
    score += 10;
    feedback.push('低詳細度');
  }
  
  // プロンプトの反映度（簡易評価）
  if (result.data.prompt && result.data.prompt.length > 100) {
    score += 20;
    feedback.push('詳細なプロンプト指示');
  } else {
    score += 10;
    feedback.push('シンプルなプロンプト指示');
  }
  
  // モデル特性による調整
  if (result.data.model?.includes('gemini')) {
    score += 10;
    feedback.push('創造性重視モデル');
  } else if (result.data.model?.includes('openai')) {
    score += 10;
    feedback.push('精度重視モデル');
  }
  
  // 品質判定
  let quality: 'excellent' | 'good' | 'fair' | 'poor';
  if (score >= 70) {
    quality = 'excellent';
  } else if (score >= 50) {
    quality = 'good';
  } else if (score >= 30) {
    quality = 'fair';
  } else {
    quality = 'poor';
  }
  
  return { quality, feedback, score };
}

// i2i生成履歴の管理
export class I2IHistoryManager {
  private static readonly STORAGE_KEY = 'i2i-generation-history';
  private static readonly MAX_HISTORY_SIZE = 50;
  
  static save(result: I2IGenerationResult, params: I2IGenerationParams): void {
    try {
      const history = this.load();
      const historyItem = {
        id: `i2i-${Date.now()}`,
        result,
        params,
        createdAt: new Date().toISOString()
      };
      
      history.unshift(historyItem);
      
      // 履歴サイズ制限
      if (history.length > this.MAX_HISTORY_SIZE) {
        history.splice(this.MAX_HISTORY_SIZE);
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save i2i history:', error);
    }
  }
  
  static load(): Record<string, unknown>[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load i2i history:', error);
      return [];
    }
  }
  
  static clear(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear i2i history:', error);
    }
  }
  
  static getSuccessRate(): number {
    const history = this.load();
    if (history.length === 0) return 0;
    
    const successCount = history.filter(item => item.result?.success).length;
    return successCount / history.length;
  }
}

export default {
  generateI2I,
  generateI2IBatch,
  getI2ICapabilities,
  validateI2IParams,
  evaluateI2IResult,
  I2IHistoryManager
};