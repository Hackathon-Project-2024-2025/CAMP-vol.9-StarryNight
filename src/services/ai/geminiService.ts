// src/services/ai/geminiService.ts (Imagen 4対応版)

import type { AIGenerationResult, AIApiConfig } from '../../types/ai.types';
import type { AIGenerationParams } from '../../types/aiFish.types';
import { buildImagenPrompt, debugImagePrompt, validateImagePrompt } from './imagePrompts';

// 変更点: Vertex AI APIを使用してImagen 4にアクセス
const VERTEX_AI_BASE_URL = 'https://us-central1-aiplatform.googleapis.com/v1';
const DEFAULT_MODEL = 'imagegeneration@006'; // Imagen 4モデル

// Imagen 4 APIリクエスト用の型定義
interface ImagenRequest {
  instances: Array<{
    prompt: string;
    parameters?: {
      sampleCount?: number;
      aspectRatio?: string;
      safetyFilterLevel?: string;
      personGeneration?: string;
    };
  }>;
  parameters?: {
    sampleCount?: number;
    aspectRatio?: string;
    safetyFilterLevel?: string;
    personGeneration?: string;
  };
}

// Imagen 4 APIレスポンス用の型定義
interface ImagenResponse {
  predictions: Array<{
    bytesBase64Encoded: string;
    mimeType: string;
  }>;
}

// エラー処理用のカスタムエラークラス
export class GeminiError extends Error {
  public status?: number;
  public code?: string;
  
  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'GeminiError';
    this.status = status;
    this.code = code;
  }
}

// Google Cloud認証情報の取得
function getGoogleCloudAuth(): { accessToken: string; projectId: string } {
  // アクセストークンの取得
  const accessToken = import.meta.env?.VITE_GOOGLE_ACCESS_TOKEN || '';
  if (!accessToken) {
    throw new GeminiError('Google Cloud access token is not configured. Please set VITE_GOOGLE_ACCESS_TOKEN environment variable.');
  }
  
  // プロジェクトIDの取得
  const projectId = import.meta.env?.VITE_GOOGLE_CLOUD_PROJECT_ID || '';
  if (!projectId) {
    throw new GeminiError('Google Cloud project ID is not configured. Please set VITE_GOOGLE_CLOUD_PROJECT_ID environment variable.');
  }
  
  return { accessToken, projectId };
}

// プロンプトからImagen 4リクエストを構築
function buildImagenRequest(params: AIGenerationParams): ImagenRequest {
  // ★★★ 修正：systemPromptを完全に削除し、画像生成専用プロンプトを使用 ★★★
  const fullPrompt = buildImagenPrompt(params);
  
  // プロンプトの検証とデバッグ出力
  const validation = validateImagePrompt(fullPrompt);
  if (!validation.isValid) {
    console.warn('🚨 Image prompt validation warnings:', validation.warnings);
  }
  
  debugImagePrompt('gemini', params, fullPrompt);
  
  // ★★★ コンソールでも確認できるようにする ★★★
  console.log("【Imagen 4送信プロンプト】:", fullPrompt);
  // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★

  return {
    instances: [{
      prompt: fullPrompt,
      parameters: {
        sampleCount: 1,
        aspectRatio: '1:1', // 正方形の画像
        // safetyFilterLevel: 'block_some', // 原因の可能性があるため、一旦コメントアウト
        personGeneration: 'dont_allow' // 人物生成を無効化
      }
    }]
  };
}

// Imagen 4レスポンスの解析
function parseImagenResponse(response: ImagenResponse): string {
  if (!response.predictions || response.predictions.length === 0) {
    throw new GeminiError('No predictions in Imagen response');
  }
  
  const prediction = response.predictions[0];
  if (!prediction.bytesBase64Encoded) {
    throw new GeminiError('No image data in Imagen response');
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
        
        console.log(`Gemini rate limited. Retrying in ${waitTime}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Request failed');
      if (attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`Gemini request failed. Retrying in ${waitTime}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError || new Error('All retry attempts failed');
}

// メイン関数：Imagen 4 APIを使用して画像を生成
export async function generateWithGemini(
  params: AIGenerationParams,
  config: AIApiConfig = { model: 'gemini' }
): Promise<AIGenerationResult> {
  const startTime = Date.now();
  
  try {
    const { accessToken, projectId } = getGoogleCloudAuth();
    const request = buildImagenRequest(params);
    
    // 将来の拡張用にconfigをログ出力
    console.log('Using Imagen 4 with config:', config.model);
    
    // Vertex AI Imagen 4 エンドポイント
    const url = `${VERTEX_AI_BASE_URL}/projects/${projectId}/locations/us-central1/publishers/google/models/${DEFAULT_MODEL}:predict`;
    
    console.log('Making Imagen 4 API request with retry support...');
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
      throw new GeminiError(errorMessage, response.status, errorData?.error?.code);
    }

    const responseData: ImagenResponse = await response.json();
    const base64Image = parseImagenResponse(responseData);
    
    console.log('Imagen 4 image generation successful:', {
      duration: Date.now() - startTime
    });

    return {
      success: true,
      data: base64Image,
      timestamp: new Date()
    };

  } catch (error) {
    console.error('Imagen 4 image generation failed:', error);
    
    let errorMessage = 'AI画像生成中に不明なエラーが発生しました。';
    
    if (error instanceof GeminiError) {
      if (error.status === 401) {
        errorMessage = 'Google Cloud認証が無効です。アクセストークンを確認してください。';
      } else if (error.status === 429) {
        errorMessage = 'Imagen 4 API利用制限に達しました。しばらく待ってから再試行してください。';
      } else if (error.status === 403) {
        errorMessage = 'Imagen 4 API利用権限がありません。プロジェクト設定を確認してください。';
      } else if (error.code === 'RESOURCE_EXHAUSTED') {
        errorMessage = 'Imagen 4 APIクォータが不足しています。課金設定を確認してください。';
      } else if (error.code === 'SAFETY_VIOLATION') {
        errorMessage = 'コンテンツが安全ポリシーに違反しています。プロンプトを調整してください。';
      } else {
        errorMessage = `Imagen 4 API エラー: ${error.message}`;
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

// Imagen 4画像生成の接続テスト
export async function testGeminiConnection(): Promise<boolean> {
  try {
    // テスト用のシンプルなパラメータ
    const testParams: AIGenerationParams = {
      concept: 'elegant',
      mood: 'calm',
      colorTone: 'warm',
      scale: 'small',
      complexity: 'simple',
      creativityLevel: 0.5,
      customRequest: 'simple test goldfish'
    };
    
    const result = await generateWithGemini(
      testParams,
      { model: 'gemini', temperature: 0.1, maxTokens: 100 }
    );
    
    return result.success && typeof result.data === 'string';
  } catch (error) {
    console.error('Imagen 4 image generation connection test failed:', error);
    return false;
  }
}