import type { AISelections } from '../../types/ai.types';
import type { AIGenerationParams } from '../../types/aiFish.types';

// AISelections (UI選択肢) から AIGenerationParams (創造的生成用) への変換
export function convertSelectionsToGenerationParams(selections: AISelections): AIGenerationParams {
  // Body Type → Concept のマッピング
  const bodyTypeToConceptMap = {
    'round': 'cute',
    'streamlined': 'elegant', 
    'flat': 'traditional',
    'elongated': 'mystical'
  } as const;

  // Personality → Mood のマッピング
  const personalityToMoodMap = {
    'calm': 'calm',
    'active': 'dynamic',
    'elegant': 'graceful',
    'unique': 'mysterious'
  } as const;

  // BaseColor → ColorTone のマッピング
  const baseColorToToneMap = {
    'red': 'warm',
    'blue': 'cool', 
    'yellow': 'warm',
    'white': 'subtle',
    'black': 'monochrome',
    'colorful': 'rainbow'
  } as const;

  // Size → Scale のマッピング
  const sizeToScaleMap = {
    'small': 'small',
    'medium': 'medium',
    'large': 'large'
  } as const;

  // Fins の複雑さマッピング
  const finsToComplexityMap = {
    'simple': 'simple',
    'standard': 'moderate',
    'large': 'moderate',
    'decorative': 'complex'
  } as const;

  // パターンと目の組み合わせで創造性レベルを決定
  let creativityLevel = 0.6; // デフォルト

  if (selections.pattern !== 'none') {
    creativityLevel += 0.1;
  }
  
  if (selections.eyes === 'distinctive') {
    creativityLevel += 0.1;
  }

  if (selections.fins === 'decorative') {
    creativityLevel += 0.1;
  }

  // アクセサリーがある場合は創造性を上げる
  const hasAccessories = selections.headAccessory !== 'none' || 
                        selections.faceAccessory !== 'none' || 
                        selections.neckAccessory !== 'none';
  
  if (hasAccessories) {
    creativityLevel = Math.min(1.0, creativityLevel + 0.15);
  }

  // カスタムテキストのある場合は創造性を高める
  if (selections.customText && selections.customText.trim()) {
    creativityLevel = Math.min(1.0, creativityLevel + 0.1);
  }

  // 変換結果を構築
  const generationParams: AIGenerationParams = {
    concept: bodyTypeToConceptMap[selections.bodyType] || 'elegant',
    mood: personalityToMoodMap[selections.personality] || 'calm',
    colorTone: baseColorToToneMap[selections.baseColor] || 'warm',
    scale: sizeToScaleMap[selections.size] || 'medium',
    complexity: finsToComplexityMap[selections.fins] || 'moderate',
    creativityLevel: Math.max(0.1, Math.min(1.0, creativityLevel)),
    customRequest: buildCustomRequest(selections)
  };

  return generationParams;
}

// カスタムリクエストの構築
function buildCustomRequest(selections: AISelections): string {
  const requests: string[] = [];

  // パターンの要求
  if (selections.pattern !== 'none') {
    const patternDescriptions = {
      'spotted': 'beautiful spotted patterns across the body',
      'striped': 'elegant striped patterns',
      'polka': 'charming polka dot patterns',
      'gradient': 'smooth gradient color transitions'
    };
    requests.push(patternDescriptions[selections.pattern as keyof typeof patternDescriptions]);
  }

  // 目の特徴
  if (selections.eyes !== 'normal') {
    const eyeDescriptions = {
      'large': 'large, expressive eyes that convey emotion',
      'small': 'delicate, subtle eyes with refined beauty',
      'distinctive': 'unique, striking eyes with special character'
    };
    requests.push(eyeDescriptions[selections.eyes as keyof typeof eyeDescriptions]);
  }

  // アクセサリーの統合
  const accessories: string[] = [];
  
  if (selections.headAccessory !== 'none') {
    const headAccessories = {
      'crown': 'a golden crown symbolizing nobility',
      'hat': 'a stylish hat adding personality',
      'ribbon': 'a flowing ribbon creating movement'
    };
    accessories.push(headAccessories[selections.headAccessory as keyof typeof headAccessories]);
  }

  if (selections.faceAccessory !== 'none') {
    const faceAccessories = {
      'glasses': 'intellectual glasses showing wisdom',
      'sunglasses': 'cool sunglasses for modern style'
    };
    accessories.push(faceAccessories[selections.faceAccessory as keyof typeof faceAccessories]);
  }

  if (selections.neckAccessory !== 'none') {
    const neckAccessories = {
      'necklace': 'an elegant necklace adding sophistication',
      'bowtie': 'a formal bowtie for distinguished appearance'
    };
    accessories.push(neckAccessories[selections.neckAccessory as keyof typeof neckAccessories]);
  }

  if (accessories.length > 0) {
    requests.push(`Include ${accessories.join(' and ')}`);
  }

  // カスタムテキストを最後に追加
  if (selections.customText && selections.customText.trim()) {
    requests.push(selections.customText.trim());
  }

  return requests.join('. ');
}

// AIGenerationParams の検証
export function validateGenerationParams(params: AIGenerationParams): string[] {
  const errors: string[] = [];

  // 必須パラメータのチェック
  if (!params.concept) {
    errors.push('Concept is required');
  }

  if (!params.mood) {
    errors.push('Mood is required');
  }

  if (!params.colorTone) {
    errors.push('Color tone is required');
  }

  // 値の範囲チェック
  if (!['small', 'medium', 'large'].includes(params.scale)) {
    errors.push('Scale must be small, medium, or large');
  }

  if (!['simple', 'moderate', 'complex'].includes(params.complexity)) {
    errors.push('Complexity must be simple, moderate, or complex');
  }

  if (params.creativityLevel < 0.1 || params.creativityLevel > 1.0) {
    errors.push('Creativity level must be between 0.1 and 1.0');
  }

  return errors;
}

// デバッグ用の変換結果表示
export function summarizeConversion(
  original: AISelections, 
  converted: AIGenerationParams
): string {
  return `
Conversion Summary:
━━━━━━━━━━━━━━━━
Original UI Selections:
  Body: ${original.bodyType} (${original.baseColor}, ${original.size})
  Style: ${original.personality}
  Details: ${original.fins} fins, ${original.eyes} eyes, ${original.pattern} pattern
  Accessories: ${original.headAccessory}, ${original.faceAccessory}, ${original.neckAccessory}

Converted Creative Parameters:
  Concept: ${converted.concept}
  Mood: ${converted.mood}  
  Color Tone: ${converted.colorTone}
  Scale: ${converted.scale}
  Complexity: ${converted.complexity}
  Creativity Level: ${converted.creativityLevel.toFixed(2)}
  Custom Request: ${converted.customRequest || 'None'}
━━━━━━━━━━━━━━━━
  `.trim();
}

// 逆変換のための参考データ（将来的な拡張用）
export const CONVERSION_MAPPINGS = {
  bodyTypeToConceptMap: {
    'round': 'cute',
    'streamlined': 'elegant', 
    'flat': 'traditional',
    'elongated': 'mystical'
  },
  personalityToMoodMap: {
    'calm': 'calm',
    'active': 'dynamic',
    'elegant': 'graceful',
    'unique': 'mysterious'
  },
  baseColorToToneMap: {
    'red': 'warm',
    'blue': 'cool', 
    'yellow': 'warm',
    'white': 'subtle',
    'black': 'monochrome',
    'colorful': 'rainbow'
  }
} as const;