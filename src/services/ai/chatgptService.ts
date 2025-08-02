// src/services/ai/chatgptService.ts (修正後)

import type { AIGenerationResult, AIApiConfig } from '../../types/ai.types';
import type { AIGenerationParams } from '../../types/aiFish.types';
import { buildDALLEImagePrompt, debugImagePrompt, validateImagePrompt } from './imagePrompts';

const OPENAI_API_BASE_URL = 'https://api.openai.com/v1';
// 変更点: 画像生成モデルに変更
const DEFAULT_MODEL = 'dall-e-3';

// 変更点: DALL-E 3 APIリクエスト用の型定義
interface OpenAImageRequest {
  model: string;
  prompt: string;
  n: number;
  size: '1024x1024' | '1024x1792' | '1792x1024';
  response_format: 'url' | 'b64_json';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
}

// 変更点: DALL-E 3 APIレスポンス用の型定義
interface OpenAIImageResponse {
  created: number;
  data: Array<{
    b64_json?: string;
    url?: string;
    revised_prompt?: string;
  }>;
}

// エラー処理用のカスタムエラークラス
export class ChatGPTError extends Error {
  public status?: number;
  public code?: string;
  
  constructor(
    message: string,
    status?: number,
    code?: string
  ) {
    super(message);
    this.name = 'ChatGPTError';
    this.status = status;
    this.code = code;
  }
}

// OpenAI APIキーの取得（環境変数から）
function getOpenAIApiKey(): string {
  // Vite環境では import.meta.env から取得
  const apiKey = import.meta.env?.VITE_OPENAI_API_KEY || '';
  
  if (!apiKey) {
    throw new ChatGPTError('OpenAI API key is not configured. Please set VITE_OPENAI_API_KEY environment variable.');
  }
  
  return apiKey;
}

// 変更点: プロンプトからDALL-E 3リクエストを構築
function buildOpenAIImageRequest(params: AIGenerationParams): OpenAImageRequest {
  // ★★★ 修正：systemPromptを完全に削除し、画像生成専用プロンプトを使用 ★★★
  const fullPrompt = buildDALLEImagePrompt(params);
  
  // プロンプトの検証とデバッグ出力
  const validation = validateImagePrompt(fullPrompt);
  if (!validation.isValid) {
    console.warn('🚨 Image prompt validation warnings:', validation.warnings);
  }
  
  debugImagePrompt('chatgpt', params, fullPrompt);
  
  // ★★★ コンソールでも確認できるようにする ★★★
  console.log("【DALL-E 3送信プロンプト】:", fullPrompt);
  // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  
  return {
    model: DEFAULT_MODEL,
    prompt: fullPrompt,
    n: 1, // 生成する画像数
    size: '1024x1024', // 画像サイズ
    response_format: 'b64_json', // Base64形式で画像データを受け取る
    quality: 'standard', // or 'hd'
    style: 'vivid' // or 'natural'
  };
}

// 変更点: DALL-E 3レスポンスの解析
function parseOpenAIImageResponse(response: OpenAIImageResponse): string {
  if (!response.data || response.data.length === 0 || !response.data[0].b64_json) {
    throw new ChatGPTError('No image data in OpenAI response');
  }
  return response.data[0].b64_json;
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
        
        console.log(`Rate limited. Retrying in ${waitTime}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Request failed');
      if (attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`Request failed. Retrying in ${waitTime}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError || new Error('All retry attempts failed');
}

// メイン関数：ChatGPT (DALL-E 3) APIを使用して画像を生成
export async function generateWithChatGPT(
  params: AIGenerationParams,
  config: AIApiConfig = { model: 'chatgpt' }
): Promise<AIGenerationResult> {
  const startTime = Date.now();
  
  try {
    const apiKey = getOpenAIApiKey();
    const request = buildOpenAIImageRequest(params);
    
    // 将来の拡張用にconfigをログ出力
    console.log('Using DALL-E 3 with config:', config.model);
    
    // 変更点: 画像生成用のエンドポイント
    const url = `${OPENAI_API_BASE_URL}/images/generations`;
    
    console.log('Making OpenAI Image API request with retry support...');
    const response = await makeRequestWithRetry(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      throw new ChatGPTError(errorMessage, response.status, errorData?.error?.code);
    }

    const responseData: OpenAIImageResponse = await response.json();
    // 変更点: JSONではなくBase64データを抽出
    const base64Image = parseOpenAIImageResponse(responseData);
    
    console.log('OpenAI image generation successful:', {
      duration: Date.now() - startTime
    });

    return {
      success: true,
      data: base64Image, // 変更点: Base64エンコードされた画像データを返す
      timestamp: new Date()
    };

  } catch (error) {
    console.error('OpenAI image generation failed:', error);
    
    let errorMessage = 'AI画像生成中に不明なエラーが発生しました。';
    
    if (error instanceof ChatGPTError) {
      if (error.status === 401) {
        errorMessage = 'APIキーが無効です。設定を確認してください。';
      } else if (error.status === 429) {
        errorMessage = 'API利用制限に達しました。しばらく待ってから再試行してください。';
      } else if (error.status === 403) {
        errorMessage = 'API利用権限がありません。設定を確認してください。';
      } else if (error.code === 'insufficient_quota') {
        errorMessage = 'APIクォータが不足しています。課金設定を確認してください。';
      } else if (error.code === 'content_policy_violation') {
        errorMessage = 'コンテンツポリシーに違反しています。プロンプトを調整してください。';
      } else {
        errorMessage = `OpenAI Image API エラー: ${error.message}`;
      }
    } else if (error instanceof Error) {
      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
      } else if (error.message.includes('API key')) {
        errorMessage = 'APIキーが設定されていません。管理者に設定を依頼してください。';
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

// 画像生成の接続テスト
export async function testChatGPTConnection(): Promise<boolean> {
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
    
    const result = await generateWithChatGPT(
      testParams,
      { model: 'chatgpt', temperature: 0.1, maxTokens: 100 }
    );
    
    return result.success && typeof result.data === 'string';
  } catch (error) {
    console.error('ChatGPT image generation connection test failed:', error);
    return false;
  }
}