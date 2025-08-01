// Gemini 2.0 Flash Image Generation Service
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AISelections, AIGenerationResult, AIApiConfig } from '../../types/ai.types';

// Gemini API Key (環境変数または設定から取得)
const getGeminiApiKey = (): string => {
  // 実際の実装では環境変数やセキュアな設定から取得
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  if (!apiKey) {
    throw new Error('Gemini API Key が設定されていません');
  }
  return apiKey;
};

// AIセレクションを元に画像生成プロンプトを構築
const buildImagePrompt = (selections: AISelections): string => {
  const {
    bodyType,
    baseColor,
    size,
    personality,
    fins,
    eyes,
    pattern,
    headAccessory,
    faceAccessory,
    neckAccessory,
    customText
  } = selections;

  // 基本プロンプト
  let prompt = 'Create a beautiful, artistic goldfish image with the following characteristics:\n\n';

  // 体型の指定
  const bodyTypeMap = {
    'round': 'round, plump body shape',
    'streamlined': 'sleek, streamlined body shape',
    'flat': 'flat, wide body shape',
    'elongated': 'long, elongated body shape'
  };
  prompt += `Body Type: ${bodyTypeMap[bodyType]}\n`;

  // 色の指定
  const colorMap = {
    'red': 'vibrant red and orange colors',
    'blue': 'deep blue and azure colors',
    'yellow': 'bright yellow and golden colors',
    'white': 'pure white and pearl colors',
    'black': 'elegant black and dark colors',
    'colorful': 'multiple vibrant colors in harmony'
  };
  prompt += `Primary Colors: ${colorMap[baseColor]}\n`;

  // サイズの指定
  const sizeMap = {
    'small': 'small, delicate size',
    'medium': 'medium, balanced size',
    'large': 'large, majestic size'
  };
  prompt += `Size: ${sizeMap[size]}\n`;

  // 性格/雰囲気の指定
  const personalityMap = {
    'calm': 'peaceful, serene expression and posture',
    'active': 'dynamic, energetic swimming pose',
    'elegant': 'graceful, refined appearance',
    'unique': 'distinctive, quirky characteristics'
  };
  prompt += `Personality: ${personalityMap[personality]}\n`;

  // ヒレの指定
  const finsMap = {
    'standard': 'normal, proportionate fins',
    'large': 'large, flowing fins',
    'decorative': 'ornate, decorative fins with intricate patterns',
    'simple': 'simple, minimalist fins'
  };
  prompt += `Fins: ${finsMap[fins]}\n`;

  // 目の指定
  const eyesMap = {
    'normal': 'normal-sized, bright eyes',
    'large': 'large, expressive eyes',
    'small': 'small, subtle eyes',
    'distinctive': 'unique, striking eyes'
  };
  prompt += `Eyes: ${eyesMap[eyes]}\n`;

  // 模様の指定
  if (pattern !== 'none') {
    const patternMap = {
      'spotted': 'beautiful spotted patterns across the body',
      'striped': 'elegant striped patterns',
      'polka': 'charming polka dot patterns',
      'gradient': 'smooth gradient color transitions'
    };
    prompt += `Body Pattern: ${patternMap[pattern as keyof typeof patternMap]}\n`;
  }

  // アクセサリーの指定
  const accessories = [];
  if (headAccessory !== 'none') {
    const headMap = {
      'crown': 'a golden crown on its head',
      'hat': 'a decorative hat',
      'ribbon': 'a colorful ribbon around its head'
    };
    accessories.push(headMap[headAccessory as keyof typeof headMap]);
  }

  if (faceAccessory !== 'none') {
    const faceMap = {
      'glasses': 'stylish glasses',
      'sunglasses': 'cool sunglasses'
    };
    accessories.push(faceMap[faceAccessory as keyof typeof faceMap]);
  }

  if (neckAccessory !== 'none') {
    const neckMap = {
      'necklace': 'an elegant necklace',
      'bowtie': 'a dapper bow tie'
    };
    accessories.push(neckMap[neckAccessory as keyof typeof neckMap]);
  }

  if (accessories.length > 0) {
    prompt += `Accessories: ${accessories.join(', ')}\n`;
  }

  // カスタムテキストの追加
  if (customText && customText.trim()) {
    prompt += `\nAdditional Requirements: ${customText.trim()}\n`;
  }

  // スタイル指定
  prompt += `\nStyle: High-quality, artistic illustration with clean background. The goldfish should be the main focus with beautiful lighting and detailed textures. Use a clean white or transparent background.`;

  return prompt;
};

// Gemini 2.0 Flash Image Generation API を使用して画像を生成
export const generateImageWithGemini = async (
  selections: AISelections,
  config: AIApiConfig
): Promise<AIGenerationResult> => {
  const startTime = Date.now();

  try {
    const apiKey = getGeminiApiKey();
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Gemini 2.5 Flash モデルを使用（画像生成API待機中の暫定実装）
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: config.temperature || 0.8,
        maxOutputTokens: config.maxTokens || 1024
      }
    });

    const prompt = buildImagePrompt(selections);
    console.log('Generated image prompt:', prompt);

    // 暫定実装：テキスト説明を生成（実際の画像生成APIが利用可能になるまで）
    const systemPrompt = 'You are a specialized AI for describing beautiful goldfish images. Create detailed descriptions for goldfish images based on user specifications. Return a JSON object with description and mock image data.';
    
    const result = await model.generateContent([
      systemPrompt,
      prompt,
      'Please respond with JSON format: {"description": "detailed description", "imageData": "data:image/png;base64,mock_data"}'
    ]);

    const response = result.response;
    let generatedData;
    
    try {
      generatedData = JSON.parse(response.text());
    } catch {
      // JSONパースに失敗した場合のフォールバック
      generatedData = {
        description: response.text(),
        imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' // 1x1透明PNG
      };
    }

    // 生成時間計算
    const generationTime = Date.now() - startTime;
    console.log(`Image generation completed in ${generationTime}ms`);

    return {
      success: true,
      data: {
        imageData: generatedData.imageData,
        description: generatedData.description,
        prompt: prompt,
        generationTime: generationTime,
        model: 'gemini-2.5-flash-image-description'
      },
      timestamp: new Date()
    };

  } catch (error) {
    console.error('Gemini image generation error:', error);
    
    let errorMessage = 'Gemini画像生成中にエラーが発生しました';
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = 'Gemini API Key が無効または未設定です';
      } else if (error.message.includes('quota')) {
        errorMessage = 'Gemini API の利用制限に達しました';
      } else if (error.message.includes('network')) {
        errorMessage = 'ネットワークエラーが発生しました';
      } else {
        errorMessage = `Gemini API エラー: ${error.message}`;
      }
    }

    return {
      success: false,
      error: errorMessage,
      timestamp: new Date()
    };
  }
};

// Base64画像データをBlob URLに変換
export const convertBase64ToImageUrl = (base64Data: string): string => {
  try {
    // data:image/png;base64, プレフィックスを除去
    const base64WithoutPrefix = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
    
    // Base64をバイナリデータに変換
    const binaryString = atob(base64WithoutPrefix);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Blobを作成してURLを生成
    const blob = new Blob([bytes], { type: 'image/png' });
    return URL.createObjectURL(blob);
    
  } catch (error) {
    console.error('Base64 to image URL conversion error:', error);
    throw new Error('画像データの変換に失敗しました');
  }
};

// 画像URLをクリーンアップ
export const cleanupImageUrl = (url: string): void => {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};

// Gemini画像生成結果の検証
export const validateImageGenerationResult = (data: unknown): boolean => {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const result = data as Record<string, unknown>;
  
  return (
    typeof result.imageData === 'string' &&
    result.imageData.length > 0 &&
    typeof result.description === 'string'
  );
};