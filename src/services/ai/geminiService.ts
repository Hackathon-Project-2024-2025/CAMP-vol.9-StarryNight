import type { AIGenerationResult, AIApiConfig } from '../../types/ai.types';

// Gemini API設定
const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const DEFAULT_MODEL = 'gemini-2.5-pro';

// Gemini APIリクエスト用の型定義
interface GeminiRequest {
  contents: Array<{
    parts: Array<{
      text: string;
    }>;
    role: 'user' | 'model';
  }>;
  generationConfig: {
    temperature: number;
    topK: number;
    topP: number;
    maxOutputTokens: number;
    responseMimeType: string;
  };
  systemInstruction?: {
    parts: Array<{
      text: string;
    }>;
  };
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
      role: string;
    };
    finishReason: string;
    index: number;
    safetyRatings: Array<{
      category: string;
      probability: string;
    }>;
  }>;
  promptFeedback?: {
    safetyRatings: Array<{
      category: string;
      probability: string;
    }>;
  };
}

// エラー処理用のカスタムエラークラス
export class GeminiError extends Error {
  public status?: number;
  public code?: string;
  
  constructor(
    message: string,
    status?: number,
    code?: string
  ) {
    super(message);
    this.name = 'GeminiError';
    this.status = status;
    this.code = code;
  }
}

// Gemini APIキーの取得（環境変数から）
function getGeminiApiKey(): string {
  // Vite環境では import.meta.env から取得
  const apiKey = import.meta.env?.VITE_GEMINI_API_KEY || '';
  
  if (!apiKey) {
    throw new GeminiError('Gemini API key is not configured. Please set VITE_GEMINI_API_KEY environment variable.');
  }
  
  return apiKey;
}

// プロンプトからGeminiリクエストを構築
function buildGeminiRequest(systemPrompt: string, userPrompt: string, config: AIApiConfig): GeminiRequest {
  return {
    contents: [
      {
        parts: [{ text: userPrompt }],
        role: 'user'
      }
    ],
    generationConfig: {
      temperature: config.temperature || 0.8,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: config.maxTokens || 2048,
      responseMimeType: 'application/json'
    },
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    }
  };
}

// Gemini APIレスポンスの解析
function parseGeminiResponse(response: GeminiResponse): string {
  if (!response.candidates || response.candidates.length === 0) {
    throw new GeminiError('No candidates in Gemini response');
  }

  const candidate = response.candidates[0];
  
  if (candidate.finishReason !== 'STOP') {
    throw new GeminiError(`Generation stopped with reason: ${candidate.finishReason}`);
  }

  if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
    throw new GeminiError('No content in Gemini response');
  }

  return candidate.content.parts[0].text;
}

// JSONレスポンスの清掃と解析
function cleanAndParseJSON(text: string): unknown {
  try {
    // JSONブロックマーカーの除去
    let cleaned = text.replace(/```json\s*|\s*```/g, '');
    
    // 前後の空白を除去
    cleaned = cleaned.trim();
    
    // JSONの開始と終了を探す
    const startIndex = cleaned.indexOf('{');
    const endIndex = cleaned.lastIndexOf('}');
    
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      cleaned = cleaned.substring(startIndex, endIndex + 1);
    }
    
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Failed to parse JSON:', text);
    throw new GeminiError(`Invalid JSON response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// メイン関数：Gemini APIを使用してコンテンツを生成
export async function generateWithGemini(
  systemPrompt: string,
  userPrompt: string,
  config: AIApiConfig = { model: 'gemini' }
): Promise<AIGenerationResult> {
  const startTime = Date.now();
  
  try {
    // APIキーの取得
    const apiKey = getGeminiApiKey();
    
    // リクエストの構築
    const request = buildGeminiRequest(systemPrompt, userPrompt, config);
    
    // Gemini APIエンドポイントの構築
    const url = `${GEMINI_API_BASE_URL}/models/${DEFAULT_MODEL}:generateContent?key=${apiKey}`;
    
    // API呼び出し
    console.log('Making Gemini API request...');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    });

    // レスポンスのステータスチェック
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      throw new GeminiError(errorMessage, response.status);
    }

    // レスポンスの解析
    const responseData: GeminiResponse = await response.json();
    const generatedText = parseGeminiResponse(responseData);
    
    // JSONとして解析
    const parsedData = cleanAndParseJSON(generatedText);
    
    console.log('Gemini generation successful:', {
      duration: Date.now() - startTime,
      responseLength: generatedText.length
    });

    return {
      success: true,
      data: parsedData,
      timestamp: new Date()
    };

  } catch (error) {
    console.error('Gemini generation failed:', error);
    
    let errorMessage = 'AI生成中に不明なエラーが発生しました。';
    
    if (error instanceof GeminiError) {
      if (error.status === 401) {
        errorMessage = 'APIキーが無効です。設定を確認してください。';
      } else if (error.status === 429) {
        errorMessage = 'API利用制限に達しました。しばらく待ってから再試行してください。';
      } else if (error.status === 403) {
        errorMessage = 'API利用権限がありません。設定を確認してください。';
      } else {
        errorMessage = `Gemini API エラー: ${error.message}`;
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

// Gemini APIの接続テスト
export async function testGeminiConnection(): Promise<boolean> {
  try {
    const result = await generateWithGemini(
      'You are a test assistant.',
      'Please respond with a simple JSON object: {"status": "ok", "message": "connection successful"}',
      { model: 'gemini', temperature: 0.1, maxTokens: 100 }
    );
    
    return result.success && (result.data as Record<string, unknown>)?.status === 'ok';
  } catch (error) {
    console.error('Gemini connection test failed:', error);
    return false;
  }
}

// デバッグ用：利用可能なモデル一覧取得（実際のAPIでは異なる可能性があります）
export function getAvailableGeminiModels(): string[] {
  return [
    'gemini-2.5-pro',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-pro',
    'gemini-1.5-flash'
  ];
}