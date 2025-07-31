import type { AISelections } from '../../types/ai.types';

// 日本語から英語への翻訳マップ
const TRANSLATION_MAP = {
  // 体型
  bodyType: {
    round: 'round, plump, cute goldfish body shape',
    streamlined: 'streamlined, sleek, fast-swimming body shape',
    flat: 'flat, elegant, graceful body shape',
    elongated: 'elongated, eel-like, slender body shape'
  },
  
  // 基本色
  baseColor: {
    red: 'red, orange, warm colors',
    blue: 'blue, cyan, cool colors',
    yellow: 'yellow, golden, bright colors',
    white: 'white, silver, elegant colors',
    black: 'black, dark gray, sophisticated colors',
    colorful: 'multicolored, rainbow, vibrant mixed colors'
  },
  
  // サイズ
  size: {
    small: 'small, petite, palm-sized',
    medium: 'medium, standard, balanced size',
    large: 'large, big, impressive size'
  },
  
  // 性格
  personality: {
    calm: 'calm, peaceful, gentle, serene',
    active: 'active, energetic, dynamic, lively',
    elegant: 'elegant, refined, graceful, sophisticated',
    unique: 'unique, distinctive, quirky, individual'
  },
  
  // ヒレ
  fins: {
    standard: 'standard, balanced fins',
    large: 'large, prominent, impressive fins',
    decorative: 'decorative, ornate, fancy fins',
    simple: 'simple, clean, minimalist fins'
  },
  
  // 目
  eyes: {
    normal: 'normal, standard sized eyes',
    large: 'large, prominent, expressive eyes',
    small: 'small, cute, delicate eyes',
    distinctive: 'distinctive, unique, striking eyes'
  },
  
  // 模様
  pattern: {
    none: 'solid color, no pattern',
    spotted: 'spotted, speckled pattern',
    striped: 'striped, banded pattern',
    polka: 'polka dot, circular pattern',
    gradient: 'gradient, color transition pattern'
  },
  
  // アクセサリー - 頭部
  headAccessory: {
    none: '',
    crown: 'wearing a golden crown, royal, majestic',
    hat: 'wearing a cute hat, fashionable',
    ribbon: 'adorned with a ribbon, charming'
  },
  
  // アクセサリー - 顔部
  faceAccessory: {
    none: '',
    glasses: 'wearing glasses, intellectual, smart',
    sunglasses: 'wearing sunglasses, cool, stylish'
  },
  
  // アクセサリー - 首部
  neckAccessory: {
    none: '',
    necklace: 'wearing an elegant necklace, refined',
    bowtie: 'wearing a formal bowtie, dapper'
  }
};

// プロンプトテンプレート
const PROMPT_TEMPLATES = {
  gemini: {
    system: `You are an expert goldfish designer AI. Create detailed specifications for a Japanese goldfish (kingyo) based on user preferences. Return your response as a valid JSON object with the following structure:

{
  "name": "Generated fish name in Japanese",
  "bodyColor": "hex color code",
  "finColor": "hex color code", 
  "eyeColor": "hex color code",
  "size": number between 0.8 and 1.5,
  "finSize": number between 0.8 and 1.3,
  "eyeSize": number between 0.8 and 1.3,
  "bodyPattern": {
    "type": "spotted|striped|polka|gradient|none",
    "colors": ["hex color array"],
    "intensity": number between 0.3 and 0.8,
    "scale": number between 0.7 and 1.5
  },
  "accessories": [
    {
      "id": "accessory-id",
      "category": "crown|hat|glasses|ribbon|bow|jewelry",
      "color": "hex color",
      "size": number between 0.8 and 1.2,
      "position": {"x": number, "y": number},
      "visible": true
    }
  ]
}`,
    
    user: (selections: AISelections) => {
      const parts = [
        `Create a Japanese goldfish with the following characteristics:`,
        `Body Type: ${TRANSLATION_MAP.bodyType[selections.bodyType]}`,
        `Color Theme: ${TRANSLATION_MAP.baseColor[selections.baseColor]}`,
        `Size: ${TRANSLATION_MAP.size[selections.size]}`,
        `Personality: ${TRANSLATION_MAP.personality[selections.personality]}`,
        `Fins: ${TRANSLATION_MAP.fins[selections.fins]}`,
        `Eyes: ${TRANSLATION_MAP.eyes[selections.eyes]}`,
        `Pattern: ${TRANSLATION_MAP.pattern[selections.pattern]}`
      ];
      
      // アクセサリーの追加
      const accessories = [
        TRANSLATION_MAP.headAccessory[selections.headAccessory],
        TRANSLATION_MAP.faceAccessory[selections.faceAccessory],
        TRANSLATION_MAP.neckAccessory[selections.neckAccessory]
      ].filter(Boolean);
      
      if (accessories.length > 0) {
        parts.push(`Accessories: ${accessories.join(', ')}`);
      }
      
      // カスタムテキストの追加
      if (selections.customText?.trim()) {
        parts.push(`Additional requirements: ${selections.customText}`);
      }
      
      parts.push(
        `Please ensure the goldfish design is harmonious and aesthetically pleasing.`,
        `Use appropriate Japanese color aesthetics and goldfish breeding traditions.`,
        `Return only the JSON object, no additional text.`
      );
      
      return parts.join('\n');
    }
  },
  
  chatgpt: {
    system: `You are a master goldfish designer specializing in traditional Japanese kingyo. Your task is to create beautiful goldfish designs based on user specifications. Always respond with a properly formatted JSON object containing the goldfish specifications.

Focus on:
- Traditional Japanese goldfish aesthetics
- Harmonious color combinations
- Balanced proportions
- Cultural authenticity

Response format:
{
  "name": "Japanese name for the goldfish",
  "bodyColor": "#hexcolor",
  "finColor": "#hexcolor",
  "eyeColor": "#hexcolor", 
  "size": 0.8-1.5,
  "finSize": 0.8-1.3,
  "eyeSize": 0.8-1.3,
  "bodyPattern": {
    "type": "pattern type",
    "colors": ["#hex1", "#hex2"],
    "intensity": 0.3-0.8,
    "scale": 0.7-1.5
  },
  "accessories": [
    {
      "id": "unique-id",
      "category": "type",
      "color": "#hexcolor",
      "size": 0.8-1.2,
      "position": {"x": -0.5 to 0.5, "y": -0.5 to 0.5},
      "visible": true
    }
  ]
}`,
    
    user: (selections: AISelections) => {
      const description = [
        `Design a Japanese goldfish (kingyo) with these specifications:`,
        `• Body shape: ${TRANSLATION_MAP.bodyType[selections.bodyType]}`,
        `• Primary colors: ${TRANSLATION_MAP.baseColor[selections.baseColor]}`,
        `• Overall size: ${TRANSLATION_MAP.size[selections.size]}`,
        `• Character: ${TRANSLATION_MAP.personality[selections.personality]}`,
        `• Fin style: ${TRANSLATION_MAP.fins[selections.fins]}`,
        `• Eye appearance: ${TRANSLATION_MAP.eyes[selections.eyes]}`,
        `• Body pattern: ${TRANSLATION_MAP.pattern[selections.pattern]}`
      ];
      
      // アクセサリー情報の追加
      const accessoryInfo = [];
      if (selections.headAccessory !== 'none') {
        accessoryInfo.push(`Head: ${TRANSLATION_MAP.headAccessory[selections.headAccessory]}`);
      }
      if (selections.faceAccessory !== 'none') {
        accessoryInfo.push(`Face: ${TRANSLATION_MAP.faceAccessory[selections.faceAccessory]}`);
      }
      if (selections.neckAccessory !== 'none') {
        accessoryInfo.push(`Neck: ${TRANSLATION_MAP.neckAccessory[selections.neckAccessory]}`);
      }
      
      if (accessoryInfo.length > 0) {
        description.push(`• Accessories: ${accessoryInfo.join(', ')}`);
      }
      
      // 追加要望の処理
      if (selections.customText?.trim()) {
        description.push(`• Special requests: ${selections.customText}`);
      }
      
      description.push(
        ``,
        `Please create a cohesive and beautiful design that honors traditional Japanese goldfish aesthetics. Ensure all colors complement each other and the overall design is balanced and appealing.`,
        ``,
        `Respond only with the JSON object, no explanatory text.`
      );
      
      return description.join('\n');
    }
  }
};

// メイン関数：プロンプトを構築
export function buildAIPrompt(selections: AISelections): { system: string; user: string } {
  const template = PROMPT_TEMPLATES[selections.model];
  
  return {
    system: template.system,
    user: template.user(selections)
  };
}

// プロンプトの品質チェック
export function validatePrompt(prompt: { system: string; user: string }): boolean {
  return (
    prompt.system.length > 50 &&
    prompt.user.length > 100 &&
    prompt.user.includes('goldfish') &&
    !prompt.user.includes('undefined') &&
    !prompt.user.includes('null')
  );
}

// 選択内容の要約を生成（デバッグ用）
export function summarizeSelections(selections: AISelections): string {
  const summary = [
    `Model: ${selections.model}`,
    `Body: ${selections.bodyType} (${selections.baseColor}, ${selections.size})`,
    `Style: ${selections.personality}`,
    `Details: ${selections.fins} fins, ${selections.eyes} eyes, ${selections.pattern} pattern`,
    `Accessories: Head(${selections.headAccessory}), Face(${selections.faceAccessory}), Neck(${selections.neckAccessory})`
  ];
  
  if (selections.customText?.trim()) {
    summary.push(`Custom: "${selections.customText}"`);
  }
  
  return summary.join('\n');
}

// AI応答をFishDesignオブジェクトに変換するための型定義とヘルパー
export interface AIResponse {
  name: string;
  bodyColor: string;
  finColor: string;
  eyeColor: string;
  size: number;
  finSize: number;
  eyeSize: number;
  bodyPattern?: {
    type: string;
    colors: string[];
    intensity: number;
    scale: number;
  };
  accessories: Array<{
    id: string;
    category: string;
    color: string;
    size: number;
    position: { x: number; y: number };
    visible: boolean;
  }>;
}

// AI応答の検証
export function validateAIResponse(response: unknown): response is AIResponse {
  if (typeof response !== 'object' || response === null) {
    return false;
  }
  
  const obj = response as Record<string, unknown>;
  return (
    typeof obj.name === 'string' &&
    typeof obj.bodyColor === 'string' &&
    typeof obj.finColor === 'string' &&
    typeof obj.eyeColor === 'string' &&
    typeof obj.size === 'number' &&
    typeof obj.finSize === 'number' &&
    typeof obj.eyeSize === 'number' &&
    Array.isArray(obj.accessories)
  );
}