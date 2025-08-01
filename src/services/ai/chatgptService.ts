import type { AIGenerationResult, AIApiConfig } from '../../types/ai.types';

// OpenAI API設定
const OPENAI_API_BASE_URL = 'https://api.openai.com/v1';
const DEFAULT_MODEL = 'gpt-4o-mini'; // コスト効率の良いモデル

// OpenAI APIリクエスト用の型定義
interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  response_format?: {
    type: 'json_object';
  };
}

interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
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

// プロンプトからOpenAIリクエストを構築
function buildOpenAIRequest(systemPrompt: string, userPrompt: string, config: AIApiConfig): OpenAIRequest {
  return {
    model: DEFAULT_MODEL,
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: userPrompt
      }
    ],
    temperature: config.temperature || 0.8,
    max_tokens: config.maxTokens || 2048,
    top_p: 0.95,
    frequency_penalty: 0,
    presence_penalty: 0,
    response_format: {
      type: 'json_object'
    }
  };
}

// OpenAI APIレスポンスの解析
function parseOpenAIResponse(response: OpenAIResponse): string {
  if (!response.choices || response.choices.length === 0) {
    throw new ChatGPTError('No choices in OpenAI response');
  }

  const choice = response.choices[0];
  
  if (choice.finish_reason !== 'stop') {
    throw new ChatGPTError(`Generation stopped with reason: ${choice.finish_reason}`);
  }

  if (!choice.message || !choice.message.content) {
    throw new ChatGPTError('No content in OpenAI response');
  }

  return choice.message.content;
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
    throw new ChatGPTError(`Invalid JSON response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// メイン関数：ChatGPT APIを使用してコンテンツを生成
export async function generateWithChatGPT(
  systemPrompt: string,
  userPrompt: string,
  config: AIApiConfig = { model: 'chatgpt' }
): Promise<AIGenerationResult> {
  const startTime = Date.now();
  
  try {
    // APIキーの取得
    const apiKey = getOpenAIApiKey();
    
    // リクエストの構築
    const request = buildOpenAIRequest(systemPrompt, userPrompt, config);
    
    // OpenAI APIエンドポイントの構築
    const url = `${OPENAI_API_BASE_URL}/chat/completions`;
    
    // API呼び出し
    console.log('Making OpenAI API request...');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(request)
    });

    // レスポンスのステータスチェック
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      throw new ChatGPTError(errorMessage, response.status, errorData?.error?.code);
    }

    // レスポンスの解析
    const responseData: OpenAIResponse = await response.json();
    const generatedText = parseOpenAIResponse(responseData);
    
    // JSONとして解析
    const parsedData = cleanAndParseJSON(generatedText);
    
    console.log('OpenAI generation successful:', {
      duration: Date.now() - startTime,
      responseLength: generatedText.length,
      tokensUsed: responseData.usage?.total_tokens || 0
    });

    return {
      success: true,
      data: parsedData,
      timestamp: new Date()
    };

  } catch (error) {
    console.error('OpenAI generation failed:', error);
    
    let errorMessage = 'AI生成中に不明なエラーが発生しました。';
    
    if (error instanceof ChatGPTError) {
      if (error.status === 401) {
        errorMessage = 'APIキーが無効です。設定を確認してください。';
      } else if (error.status === 429) {
        errorMessage = 'API利用制限に達しました。しばらく待ってから再試行してください。';
      } else if (error.status === 403) {
        errorMessage = 'API利用権限がありません。設定を確認してください。';
      } else if (error.code === 'insufficient_quota') {
        errorMessage = 'APIクォータが不足しています。課金設定を確認してください。';
      } else if (error.code === 'model_not_found') {
        errorMessage = '指定されたモデルが見つかりません。';
      } else {
        errorMessage = `OpenAI API エラー: ${error.message}`;
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

// ChatGPT APIの接続テスト
export async function testChatGPTConnection(): Promise<boolean> {
  try {
    const result = await generateWithChatGPT(
      'You are a test assistant. Always respond with valid JSON.',
      'Please respond with a simple JSON object: {"status": "ok", "message": "connection successful"}',
      { model: 'chatgpt', temperature: 0.1, maxTokens: 100 }
    );
    
    return result.success && (result.data as Record<string, unknown>)?.status === 'ok';
  } catch (error) {
    console.error('ChatGPT connection test failed:', error);
    return false;
  }
}

// 利用可能なモデル一覧
export function getAvailableChatGPTModels(): string[] {
  return [
    'gpt-4o-mini',
    'gpt-4o',
    'gpt-4-turbo',
    'gpt-4',
    'gpt-3.5-turbo'
  ];
}

// 使用量の推定（トークン数の概算）
export function estimateTokenUsage(systemPrompt: string, userPrompt: string): number {
  // 大まかな推定：1トークン ≈ 4文字（英語）、6文字（日本語）
  const totalChars = systemPrompt.length + userPrompt.length;
  return Math.ceil(totalChars / 5); // 日本語と英語の中間値で推定
}

// コスト推定（USD）
export function estimateCost(estimatedTokens: number, model: string = DEFAULT_MODEL): number {
  // 2024年時点の大まかな料金（実際の料金は変動する可能性があります）
  const pricePerToken = {
    'gpt-4o-mini': 0.000150 / 1000, // $0.150 per 1M input tokens
    'gpt-4o': 0.0025 / 1000,        // $2.50 per 1M input tokens
    'gpt-4-turbo': 0.01 / 1000,     // $10 per 1M input tokens
    'gpt-4': 0.03 / 1000,           // $30 per 1M input tokens
    'gpt-3.5-turbo': 0.0005 / 1000  // $0.50 per 1M input tokens
  };
  
  const price = pricePerToken[model as keyof typeof pricePerToken] || pricePerToken['gpt-4o-mini'];
  return estimatedTokens * price;
}