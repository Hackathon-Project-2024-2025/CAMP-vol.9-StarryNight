// AI設定からCreate設定への変換システム
// AISelectionsをFishDesignに変換する機能を提供

import type { AISelections } from '../../types/ai.types';
import type { FishDesign } from '../../types/common.types';
import type { AIToCreateConversionMap } from '../../types/i2i.types';

// AI選択からFishDesign設定への変換マップ
const conversionMap: AIToCreateConversionMap = {
  bodyType: {
    round: {
      shape: 'round',
      defaultColor: '#ff6b6b'
    },
    streamlined: {
      shape: 'streamlined', 
      defaultColor: '#3b82f6'
    },
    flat: {
      shape: 'flat',
      defaultColor: '#10b981'
    },
    elongated: {
      shape: 'elongated',
      defaultColor: '#f59e0b'
    }
  },
  baseColor: {
    red: {
      bodyColor: '#ff6b6b',
      finColor: '#ff5252'
    },
    blue: {
      bodyColor: '#3b82f6',
      finColor: '#2563eb'
    },
    yellow: {
      bodyColor: '#fbbf24',
      finColor: '#f59e0b'
    },
    white: {
      bodyColor: '#f8fafc',
      finColor: '#e2e8f0'
    },
    black: {
      bodyColor: '#1f2937',
      finColor: '#374151'
    },
    colorful: {
      bodyColor: '#ec4899',
      finColor: '#be185d'
    }
  },
  size: {
    small: {
      scale: 0.7
    },
    medium: {
      scale: 1.0
    },
    large: {
      scale: 1.3
    }
  },
  fins: {
    standard: {
      finSize: 1.0,
      finType: 'triangular'
    },
    large: {
      finSize: 1.4,
      finType: 'triangular'
    },
    decorative: {
      finSize: 1.2,
      finType: 'spiky'
    },
    simple: {
      finSize: 0.8,
      finType: 'triangular'
    }
  },
  eyes: {
    normal: {
      eyeSize: 1.0,
      eyeType: 'circle'
    },
    large: {
      eyeSize: 1.3,
      eyeType: 'circle'
    },
    small: {
      eyeSize: 0.7,
      eyeType: 'circle'
    },
    distinctive: {
      eyeSize: 1.1,
      eyeType: 'sleepy'
    }
  },
  pattern: {
    none: {
      patternType: 'none',
      intensity: 0
    },
    spotted: {
      patternType: 'spotted',
      intensity: 0.7
    },
    striped: {
      patternType: 'striped',
      intensity: 0.6
    },
    polka: {
      patternType: 'polka',
      intensity: 0.5
    },
    gradient: {
      patternType: 'gradient',
      intensity: 0.8
    }
  }
};

// AISelectionsをFishDesignに変換する関数
export function convertAISelectionsToFishDesign(aiSelections: AISelections): FishDesign {
  // 体型変換
  const bodyTypeMapping = conversionMap.bodyType[aiSelections.bodyType];
  const colorMapping = conversionMap.baseColor[aiSelections.baseColor];
  const sizeMapping = conversionMap.size[aiSelections.size];
  const finMapping = conversionMap.fins[aiSelections.fins];
  const eyeMapping = conversionMap.eyes[aiSelections.eyes];
  const patternMapping = conversionMap.pattern[aiSelections.pattern];

  // パーソナリティによる微調整
  const personalityAdjustments = getPersonalityAdjustments(aiSelections.personality);
  
  // 基本的なFishDesign構造を構築
  const fishDesign: FishDesign = {
    id: `ai-generated-${Date.now()}`,
    name: generateFishName(aiSelections),
    base: {
      id: `base-${bodyTypeMapping.shape}`,
      name: getBaseTypeName(bodyTypeMapping.shape),
      shape: bodyTypeMapping.shape,
      renderData: {
        shape: bodyTypeMapping.shape,
        size: sizeMapping.scale,
        color: colorMapping.bodyColor
      }
    },
    parts: {
      dorsalFin: {
        id: `dorsal-${finMapping.finType}`,
        name: getFinName('dorsal', finMapping.finType),
        category: 'dorsalFin',
        renderData: {
          shape: finMapping.finType,
          size: finMapping.finSize * personalityAdjustments.finSizeMultiplier,
          color: colorMapping.finColor
        }
      },
      pectoralFins: {
        id: `pectoral-${finMapping.finType}`,
        name: getFinName('pectoral', finMapping.finType),
        category: 'pectoralFins',
        renderData: {
          shape: finMapping.finType === 'spiky' ? 'elongated' : 'standard',
          size: finMapping.finSize * 0.8,
          color: colorMapping.finColor
        }
      },
      tailFin: {
        id: `tail-${getTailType(aiSelections.personality)}`,
        name: getFinName('tail', getTailType(aiSelections.personality)),
        category: 'tailFin',
        renderData: {
          shape: getTailType(aiSelections.personality),
          size: finMapping.finSize * personalityAdjustments.tailSizeMultiplier,
          color: colorMapping.finColor
        }
      },
      eyes: {
        id: `eyes-${eyeMapping.eyeType}${eyeMapping.eyeSize > 1.2 ? '-large' : ''}`,
        name: getEyeName(eyeMapping.eyeType, eyeMapping.eyeSize),
        category: 'eyes',
        renderData: {
          shape: eyeMapping.eyeType,
          size: eyeMapping.eyeSize * personalityAdjustments.eyeSizeMultiplier,
          color: getEyeColor(aiSelections.baseColor)
        }
      },
      mouth: {
        id: `mouth-${getMouthSize(aiSelections.personality)}`,
        name: getMouthName(getMouthSize(aiSelections.personality)),
        category: 'mouth',
        renderData: {
          shape: getMouthSize(aiSelections.personality),
          size: personalityAdjustments.mouthSizeMultiplier,
          color: '#2d3748'
        }
      },
      scales: {
        id: 'scales-basic',
        name: '基本ウロコ',
        category: 'scales',
        renderData: {
          shape: 'basic',
          size: 1.0,
          color: colorMapping.bodyColor
        }
      }
    },
    customizations: {
      size: sizeMapping.scale * personalityAdjustments.sizeMultiplier,
      bodyColor: colorMapping.bodyColor,
      finColor: colorMapping.finColor,
      eyeColor: getEyeColor(aiSelections.baseColor),
      finSize: finMapping.finSize,
      eyeSize: eyeMapping.eyeSize,
      
      // 位置調整（パーソナリティベース）
      eyePosition: personalityAdjustments.eyePosition,
      mouthPosition: personalityAdjustments.mouthPosition,
      dorsalFinPosition: personalityAdjustments.dorsalFinPosition,
      pectoralFinPosition: personalityAdjustments.pectoralFinPosition,
      tailFinPosition: personalityAdjustments.tailFinPosition
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // 体の模様を追加（パターンが指定されている場合）
  if (patternMapping.patternType !== 'none') {
    fishDesign.bodyPattern = {
      type: patternMapping.patternType,
      colors: getPatternColors(patternMapping.patternType, colorMapping.bodyColor),
      intensity: patternMapping.intensity,
      scale: personalityAdjustments.patternScale,
      direction: getPatternDirection(aiSelections.personality),
      seed: Math.floor(Math.random() * 100000)
    };
  }

  // アクセサリーを追加
  const accessories = generateAccessoriesFromSelections(aiSelections);
  if (accessories.length > 0) {
    fishDesign.accessories = accessories;
  }

  return fishDesign;
}

// パーソナリティによる調整値を取得
function getPersonalityAdjustments(personality: AISelections['personality']) {
  switch (personality) {
    case 'calm':
      return {
        sizeMultiplier: 1.0,
        finSizeMultiplier: 0.9,
        eyeSizeMultiplier: 0.95,
        tailSizeMultiplier: 0.8,
        mouthSizeMultiplier: 0.9,
        patternScale: 0.8,
        eyePosition: { x: 0, y: -0.1 },
        mouthPosition: { x: 0, y: 0 },
        dorsalFinPosition: { x: 0, y: 0 },
        pectoralFinPosition: { x: 0, y: 0 },
        tailFinPosition: { x: 0, y: 0 }
      };
    case 'active':
      return {
        sizeMultiplier: 1.1,
        finSizeMultiplier: 1.2,
        eyeSizeMultiplier: 1.1,
        tailSizeMultiplier: 1.3,
        mouthSizeMultiplier: 1.0,
        patternScale: 1.2,
        eyePosition: { x: 0.05, y: -0.05 },
        mouthPosition: { x: 0, y: 0.1 },
        dorsalFinPosition: { x: -0.1, y: -0.1 },
        pectoralFinPosition: { x: 0.1, y: 0 },
        tailFinPosition: { x: -0.2, y: 0 }
      };
    case 'elegant':
      return {
        sizeMultiplier: 1.05,
        finSizeMultiplier: 1.1,
        eyeSizeMultiplier: 1.0,
        tailSizeMultiplier: 1.4,
        mouthSizeMultiplier: 0.8,
        patternScale: 0.9,
        eyePosition: { x: -0.05, y: -0.1 },
        mouthPosition: { x: 0, y: -0.05 },
        dorsalFinPosition: { x: 0, y: -0.2 },
        pectoralFinPosition: { x: 0, y: -0.1 },
        tailFinPosition: { x: 0, y: 0 }
      };
    case 'unique':
      return {
        sizeMultiplier: 1.15,
        finSizeMultiplier: 1.3,
        eyeSizeMultiplier: 1.2,
        tailSizeMultiplier: 1.1,
        mouthSizeMultiplier: 1.1,
        patternScale: 1.3,
        eyePosition: { x: 0.1, y: 0 },
        mouthPosition: { x: 0.05, y: 0.05 },
        dorsalFinPosition: { x: -0.05, y: -0.15 },
        pectoralFinPosition: { x: 0.15, y: 0.1 },
        tailFinPosition: { x: -0.1, y: 0.1 }
      };
    default:
      return {
        sizeMultiplier: 1.0,
        finSizeMultiplier: 1.0,
        eyeSizeMultiplier: 1.0,
        tailSizeMultiplier: 1.0,
        mouthSizeMultiplier: 1.0,
        patternScale: 1.0,
        eyePosition: { x: 0, y: 0 },
        mouthPosition: { x: 0, y: 0 },
        dorsalFinPosition: { x: 0, y: 0 },
        pectoralFinPosition: { x: 0, y: 0 },
        tailFinPosition: { x: 0, y: 0 }
      };
  }
}

// 尾ビレの種類を決定（パーソナリティベース）
function getTailType(personality: AISelections['personality']): 'fan' | 'forked' | 'ribbon' {
  switch (personality) {
    case 'calm': return 'fan';
    case 'active': return 'forked';
    case 'elegant': return 'ribbon';
    case 'unique': return Math.random() > 0.5 ? 'forked' : 'ribbon';
    default: return 'fan';
  }
}

// 口のサイズを決定
function getMouthSize(personality: AISelections['personality']): 'small' | 'large' {
  return ['active', 'unique'].includes(personality) ? 'large' : 'small';
}

// 目の色を決定
function getEyeColor(baseColor: AISelections['baseColor']): string {
  const eyeColorMap = {
    red: '#1f2937',
    blue: '#1f2937', 
    yellow: '#1f2937',
    white: '#1f2937',
    black: '#f59e0b',
    colorful: '#7c3aed'
  };
  return eyeColorMap[baseColor];
}

// 模様の色を生成
function getPatternColors(patternType: string, baseColor: string): string[] {
  switch (patternType) {
    case 'spotted':
      return ['#ffffff', adjustBrightness(baseColor, 40)];
    case 'striped':
      return [baseColor, adjustBrightness(baseColor, -40), '#ffffff'];
    case 'polka':
      return ['#ffffff'];
    case 'calico':
      return ['#ff6b6b', '#ffffff', '#2c3e50'];
    case 'gradient':
      return [baseColor, adjustBrightness(baseColor, -60)];
    default:
      return [baseColor];
  }
}

// 模様の方向を決定
function getPatternDirection(personality: AISelections['personality']): 'horizontal' | 'vertical' | 'diagonal' {
  switch (personality) {
    case 'calm': return 'horizontal';
    case 'active': return 'diagonal';
    case 'elegant': return 'vertical';
    case 'unique': return Math.random() > 0.66 ? 'diagonal' : Math.random() > 0.5 ? 'vertical' : 'horizontal';
    default: return 'horizontal';
  }
}

// アクセサリーを生成
function generateAccessoriesFromSelections(aiSelections: AISelections) {
  const accessories = [];
  
  // 頭部アクセサリー
  if (aiSelections.headAccessory !== 'none') {
    accessories.push({
      id: `head-${aiSelections.headAccessory}-${Date.now()}`,
      name: getAccessoryName(aiSelections.headAccessory),
      category: aiSelections.headAccessory,
      position: { x: 0, y: -0.2 },
      size: 1.0,
      rotation: 0,
      color: getAccessoryColor(aiSelections.headAccessory),
      visible: true
    });
  }

  // 顔アクセサリー
  if (aiSelections.faceAccessory !== 'none') {
    accessories.push({
      id: `face-${aiSelections.faceAccessory}-${Date.now()}`,
      name: getAccessoryName(aiSelections.faceAccessory),
      category: aiSelections.faceAccessory,
      position: { x: 0, y: 0 },
      size: 1.0,
      rotation: 0,
      color: getAccessoryColor(aiSelections.faceAccessory),
      visible: true
    });
  }

  // 首アクセサリー
  if (aiSelections.neckAccessory !== 'none') {
    const category = aiSelections.neckAccessory === 'bowtie' ? 'bow' : aiSelections.neckAccessory;
    accessories.push({
      id: `neck-${category}-${Date.now()}`,
      name: getAccessoryName(aiSelections.neckAccessory),
      category: category,
      position: { x: 0, y: 0.3 },
      size: 1.0,
      rotation: 0,
      color: getAccessoryColor(aiSelections.neckAccessory),
      visible: true
    });
  }

  return accessories;
}

// 名前生成関数群
function generateFishName(aiSelections: AISelections): string {
  const personalityNames = {
    calm: ['しずか', 'やすらぎ', 'のどか', 'まどか'],
    active: ['げんき', 'いきいき', 'ぴょんぴょん', 'すいすい'],
    elegant: ['みやび', 'あでやか', 'うつくし', 'きらり'],
    unique: ['ふしぎ', 'めずらし', 'ユニーク', 'こせい']
  };
  
  const colorNames = {
    red: '赤',
    blue: '青', 
    yellow: '黄',
    white: '白',
    black: '黒',
    colorful: '虹'
  };

  const baseNames = personalityNames[aiSelections.personality];
  const colorName = colorNames[aiSelections.baseColor];
  const baseName = baseNames[Math.floor(Math.random() * baseNames.length)];
  
  return `${colorName}の${baseName}`;
}

function getBaseTypeName(shape: string): string {
  const names = {
    round: '丸型金魚',
    streamlined: '流線型金魚',
    flat: '平型金魚',
    elongated: '細長型金魚'
  };
  return names[shape as keyof typeof names] || '金魚';
}

function getFinName(finType: string, shape: string): string {
  const finTypes = {
    dorsal: '背ビレ',
    pectoral: '胸ビレ',
    tail: '尾ビレ'
  };
  
  const shapes = {
    triangular: '三角',
    spiky: 'ギザギザ',
    fan: '扇型',
    forked: '二股',
    ribbon: 'リボン',
    elongated: '長型',
    standard: '標準'
  };
  
  return `${shapes[shape as keyof typeof shapes] || shape}${finTypes[finType as keyof typeof finTypes] || finType}`;
}

function getEyeName(shape: string, size: number): string {
  const sizeStr = size > 1.2 ? '大きな' : size < 0.8 ? '小さな' : '';
  const shapeStr = shape === 'sleepy' ? '眠そうな' : '';
  return `${sizeStr}${shapeStr}目`;
}

function getMouthName(size: string): string {
  return size === 'large' ? '大きな口' : '小さな口';
}

function getAccessoryName(accessory: string): string {
  const names = {
    crown: '王冠',
    hat: '帽子',
    ribbon: 'リボン',
    glasses: 'メガネ',
    sunglasses: 'サングラス',
    necklace: 'ネックレス',
    bowtie: '蝶ネクタイ'
  };
  return names[accessory as keyof typeof names] || accessory;
}

function getAccessoryColor(accessory: string): string {
  const colors = {
    crown: '#ffd700',
    hat: '#8b4513',
    ribbon: '#ff69b4',
    glasses: '#34495e',
    sunglasses: '#2c3e50',
    necklace: '#e74c3c',
    bowtie: '#8b4513'
  };
  return colors[accessory as keyof typeof colors] || '#ffd700';
}

// 色の明度調整ヘルパー関数
function adjustBrightness(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

export default {
  convertAISelectionsToFishDesign
};