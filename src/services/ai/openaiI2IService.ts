// OpenAI i2i (Image-to-Image) サービス
// OpenAI DALL-E 3の画像編集APIを使用したi2i生成機能

import type { I2IGenerationParams, I2IGenerationResult } from '../../types/i2i.types';

const OPENAI_API_BASE_URL = 'https://api.openai.com/v1';

// APIキーを取得するヘルパー関数
function getOpenAIApiKey(): string {
  const apiKey = import.meta.env?.VITE_OPENAI_API_KEY || '';
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured.');
  }
  return apiKey;
}

// i2i専用プロンプトの構築
function buildI2IPrompt(params: I2IGenerationParams): string {
  // 最優先指示：右向きと透過背景
  const directionInstruction = `MANDATORY ORIENTATION: The goldfish MUST be facing RIGHT with head pointing to the RIGHT side and tail on the LEFT side. This is CRITICAL for aquarium animation compatibility. `;
  const backgroundInstruction = `MANDATORY BACKGROUND: The goldfish MUST have a completely transparent background (alpha channel = 0 for background pixels). Generate ONLY the goldfish with transparent background, no water, no aquarium, no background elements whatsoever. The background must be fully transparent PNG format. `;
  
  const baseImageInfo = `Transform this goldfish image `;
  const aiInstructions = generateI2IInstructions(params.aiSelections);
  const stylePreservation = params.preserveStyle 
    ? `while maintaining the original artistic style and composition. ` 
    : `with a new artistic style while keeping the basic goldfish structure. `;
  
  const strengthInstruction = getStrengthInstruction(params.strength || 0.7);
  
  const finalPrompt = `${directionInstruction}${backgroundInstruction}${baseImageInfo}${aiInstructions}${stylePreservation}${strengthInstruction}High quality, detailed, vibrant colors.`;
  
  console.log('【OpenAI i2i送信プロンプト】:', finalPrompt);
  return finalPrompt;
}

// AI選択からi2i指示を生成
function generateI2IInstructions(aiSelections: Record<string, unknown>): string {
  let instructions = '';
  
  // 体型の指示
  if (aiSelections.bodyType) {
    const bodyInstructions = {
      round: 'to have a more round and plump body, ',
      streamlined: 'to have a more streamlined and torpedo-shaped body, ',
      flat: 'to have a flatter and more disc-like body, ',
      elongated: 'to have a more elongated and eel-like body, '
    };
    instructions += bodyInstructions[aiSelections.bodyType as keyof typeof bodyInstructions] || '';
  }
  
  // 色の指示
  if (aiSelections.baseColor) {
    const colorInstructions = {
      red: 'with vibrant red coloring, ',
      blue: 'with deep blue coloring, ',
      yellow: 'with bright golden yellow coloring, ',
      white: 'with pure white coloring, ',
      black: 'with deep black coloring, ',
      colorful: 'with multicolored rainbow-like patterns, '
    };
    instructions += colorInstructions[aiSelections.baseColor as keyof typeof colorInstructions] || '';
  }
  
  // サイズの指示
  if (aiSelections.size) {
    const sizeInstructions = {
      small: 'appearing smaller and more delicate, ',
      medium: 'with moderate size, ',
      large: 'appearing larger and more imposing, '
    };
    instructions += sizeInstructions[aiSelections.size as keyof typeof sizeInstructions] || '';
  }
  
  // パーソナリティの指示
  if (aiSelections.personality) {
    const personalityInstructions = {
      calm: 'with a peaceful and serene expression, ',
      active: 'looking energetic and dynamic, ',
      elegant: 'with a graceful and refined appearance, ',
      unique: 'with distinctive and unusual features, '
    };
    instructions += personalityInstructions[aiSelections.personality as keyof typeof personalityInstructions] || '';
  }
  
  // ヒレの指示
  if (aiSelections.fins) {
    const finInstructions = {
      standard: 'with standard fin proportions, ',
      large: 'with larger and more prominent fins, ',
      decorative: 'with more decorative and ornate fins, ',
      simple: 'with simplified fin design, '
    };
    instructions += finInstructions[aiSelections.fins as keyof typeof finInstructions] || '';
  }
  
  // 目の指示
  if (aiSelections.eyes) {
    const eyeInstructions = {
      normal: 'with normal-sized eyes, ',
      large: 'with larger and more expressive eyes, ',
      small: 'with smaller and more subtle eyes, ',
      distinctive: 'with distinctive eye features, '
    };
    instructions += eyeInstructions[aiSelections.eyes as keyof typeof eyeInstructions] || '';
  }
  
  // 模様の指示
  if (aiSelections.pattern && aiSelections.pattern !== 'none') {
    const patternInstructions = {
      spotted: 'adding spotted patterns to the body, ',
      striped: 'adding striped patterns to the body, ',
      polka: 'adding polka dot patterns to the body, ',
      gradient: 'adding gradient color patterns to the body, '
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

// Base64データからFileオブジェクトを作成
function base64ToFile(base64Data: string, filename: string = 'goldfish.png'): File {
  // data:image/png;base64, プレフィックスを削除
  const cleanBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
  
  // Base64をバイナリに変換
  const binaryString = atob(cleanBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  // FileオブジェクトとしてBlob作成
  return new File([bytes], filename, { type: 'image/png' });
}

// 透過マスク画像を生成（全体を編集対象とする）
function createTransparentMask(width: number = 1024, height: number = 1024): File {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Cannot create canvas context for mask');
  }
  
  // 全体を透明にする（編集可能領域として設定）
  ctx.clearRect(0, 0, width, height);
  
  // CanvasをBlobに変換してFileオブジェクト作成
  return new Promise<File>((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('Cannot create mask blob');
      }
      resolve(new File([blob], 'mask.png', { type: 'image/png' }));
    }, 'image/png');
  }) as unknown as File;
}

/**
 * OpenAIの画像編集APIを呼び出す関数（i2i対応版）
 */
export async function generateI2IWithOpenAI(
  params: I2IGenerationParams
): Promise<I2IGenerationResult> {
  const startTime = Date.now();
  
  try {
    const apiKey = getOpenAIApiKey();
    const url = `${OPENAI_API_BASE_URL}/images/edits`;
    
    // プロンプトを構築
    const prompt = buildI2IPrompt(params);
    
    // ベース画像をFileに変換
    const imageFile = base64ToFile(params.baseImage.imageData, 'goldfish.png');
    
    // 透過マスクを作成（全体編集用）
    const maskFile = createTransparentMask(params.baseImage.width, params.baseImage.height);
    
    console.log('Making OpenAI i2i API request...');
    console.log('Base image dimensions:', params.baseImage.width, 'x', params.baseImage.height);
    
    // 画像APIは multipart/form-data 形式で送信する必要がある
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('mask', maskFile);
    formData.append('prompt', prompt);
    formData.append('n', '1'); // 生成する画像数
    formData.append('size', '1024x1024'); // DALL-E 3は1024x1024のみ
    formData.append('response_format', 'b64_json'); // Base64形式で受け取る

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        // 'Content-Type'はFormDataが自動で設定するため不要
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error.message || 'Image editing failed');
    }

    const responseData = await response.json();
    const base64Image = responseData.data[0].b64_json;
    
    const generationTime = Date.now() - startTime;
    console.log('OpenAI i2i generation successful:', {
      duration: generationTime
    });

    return {
      success: true,
      data: {
        imageData: `data:image/png;base64,${base64Image}`,
        originalImage: params.baseImage.imageData,
        prompt: prompt,
        generationTime,
        model: 'openai-dalle3'
      },
      timestamp: new Date()
    };
    
  } catch (error) {
    console.error('OpenAI i2i generation failed:', error);
    
    let errorMessage = 'OpenAI i2i生成中にエラーが発生しました。';
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = 'OpenAI APIキーが設定されていません。管理者に設定を依頼してください。';
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'OpenAI API利用制限に達しました。しばらく待ってから再試行してください。';
      } else if (error.message.includes('billing')) {
        errorMessage = 'OpenAI APIの課金設定を確認してください。';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
      } else {
        errorMessage = `OpenAI API エラー: ${error.message}`;
      }
    }

    return {
      success: false,
      error: errorMessage,
      timestamp: new Date()
    };
  }
}

// OpenAI i2i接続テスト
export async function testOpenAII2IConnection(testImageBase64: string): Promise<boolean> {
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
        model: 'chatgpt',
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
    
    const result = await generateI2IWithOpenAI(testParams);
    return result.success && !!result.data?.imageData;
  } catch (error) {
    console.error('OpenAI i2i connection test failed:', error);
    return false;
  }
}

export default {
  generateI2IWithOpenAI,
  testOpenAII2IConnection
};