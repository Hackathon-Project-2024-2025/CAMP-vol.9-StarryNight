// Gemini i2i (Image-to-Image) サービス
// Google Vertex AI Imagen 4を使用したi2i生成機能

// import type { AIGenerationResult } from '../../types/ai.types';
import type { I2IGenerationParams, I2IGenerationResult } from '../../types/i2i.types';

// Vertex AI APIを使用してImagen 4にアクセス
const VERTEX_AI_BASE_URL = 'https://us-central1-aiplatform.googleapis.com/v1';
const DEFAULT_MODEL = 'imagegeneration@006'; // Imagen 4モデル

// Imagen 4 i2i APIリクエスト用の型定義
interface ImagenI2IRequest {
  instances: Array<{
    prompt: string;
    image?: {
      bytesBase64Encoded: string;
    };
    mask?: {
      image: {
        bytesBase64Encoded: string;
      };
    };
    parameters?: {
      sampleCount?: number;
      aspectRatio?: string;
      safetyFilterLevel?: string;
      personGeneration?: string;
      // i2i専用パラメータ
      seed?: number;
      guidanceScale?: number;
      editConfig?: {
        editMode?: string;
        maskMode?: string;
        productSetId?: string;
        negativePrompt?: string;
      };
    };
  }>;
}

// Imagen 4 APIレスポンス用の型定義
interface ImagenI2IResponse {
  predictions: Array<{
    bytesBase64Encoded: string;
    mimeType: string;
  }>;
}

// エラー処理用のカスタムエラークラス
export class GeminiI2IError extends Error {
  public status?: number;
  public code?: string;
  
  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'GeminiI2IError';
    this.status = status;
    this.code = code;
  }
}

// Google Cloud認証情報の取得
function getGoogleCloudAuth(): { accessToken: string; projectId: string } {
  // アクセストークンの取得
  const accessToken = import.meta.env?.VITE_GOOGLE_ACCESS_TOKEN || '';
  if (!accessToken) {
    throw new GeminiI2IError('Google Cloud access token is not configured. Please set VITE_GOOGLE_ACCESS_TOKEN environment variable.');
  }
  
  // プロジェクトIDの取得
  const projectId = import.meta.env?.VITE_GOOGLE_CLOUD_PROJECT_ID || '';
  if (!projectId) {
    throw new GeminiI2IError('Google Cloud project ID is not configured. Please set VITE_GOOGLE_CLOUD_PROJECT_ID environment variable.');
  }
  
  return { accessToken, projectId };
}

// i2i専用プロンプトの構築
function buildI2IPrompt(params: I2IGenerationParams): string {
  // 最優先指示：右向きと透過背景
  const directionInstruction = `MANDATORY ORIENTATION: The goldfish MUST be facing RIGHT with head pointing to the RIGHT side and tail on the LEFT side. This is CRITICAL for aquarium animation compatibility. `;
  const backgroundInstruction = `MANDATORY BACKGROUND: The goldfish MUST have a completely transparent background (alpha channel = 0 for background pixels). Generate ONLY the goldfish with transparent background, no water, no aquarium, no background elements whatsoever. The background must be fully transparent PNG format. `;
  
  const baseImageInfo = `Based on the provided goldfish image, `;
  const aiInstructions = generateI2IInstructions(params.aiSelections);
  const stylePreservation = params.preserveStyle 
    ? `Maintain the original artistic style and composition. ` 
    : `You may modify the artistic style while keeping the basic goldfish structure. `;
  
  const strengthInstruction = getStrengthInstruction(params.strength || 0.7);
  
  const finalPrompt = `${directionInstruction}${backgroundInstruction}${baseImageInfo}${aiInstructions}${stylePreservation}${strengthInstruction}High quality, detailed, vibrant colors.`;
  
  console.log('【Gemini i2i送信プロンプト】:', finalPrompt);
  return finalPrompt;
}

// AI選択からi2i指示を生成
function generateI2IInstructions(aiSelections: Record<string, unknown>): string {
  let instructions = '';
  
  // 体型の指示
  if (aiSelections.bodyType) {
    const bodyInstructions = {
      round: 'modify the body to be more round and plump, ',
      streamlined: 'modify the body to be more streamlined and torpedo-shaped, ',
      flat: 'modify the body to be flatter and more disc-like, ',
      elongated: 'modify the body to be more elongated and eel-like, '
    };
    instructions += bodyInstructions[aiSelections.bodyType as keyof typeof bodyInstructions] || '';
  }
  
  // 色の指示
  if (aiSelections.baseColor) {
    const colorInstructions = {
      red: 'change the main color to vibrant red, ',
      blue: 'change the main color to deep blue, ',
      yellow: 'change the main color to bright golden yellow, ',
      white: 'change the main color to pure white, ',
      black: 'change the main color to deep black, ',
      colorful: 'make it multicolored with rainbow-like patterns, '
    };
    instructions += colorInstructions[aiSelections.baseColor as keyof typeof colorInstructions] || '';
  }
  
  // サイズの指示
  if (aiSelections.size) {
    const sizeInstructions = {
      small: 'make it appear smaller and more delicate, ',
      medium: 'keep the size moderate, ',
      large: 'make it appear larger and more imposing, '
    };
    instructions += sizeInstructions[aiSelections.size as keyof typeof sizeInstructions] || '';
  }
  
  // パーソナリティの指示
  if (aiSelections.personality) {
    const personalityInstructions = {
      calm: 'give it a peaceful and serene expression, ',
      active: 'make it look energetic and dynamic, ',
      elegant: 'enhance its graceful and refined appearance, ',
      unique: 'add distinctive and unusual features, '
    };
    instructions += personalityInstructions[aiSelections.personality as keyof typeof personalityInstructions] || '';
  }
  
  // ヒレの指示
  if (aiSelections.fins) {
    const finInstructions = {
      standard: 'keep the fins in standard proportions, ',
      large: 'make the fins larger and more prominent, ',
      decorative: 'make the fins more decorative and ornate, ',
      simple: 'simplify the fin design, '
    };
    instructions += finInstructions[aiSelections.fins as keyof typeof finInstructions] || '';
  }
  
  // 目の指示
  if (aiSelections.eyes) {
    const eyeInstructions = {
      normal: 'keep the eyes at normal size, ',
      large: 'make the eyes larger and more expressive, ',
      small: 'make the eyes smaller and more subtle, ',
      distinctive: 'give it distinctive eye features, '
    };
    instructions += eyeInstructions[aiSelections.eyes as keyof typeof eyeInstructions] || '';
  }
  
  // 模様の指示
  if (aiSelections.pattern && aiSelections.pattern !== 'none') {
    const patternInstructions = {
      spotted: 'add spotted patterns to the body, ',
      striped: 'add striped patterns to the body, ',
      polka: 'add polka dot patterns to the body, ',
      gradient: 'add gradient color patterns to the body, '
    };
    instructions += patternInstructions[aiSelections.pattern as keyof typeof patternInstructions] || '';
  }
  
  // カスタムテキストがある場合は追加
  if (aiSelections.customText) {
    instructions += `${aiSelections.customText}, `;
  }
  
  return instructions;
}

// 変換強度に応じた指示を生成
function getStrengthInstruction(strength: number): string {
  if (strength < 0.3) {
    return 'Make subtle changes while preserving most of the original features. ';
  } else if (strength < 0.7) {
    return 'Make moderate changes while maintaining the overall structure. ';
  } else {
    return 'Make significant changes while keeping it recognizable as a goldfish. ';
  }
}

// Base64画像データからImagenで使用可能な形式に変換
function prepareImageForImagen(base64Data: string): string {
  // data:image/png;base64, プレフィックスを削除
  const cleanBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
  return cleanBase64;
}

/**
 * 指定されたサイズの完全なマスク（真っ白な画像）をBase64で生成する
 * @param width 幅
 * @param height 高さ
 * @returns Base64エンコードされたPNGデータ
 */
function createFullMaskBase64(width: number, height: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // 白色で全体を塗りつぶす（編集対象領域）
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
  }
  // "data:image/png;base64," のプレフィックスを削除して返す
  return canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
}

// プロンプトからImagen 4 i2iリクエストを構築
function buildImagenI2IRequest(params: I2IGenerationParams): ImagenI2IRequest {
  const prompt = buildI2IPrompt(params);
  const imageData = prepareImageForImagen(params.baseImage.imageData);
  
  // 画像全体を編集対象とするマスクを生成
  const maskData = createFullMaskBase64(params.baseImage.width, params.baseImage.height);
  
  return {
    instances: [{
      prompt: prompt,
      image: {
        bytesBase64Encoded: imageData
      },
      mask: {
        image: {
          bytesBase64Encoded: maskData
        }
      },
      parameters: {
        sampleCount: 1,
        aspectRatio: '1:1', // 正方形の画像
        personGeneration: 'dont_allow', // 人物生成を無効化
        seed: Math.floor(Math.random() * 1000000), // ランダムシード
        guidanceScale: 1.0 + (params.strength || 0.7) * 19.0, // strengthに基づくガイダンス調整
        editConfig: {
          editMode: 'inpainting', // インペインティングモード
          maskMode: 'user_provided', // ユーザー提供マスク
          negativePrompt: 'blurry, low quality, distorted, unnatural, multiple fish, background, water, aquarium'
        }
      }
    }]
  };
}

// Imagen 4 i2iレスポンスの解析
function parseImagenI2IResponse(response: ImagenI2IResponse): string {
  if (!response.predictions || response.predictions.length === 0) {
    throw new GeminiI2IError('No predictions in Imagen i2i response');
  }
  
  const prediction = response.predictions[0];
  if (!prediction.bytesBase64Encoded) {
    throw new GeminiI2IError('No image data in Imagen i2i response');
  }
  
  return prediction.bytesBase64Encoded;
}

// リトライ機能付きfetch
async function makeRequestWithRetry(
  url: string,
  requestOptions: RequestInit,
  maxRetries: number = 3
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, requestOptions);
      
      // 429エラーの場合はリトライ
      if (response.status === 429 && attempt < maxRetries) {
        const retryAfter = response.headers.get('retry-after');
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, attempt) * 1000;
        
        console.log(`Gemini i2i rate limited. Retrying in ${waitTime}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Request failed');
      if (attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`Gemini i2i request failed. Retrying in ${waitTime}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError || new Error('All retry attempts failed');
}

// メイン関数：Gemini i2i生成
export async function generateI2IWithGemini(
  params: I2IGenerationParams
): Promise<I2IGenerationResult> {
  const startTime = Date.now();
  
  try {
    const { accessToken, projectId } = getGoogleCloudAuth();
    const request = buildImagenI2IRequest(params);
    
    console.log('Making Gemini i2i API request...');
    console.log('Base image dimensions:', params.baseImage.width, 'x', params.baseImage.height);
    
    // Vertex AI Imagen 4 エンドポイント
    const url = `${VERTEX_AI_BASE_URL}/projects/${projectId}/locations/us-central1/publishers/google/models/${DEFAULT_MODEL}:predict`;
    
    const response = await makeRequestWithRetry(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      throw new GeminiI2IError(errorMessage, response.status, errorData?.error?.code);
    }

    const responseData: ImagenI2IResponse = await response.json();
    const base64Image = parseImagenI2IResponse(responseData);
    
    const generationTime = Date.now() - startTime;
    console.log('Gemini i2i generation successful:', {
      duration: generationTime
    });

    return {
      success: true,
      data: {
        imageData: `data:image/png;base64,${base64Image}`,
        originalImage: params.baseImage.imageData,
        prompt: buildI2IPrompt(params),
        generationTime,
        model: 'gemini-imagen4'
      },
      timestamp: new Date()
    };

  } catch (error) {
    console.error('Gemini i2i generation failed:', error);
    
    let errorMessage = 'AI i2i生成中に不明なエラーが発生しました。';
    
    if (error instanceof GeminiI2IError) {
      if (error.status === 401) {
        errorMessage = 'Google Cloud認証が無効です。アクセストークンを確認してください。';
      } else if (error.status === 429) {
        errorMessage = 'Gemini API利用制限に達しました。しばらく待ってから再試行してください。';
      } else if (error.status === 403) {
        errorMessage = 'Gemini API利用権限がありません。プロジェクト設定を確認してください。';
      } else if (error.code === 'RESOURCE_EXHAUSTED') {
        errorMessage = 'Gemini APIクォータが不足しています。課金設定を確認してください。';
      } else if (error.code === 'SAFETY_VIOLATION') {
        errorMessage = 'コンテンツが安全ポリシーに違反しています。画像とプロンプトを調整してください。';
      } else {
        errorMessage = `Gemini i2i API エラー: ${error.message}`;
      }
    } else if (error instanceof Error) {
      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
      } else if (error.message.includes('access token')) {
        errorMessage = 'Google Cloudアクセストークンが設定されていません。管理者に設定を依頼してください。';
      } else if (error.message.includes('project ID')) {
        errorMessage = 'Google CloudプロジェクトIDが設定されていません。管理者に設定を依頼してください。';
      } else {
        errorMessage = `エラー: ${error.message}`;
      }
    }

    return {
      success: false,
      error: errorMessage,
      timestamp: new Date()
    };
  }
}

// Gemini i2i接続テスト
export async function testGeminiI2IConnection(testImageBase64: string): Promise<boolean> {
  try {
    // テスト用の簡単なパラメータ
    const testParams: I2IGenerationParams = {
      baseImage: {
        id: 'test-image',
        imageData: testImageBase64,
        width: 800,
        height: 600,
        fishDesign: {} as Record<string, unknown>, // テスト用なので空オブジェクト
        createdAt: new Date()
      },
      aiSelections: {
        model: 'gemini',
        bodyType: 'round',
        baseColor: 'red',
        size: 'medium',
        personality: 'calm',
        fins: 'standard',
        eyes: 'normal',
        pattern: 'none',
        headAccessory: 'none',
        faceAccessory: 'none',
        neckAccessory: 'none'
      },
      prompt: 'Test i2i generation with minimal changes',
      strength: 0.3,
      preserveStyle: true
    };
    
    const result = await generateI2IWithGemini(testParams);
    return result.success && !!result.data?.imageData;
  } catch (error) {
    console.error('Gemini i2i connection test failed:', error);
    return false;
  }
}

export default {
  generateI2IWithGemini,
  testGeminiI2IConnection
};