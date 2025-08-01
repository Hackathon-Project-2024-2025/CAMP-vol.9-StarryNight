import type { AIFishDesign, AIFishGenerationResponse, DrawingPoint } from '../../types/aiFish.types';

// AI生成応答からAIFishDesignへの変換
export function convertAIResponseToFishDesign(
  aiResponse: AIFishGenerationResponse['data'], 
  aiModel: string = 'gemini-2.5-pro'
): AIFishDesign {
  if (!aiResponse) {
    throw new Error('AI response data is null or undefined');
  }

  // デフォルトの魚形状データ
  const defaultBodyPath: DrawingPoint[] = [
    { x: -80, y: 0 },    // 尾部
    { x: -60, y: -30 },  // 背中上部
    { x: -20, y: -35 },  // 頭部上
    { x: 40, y: -20 },   // 鼻先上
    { x: 50, y: 0 },     // 鼻先
    { x: 40, y: 20 },    // 鼻先下
    { x: -20, y: 35 },   // 頭部下
    { x: -60, y: 30 },   // 腹部下
    { x: -80, y: 0 }     // 尾部（閉じる）
  ];

  // パスデータの解析とフォールバック
  const parseDrawingData = (data: string | DrawingPoint[], fallback: DrawingPoint[]): DrawingPoint[] => {
    if (Array.isArray(data)) {
      return data.length > 0 ? data : fallback;
    }
    
    if (typeof data === 'string' && data.trim()) {
      // 簡単なパース（座標抽出）
      try {
        const matches = data.match(/-?\d+(\.\d+)?/g);
        if (matches && matches.length >= 4) {
          const points: DrawingPoint[] = [];
          for (let i = 0; i < matches.length - 1; i += 2) {
            points.push({
              x: parseFloat(matches[i]),
              y: parseFloat(matches[i + 1])
            });
          }
          return points.length > 2 ? points : fallback;
        }
      } catch (error) {
        console.warn('Failed to parse drawing data, using fallback:', error);
      }
    }
    
    return fallback;
  };

  // デフォルトヒレの形状
  const defaultFins = {
    dorsalFin: [
      { x: -10, y: -35 },
      { x: 0, y: -55 },
      { x: 10, y: -45 },
      { x: 20, y: -40 }
    ],
    pectoralFin: [
      { x: 10, y: -10 },
      { x: 30, y: -15 },
      { x: 25, y: 5 },
      { x: 15, y: 10 }
    ],
    tailFin: [
      { x: -80, y: -20 },
      { x: -100, y: -25 },
      { x: -110, y: 0 },
      { x: -100, y: 25 },
      { x: -80, y: 20 }
    ]
  };

  // 色の検証とフォールバック
  const validateColor = (color: unknown, fallback: string): string => {
    if (typeof color === 'string' && /^#[0-9a-fA-F]{6}$/.test(color)) {
      return color;
    }
    return fallback;
  };

  // 数値の検証
  const validateNumber = (value: unknown, min: number, max: number, fallback: number): number => {
    const num = typeof value === 'number' ? value : parseFloat(String(value));
    return isNaN(num) ? fallback : Math.max(min, Math.min(max, num));
  };

  // バウンディングボックスの計算
  const calculateBoundingBox = (bodyPath: DrawingPoint[]) => {
    if (bodyPath.length === 0) {
      return { x: -100, y: -60, width: 200, height: 120 };
    }

    const xs = bodyPath.map(p => p.x);
    const ys = bodyPath.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  };

  // 体のパスデータ解析
  const bodyPath = parseDrawingData(aiResponse.drawing?.bodyPath, defaultBodyPath);
  const boundingBox = calculateBoundingBox(bodyPath);

  // AIFishDesignオブジェクトの構築
  const fishDesign: AIFishDesign = {
    id: `ai-fish-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: aiResponse.name || 'AI生成金魚',
    
    generationParams: {
      concept: 'elegant',
      mood: 'calm',
      colorTone: 'warm',
      scale: 'medium',
      complexity: 'moderate',
      creativityLevel: 0.7
    },

    shape: {
      bodyPath: bodyPath,
      
      // ヒレの形状
      dorsalFin: parseDrawingData(aiResponse.drawing?.fins?.dorsal, defaultFins.dorsalFin),
      pectoralFin: parseDrawingData(aiResponse.drawing?.fins?.pectoral, defaultFins.pectoralFin),
      tailFin: parseDrawingData(aiResponse.drawing?.fins?.tail, defaultFins.tailFin),
      ventralFin: parseDrawingData(aiResponse.drawing?.fins?.ventral, [
        { x: 0, y: 20 }, { x: 10, y: 35 }, { x: -5, y: 30 }
      ]),
      analFin: parseDrawingData(aiResponse.drawing?.fins?.anal, [
        { x: -30, y: 25 }, { x: -25, y: 40 }, { x: -40, y: 35 }
      ]),

      // 目の設定
      leftEye: {
        center: {
          x: aiResponse.drawing?.eyes?.left?.x || 25,
          y: aiResponse.drawing?.eyes?.left?.y || -15
        },
        radius: validateNumber(aiResponse.drawing?.eyes?.left?.radius, 3, 15, 8),
        shape: (aiResponse.drawing?.eyes?.left?.shape as 'circle' | 'oval' | 'almond') || 'circle'
      },
      
      rightEye: {
        center: {
          x: aiResponse.drawing?.eyes?.right?.x || 25,
          y: aiResponse.drawing?.eyes?.right?.y || 15
        },
        radius: validateNumber(aiResponse.drawing?.eyes?.right?.radius, 3, 15, 8),
        shape: (aiResponse.drawing?.eyes?.right?.shape as 'circle' | 'oval' | 'almond') || 'circle'
      },

      // 口の設定
      mouth: {
        center: {
          x: aiResponse.drawing?.mouth?.x || 45,
          y: aiResponse.drawing?.mouth?.y || 0
        },
        width: validateNumber(aiResponse.drawing?.mouth?.width, 2, 20, 6),
        height: validateNumber(aiResponse.drawing?.mouth?.height, 1, 10, 3),
        shape: (aiResponse.drawing?.mouth?.shape as 'line' | 'oval' | 'curve') || 'line'
      }
    },

    coloring: {
      // 体の色
      baseColor: validateColor(aiResponse.colors?.body, '#ff6b6b'),
      
      // ヒレの色
      finColors: {
        dorsal: validateColor(aiResponse.colors?.fins?.dorsal, '#ff8e8e'),
        pectoral: validateColor(aiResponse.colors?.fins?.pectoral, '#ff8e8e'),
        tail: validateColor(aiResponse.colors?.fins?.tail, '#ff8e8e'),
        ventral: validateColor(aiResponse.colors?.fins?.ventral, '#ff8e8e'),
        anal: validateColor(aiResponse.colors?.fins?.anal, '#ff8e8e')
      },

      // 目の色
      eyeColor: validateColor(aiResponse.colors?.eyes, '#2c2c2c'),
      pupilColor: validateColor(aiResponse.colors?.pupils, '#000000'),

      // 光沢効果
      shimmer: aiResponse.effects?.shimmer ? {
        color: validateColor(aiResponse.effects.shimmer.color, '#ffffff'),
        intensity: validateNumber(aiResponse.effects.shimmer.intensity, 0, 1, 0.3),
        pattern: (aiResponse.effects.shimmer.pattern as 'random' | 'scales' | 'stripes') || 'random'
      } : {
        color: '#ffffff',
        intensity: 0.2,
        pattern: 'random'
      },

      // パターン
      patterns: aiResponse.colors?.patterns?.map(pattern => ({
        type: (pattern.type as 'spots' | 'stripes' | 'swirls' | 'scales' | 'abstract') || 'spots',
        color: validateColor(pattern.color, '#ffcccc'),
        opacity: validateNumber(pattern.opacity, 0, 1, 0.5),
        scale: validateNumber((pattern as any).scale, 0.1, 3, 1),
        positions: Array.isArray(pattern.positions) 
          ? pattern.positions.map(pos => ({ x: pos.x || 0, y: pos.y || 0 }))
          : []
      })) || []
    },

    description: aiResponse.description || 'AI生成された美しい金魚',
    culturalBackground: aiResponse.culturalBackground || undefined,

    boundingBox: boundingBox,

    createdAt: new Date(),
    aiModel: aiModel,
    generationTime: Date.now() // 実際の生成時間は呼び出し元で設定
  };

  return fishDesign;
}

// AI応答データの基本検証
export function validateAIResponseData(data: unknown): data is AIFishGenerationResponse['data'] {
  if (!data || typeof data !== 'object') return false;

  const obj = data as Record<string, unknown>;

  // 必須プロパティの確認
  return (
    typeof obj.name === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.drawing === 'object' &&
    typeof obj.colors === 'object'
  );
}

// デバッグ用の変換結果サマリー
export function summarizeConvertedFishDesign(design: AIFishDesign): string {
  return `
AI Fish Design Summary:
━━━━━━━━━━━━━━━━━━━━━━
Name: ${design.name}
ID: ${design.id}

Shape Data:
  Body Points: ${design.shape.bodyPath.length}
  Fins: ${Object.keys(design.shape).filter(k => k.includes('Fin')).length}
  
Colors:
  Body: ${design.coloring.baseColor}
  Eyes: ${design.coloring.eyeColor}
  Shimmer: ${design.coloring.shimmer?.color} (${(design.coloring.shimmer?.intensity || 0) * 100}%)

Dimensions:
  Bounding Box: ${design.boundingBox.width}x${design.boundingBox.height}
  
Generation Info:
  Model: ${design.aiModel}
  Created: ${design.createdAt.toLocaleString()}
━━━━━━━━━━━━━━━━━━━━━━
  `.trim();
}

// エラー用のフォールバック魚デザイン
export function createFallbackFishDesign(errorMessage: string = 'AI生成エラー'): AIFishDesign {
  return {
    id: `fallback-fish-${Date.now()}`,
    name: '基本金魚',
    
    generationParams: {
      concept: 'traditional',
      mood: 'calm',
      colorTone: 'warm',
      scale: 'medium',
      complexity: 'simple',
      creativityLevel: 0.5
    },

    shape: {
      bodyPath: [
        { x: -60, y: 0 }, { x: -40, y: -25 }, { x: 0, y: -30 },
        { x: 40, y: -15 }, { x: 50, y: 0 }, { x: 40, y: 15 },
        { x: 0, y: 30 }, { x: -40, y: 25 }, { x: -60, y: 0 }
      ],
      
      dorsalFin: [{ x: 0, y: -30 }, { x: 5, y: -45 }, { x: 15, y: -35 }],
      tailFin: [{ x: -60, y: -15 }, { x: -80, y: 0 }, { x: -60, y: 15 }],
      pectoralFin: [{ x: 20, y: -10 }, { x: 35, y: -5 }, { x: 30, y: 10 }],

      leftEye: { center: { x: 25, y: -10 }, radius: 6, shape: 'circle' },
      rightEye: { center: { x: 25, y: 10 }, radius: 6, shape: 'circle' },
      mouth: { center: { x: 45, y: 0 }, width: 4, height: 2, shape: 'line' }
    },

    coloring: {
      baseColor: '#ff6b6b',
      finColors: { dorsal: '#ff8e8e', tail: '#ff8e8e', pectoral: '#ff8e8e' },
      eyeColor: '#2c2c2c',
      pupilColor: '#000000',
      shimmer: { color: '#ffffff', intensity: 0.2, pattern: 'random' },
      patterns: []
    },

    description: `フォールバック用の基本金魚デザインです。${errorMessage}`,
    boundingBox: { x: -80, y: -45, width: 130, height: 90 },
    
    createdAt: new Date(),
    aiModel: 'fallback',
    generationTime: 0
  };
}