// 画像生成AI専用のプロンプト構築システム
// JSON生成指示を一切含まない、純粋な画像生成用プロンプト

import type { AIGenerationParams } from '../../types/aiFish.types';

// 芸術的コンセプトの画像生成用表現
const IMAGE_CONCEPTS = {
  elegant: 'elegant and graceful, flowing fins, refined beauty',
  mystical: 'mystical and ethereal, with otherworldly beauty and magical aura',
  powerful: 'strong and dynamic, bold proportions, commanding presence',
  cute: 'adorable and charming, round features, playful expression',
  traditional: 'traditional Japanese style, classic kingyo features, cultural authenticity',
  modern: 'contemporary artistic interpretation, stylized and sophisticated'
};

// 感情表現の画像生成用記述
const IMAGE_MOODS = {
  calm: 'serene and peaceful, gentle movement, tranquil expression',
  dynamic: 'energetic and lively, animated pose, vibrant movement',
  graceful: 'flowing and harmonious, ballet-like elegance, refined posture',
  playful: 'joyful and spirited, whimsical pose, cheerful demeanor',
  noble: 'dignified and majestic, regal bearing, aristocratic elegance',
  mysterious: 'enigmatic and intriguing, subtle shadows, captivating presence'
};

// 色調の画像生成用指示
const IMAGE_COLOR_TONES = {
  warm: 'warm color palette with reds, oranges, golds, and coral tones',
  cool: 'cool color palette with blues, teals, purples, and silver accents',
  vibrant: 'bright and saturated colors, high contrast, vivid hues',
  subtle: 'soft and muted tones, gentle pastels, understated elegance',
  monochrome: 'single color family with rich variations in shade and tone',
  rainbow: 'spectrum of harmonious colors blending beautifully across the form'
};

// スケール感の表現
const IMAGE_SCALES = {
  small: 'delicate and petite proportions',
  medium: 'balanced and harmonious proportions',
  large: 'impressive and substantial size, grand presence'
};

// 複雑さレベルの表現
const IMAGE_COMPLEXITY = {
  simple: 'clean and minimalist design, elegant simplicity',
  moderate: 'balanced detail with artistic flourishes',
  complex: 'intricate patterns and rich detail, elaborate ornamentation'
};

/**
 * DALL-E 3専用の画像生成プロンプトを構築
 */
export function buildDALLEImagePrompt(params: AIGenerationParams): string {
  const concept = IMAGE_CONCEPTS[params.concept as keyof typeof IMAGE_CONCEPTS] || IMAGE_CONCEPTS.elegant;
  const mood = IMAGE_MOODS[params.mood as keyof typeof IMAGE_MOODS] || IMAGE_MOODS.calm;
  const colorTone = IMAGE_COLOR_TONES[params.colorTone as keyof typeof IMAGE_COLOR_TONES] || IMAGE_COLOR_TONES.warm;
  const scale = IMAGE_SCALES[params.scale] || IMAGE_SCALES.medium;
  const complexity = IMAGE_COMPLEXITY[params.complexity] || IMAGE_COMPLEXITY.moderate;

  // DALL-E 3は詳細な記述を好むため、リッチな表現を使用
  let prompt = `A beautiful Japanese goldfish (kingyo) artwork featuring ${concept}. `;
  prompt += `The goldfish displays ${mood}, with ${scale} and ${complexity}. `;
  prompt += `Color scheme: ${colorTone}. `;
  
  // カスタム要求があれば追加
  if (params.customRequest && params.customRequest.trim()) {
    prompt += `Additional style: ${params.customRequest.trim()}. `;
  }

  // アニメ調+透過背景に最適化された技術指示
  prompt += `Style: anime illustration, cartoon art style, kawaii Japanese animation aesthetic, `;
  prompt += `transparent background, no background, PNG format with transparency, `;
  prompt += `bright vibrant colors, soft cel-shading, clean lineart, `;
  prompt += `inspired by traditional Japanese kingyo art and modern anime character design.`;

  return prompt;
}

/**
 * Imagen 4専用の画像生成プロンプトを構築
 */
export function buildImagenPrompt(params: AIGenerationParams): string {
  const concept = IMAGE_CONCEPTS[params.concept as keyof typeof IMAGE_CONCEPTS] || IMAGE_CONCEPTS.elegant;
  const mood = IMAGE_MOODS[params.mood as keyof typeof IMAGE_MOODS] || IMAGE_MOODS.calm;
  const colorTone = IMAGE_COLOR_TONES[params.colorTone as keyof typeof IMAGE_COLOR_TONES] || IMAGE_COLOR_TONES.warm;
  const scale = IMAGE_SCALES[params.scale] || IMAGE_SCALES.medium;
  const complexity = IMAGE_COMPLEXITY[params.complexity] || IMAGE_COMPLEXITY.moderate;

  // Imagen 4はシンプルで具体的な指示を好むため、簡潔に構築
  let prompt = `A Japanese goldfish (kingyo), ${concept}, ${mood}. `;
  prompt += `${colorTone}, ${scale}, ${complexity}. `;
  
  // カスタム要求があれば追加
  if (params.customRequest && params.customRequest.trim()) {
    prompt += `${params.customRequest.trim()}. `;
  }

  // アニメ調+透過背景に最適化された技術指示（シンプル版）
  prompt += `Anime style, cartoon illustration, transparent background, no background, vibrant colors, clean lineart.`;

  return prompt;
}

/**
 * プロンプト生成結果をデバッグ出力
 */
export function debugImagePrompt(
  aiModel: 'chatgpt' | 'gemini',
  params: AIGenerationParams,
  generatedPrompt: string
): void {
  if (import.meta.env.DEV) {
    console.group(`🎨 Image Generation Prompt - ${aiModel.toUpperCase()}`);
    console.log('📝 User Parameters:', {
      concept: params.concept,
      mood: params.mood,
      colorTone: params.colorTone,
      scale: params.scale,
      complexity: params.complexity,
      customRequest: params.customRequest || 'none'
    });
    console.log('🖼️ Generated Prompt:', generatedPrompt);
    console.log('📏 Prompt Length:', generatedPrompt.length, 'characters');
    console.groupEnd();
  }
}

/**
 * プロンプトの検証
 */
export function validateImagePrompt(prompt: string): {
  isValid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  
  // 長すぎるプロンプトの警告
  if (prompt.length > 1000) {
    warnings.push('Prompt is very long, may cause API issues');
  }
  
  // JSON関連の指示が含まれていないかチェック
  const jsonKeywords = ['json', 'JSON', 'object', 'format', 'response'];
  const containsJsonInstructions = jsonKeywords.some(keyword => 
    prompt.toLowerCase().includes(keyword.toLowerCase())
  );
  
  if (containsJsonInstructions) {
    warnings.push('Prompt contains JSON-related instructions, may confuse image generation AI');
  }
  
  // 空のプロンプトチェック
  if (prompt.trim().length < 10) {
    warnings.push('Prompt is too short, may produce generic results');
  }

  return {
    isValid: warnings.length === 0,
    warnings
  };
}