import type { AIFishDesign } from '../../types/aiFish.types';
import type { FishDesign, FishBase, SelectedParts, FishCustomizations } from '../../types/common.types';

/**
 * AI生成金魚（AIFishDesign）を従来の金魚システム（FishDesign）に変換
 * 水槽表示システム（Aquarium.tsx）との互換性を保つため
 */
export function convertAIFishToCompatibleDesign(aiFish: AIFishDesign, fishName: string): FishDesign {
  // ベース情報の構築
  const compatibleBase: FishBase = {
    id: 'ai-generated-base',
    name: 'AI生成ベース',
    shape: inferBodyShapeFromAIFish(aiFish),
    defaultColor: aiFish.coloring.baseColor,
    size: { width: Math.abs(aiFish.boundingBox.width), height: Math.abs(aiFish.boundingBox.height) },
    description: aiFish.description || 'AI生成による美しい金魚'
  };

  // パーツ情報の構築（renderDataを含む完全な構造）
  const compatibleParts: SelectedParts = {
    dorsalFin: {
      id: 'ai-dorsal-fin',
      name: 'AI背ビレ',
      category: 'dorsalFin',
      thumbnail: '',
      description: 'AI生成背ビレ',
      renderData: {
        shape: inferFinShape(aiFish.shape.dorsalFin),
        size: calculateFinSize(aiFish.shape.dorsalFin),
        color: aiFish.coloring.finColors.dorsal || aiFish.coloring.baseColor
      }
    },
    pectoralFins: {
      id: 'ai-pectoral-fins',
      name: 'AI胸ビレ',
      category: 'pectoralFins',
      thumbnail: '',
      description: 'AI生成胸ビレ',
      renderData: {
        shape: inferFinShape(aiFish.shape.pectoralFin),
        size: calculateFinSize(aiFish.shape.pectoralFin),
        color: aiFish.coloring.finColors.pectoral || aiFish.coloring.baseColor
      }
    },
    tailFin: {
      id: 'ai-tail-fin',
      name: 'AI尾ビレ',
      category: 'tailFin',
      thumbnail: '',
      description: 'AI生成尾ビレ',
      renderData: {
        shape: inferFinShape(aiFish.shape.tailFin),
        size: calculateFinSize(aiFish.shape.tailFin),
        color: aiFish.coloring.finColors.tail || aiFish.coloring.baseColor
      }
    },
    eyes: {
      id: 'ai-eyes',
      name: 'AI目',
      category: 'eyes',
      thumbnail: '',
      description: 'AI生成の目',
      renderData: {
        shape: aiFish.shape.leftEye.shape || 'round',
        size: Math.max(0.5, Math.min(2.0, aiFish.shape.leftEye.radius / 8)), // 正規化
        color: aiFish.coloring.eyeColor
      }
    },
    mouth: {
      id: 'ai-mouth',
      name: 'AI口',
      category: 'mouth',
      thumbnail: '',
      description: 'AI生成の口',
      renderData: {
        shape: aiFish.shape.mouth.shape || 'small',
        size: Math.max(0.5, Math.min(2.0, aiFish.shape.mouth.width / 6)), // 正規化
        color: '#8B4513'
      }
    },
    scales: {
      id: 'ai-scales',
      name: 'AI鱗',
      category: 'scales',
      thumbnail: '',
      description: 'AI生成の鱗',
      renderData: {
        shape: 'basic',
        size: 1.0,
        color: aiFish.coloring.baseColor
      }
    }
  };

  // カスタマイゼーション情報の構築
  const compatibleCustomizations: FishCustomizations = {
    bodyColor: aiFish.coloring.baseColor,
    finColor: aiFish.coloring.finColors.dorsal || aiFish.coloring.baseColor,
    eyeColor: aiFish.coloring.eyeColor,
    size: calculateOverallSize(aiFish),
    finSize: calculateAverageFinSize(aiFish),
    eyeSize: Math.max(0.5, Math.min(1.5, aiFish.shape.leftEye.radius / 8)),
    
    // 位置情報（AI魚の座標を正規化された位置に変換）
    eyePosition: normalizePosition(aiFish.shape.leftEye.center, aiFish.boundingBox),
    mouthPosition: normalizePosition(aiFish.shape.mouth.center, aiFish.boundingBox),
    dorsalFinPosition: { x: 0, y: -0.3 }, // 典型的な位置
    tailFinPosition: { x: -0.8, y: 0 },   // 典型的な位置
    pectoralFinPosition: { x: 0.3, y: 0.1 } // 典型的な位置
  };

  // 体の模様を変換（AI魚のパターンがあれば）
  const bodyPattern = aiFish.coloring.patterns && aiFish.coloring.patterns.length > 0 
    ? {
        id: 'ai-pattern',
        name: 'AI生成パターン',
        type: mapPatternType(aiFish.coloring.patterns[0].type) as 'solid' | 'spotted' | 'striped' | 'polka' | 'calico' | 'gradient',
        description: 'AI生成による体の模様',
        colors: aiFish.coloring.patterns.map(p => p.color),
        intensity: aiFish.coloring.patterns[0].opacity || 0.6,
        scale: aiFish.coloring.patterns[0].scale || 1.0,
        seed: Math.floor(Math.random() * 100000)
      }
    : undefined;

  // 完全なFishDesignオブジェクトを構築
  const compatibleFishDesign: FishDesign = {
    id: aiFish.id,
    name: fishName,
    base: compatibleBase,
    parts: compatibleParts,
    customizations: compatibleCustomizations,
    bodyPattern: bodyPattern,
    accessories: [], // AI魚のアクセサリーは複雑すぎるため省略
    createdAt: aiFish.createdAt
  };

  return compatibleFishDesign;
}

// AI魚の体形状から従来の体型を推定
function inferBodyShapeFromAIFish(aiFish: AIFishDesign): 'round' | 'streamlined' | 'flat' | 'elongated' {
  const { width, height } = aiFish.boundingBox;
  const aspectRatio = width / height;

  if (aspectRatio > 2.5) return 'elongated';
  if (aspectRatio > 1.8) return 'streamlined';
  if (aspectRatio < 1.2) return 'flat';
  return 'round';
}

// AI魚のヒレデータからヒレの形状を推定
function inferFinShape(finData: any): string {
  if (!finData || !Array.isArray(finData)) return 'triangular';
  
  const pointCount = finData.length;
  if (pointCount > 6) return 'decorative';
  if (pointCount > 4) return 'fan';
  if (pointCount > 2) return 'triangular';
  return 'simple';
}

// ヒレのサイズを計算（正規化）
function calculateFinSize(finData: any): number {
  if (!finData || !Array.isArray(finData) || finData.length < 2) return 1.0;
  
  // ヒレの点群から概算サイズを計算
  const xs = finData.map((p: any) => p.x || 0);
  const ys = finData.map((p: any) => p.y || 0);
  const width = Math.max(...xs) - Math.min(...xs);
  const height = Math.max(...ys) - Math.min(...ys);
  const size = Math.sqrt(width * width + height * height);
  
  return Math.max(0.7, Math.min(1.5, size / 50)); // 正規化
}

// 全体的なサイズを計算
function calculateOverallSize(aiFish: AIFishDesign): number {
  const { width, height } = aiFish.boundingBox;
  const area = Math.abs(width * height);
  const normalizedSize = Math.sqrt(area) / 100; // 正規化
  
  return Math.max(0.5, Math.min(2.0, normalizedSize));
}

// 平均的なヒレサイズを計算
function calculateAverageFinSize(aiFish: AIFishDesign): number {
  const fins = [
    aiFish.shape.dorsalFin,
    aiFish.shape.pectoralFin,
    aiFish.shape.tailFin
  ];
  
  const sizes = fins
    .filter(fin => fin && Array.isArray(fin))
    .map(fin => calculateFinSize(fin));
  
  if (sizes.length === 0) return 1.0;
  
  const averageSize = sizes.reduce((sum, size) => sum + size, 0) / sizes.length;
  return Math.max(0.7, Math.min(1.3, averageSize));
}

// AI魚の絶対座標を正規化された位置（-1 ~ 1）に変換
function normalizePosition(absolutePos: { x: number; y: number }, boundingBox: { x: number; y: number; width: number; height: number }): { x: number; y: number } {
  const normalizedX = ((absolutePos.x - boundingBox.x) / boundingBox.width - 0.5) * 2;
  const normalizedY = ((absolutePos.y - boundingBox.y) / boundingBox.height - 0.5) * 2;
  
  return {
    x: Math.max(-1, Math.min(1, normalizedX)),
    y: Math.max(-1, Math.min(1, normalizedY))
  };
}

// AI魚のパターンタイプを従来システムにマッピング
function mapPatternType(aiPatternType: string): string {
  const mappings = {
    'spots': 'spotted',
    'stripes': 'striped',
    'swirls': 'polka',
    'scales': 'spotted',
    'abstract': 'calico'
  };
  
  return mappings[aiPatternType as keyof typeof mappings] || 'solid';
}

// 変換結果の検証
export function validateCompatibleFishDesign(design: FishDesign): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 必須プロパティの検証
  if (!design.id) errors.push('Missing fish ID');
  if (!design.name) errors.push('Missing fish name');
  if (!design.base) errors.push('Missing base information');
  if (!design.parts) errors.push('Missing parts information');
  if (!design.customizations) errors.push('Missing customizations');

  // パーツのrenderData検証
  if (design.parts) {
    const requiredParts = ['dorsalFin', 'pectoralFins', 'tailFin', 'eyes', 'mouth', 'scales'];
    requiredParts.forEach(partName => {
      const part = design.parts[partName as keyof typeof design.parts];
      if (!part) {
        errors.push(`Missing part: ${partName}`);
      } else if (!part.renderData) {
        errors.push(`Missing renderData for part: ${partName}`);
      } else {
        if (!part.renderData.shape) warnings.push(`Missing shape for part: ${partName}`);
        if (typeof part.renderData.size !== 'number') warnings.push(`Invalid size for part: ${partName}`);
      }
    });
  }

  // カスタマイゼーションの検証
  if (design.customizations) {
    const colorRegex = /^#[0-9a-fA-F]{6}$/;
    if (!colorRegex.test(design.customizations.bodyColor)) {
      errors.push('Invalid body color format');
    }
    if (!colorRegex.test(design.customizations.finColor)) {
      errors.push('Invalid fin color format');
    }
    if (!colorRegex.test(design.customizations.eyeColor)) {
      errors.push('Invalid eye color format');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// デバッグ用の変換結果サマリー
export function summarizeConversion(original: AIFishDesign, converted: FishDesign): string {
  return `
AI Fish → Compatible Fish Conversion Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Original AI Fish:
  ID: ${original.id}
  Name: ${original.name}
  Bounding Box: ${original.boundingBox.width}x${original.boundingBox.height}
  Base Color: ${original.coloring.baseColor}
  Eye Color: ${original.coloring.eyeColor}
  Patterns: ${original.coloring.patterns?.length || 0}

Converted Compatible Fish:
  ID: ${converted.id}
  Name: ${converted.name}
  Base Shape: ${converted.base.shape}
  Body Color: ${converted.customizations.bodyColor}
  Fin Color: ${converted.customizations.finColor}
  Eye Color: ${converted.customizations.eyeColor}
  
Parts with renderData:
  - Dorsal Fin: ${converted.parts.dorsalFin.renderData.shape} (size: ${converted.parts.dorsalFin.renderData.size})
  - Pectoral Fins: ${converted.parts.pectoralFins.renderData.shape} (size: ${converted.parts.pectoralFins.renderData.size})
  - Tail Fin: ${converted.parts.tailFin.renderData.shape} (size: ${converted.parts.tailFin.renderData.size})
  - Eyes: ${converted.parts.eyes.renderData.shape} (size: ${converted.parts.eyes.renderData.size})
  - Mouth: ${converted.parts.mouth.renderData.shape} (size: ${converted.parts.mouth.renderData.size})
  - Scales: ${converted.parts.scales.renderData.shape} (size: ${converted.parts.scales.renderData.size})

Body Pattern: ${converted.bodyPattern ? `${converted.bodyPattern.type} (${converted.bodyPattern.colors?.length || 0} colors)` : 'None'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `.trim();
}