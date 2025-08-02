import { useState } from 'react';
import type { FishDesign, FishBase, SelectedParts, FishCustomizations, BodyPattern, Accessory, RandomGenerationOptions } from '../../../types/common.types';
import './RandomGenerator.css';

interface RandomGeneratorProps {
  currentDesign: FishDesign;
  onDesignGenerate: (newDesign: FishDesign) => void;
}

// 利用可能な魚ベース
const availableBases: FishBase[] = [
  {
    id: 'base-round',
    name: '丸型',
    shape: 'round',
    defaultColor: '#ff6b6b',
    size: { width: 100, height: 60 },
    description: '丸みを帯びた可愛らしい体型'
  },
  {
    id: 'base-streamlined',
    name: '流線型',
    shape: 'streamlined',
    defaultColor: '#4ecdc4',
    size: { width: 120, height: 50 },
    description: 'スピード重視の流線型'
  },
  {
    id: 'base-flat',
    name: '平型',
    shape: 'flat',
    defaultColor: '#ffa500',
    size: { width: 100, height: 30 },
    description: '横に平たい体型'
  },
  {
    id: 'base-elongated',
    name: '細長型',
    shape: 'elongated',
    defaultColor: '#9370db',
    size: { width: 150, height: 40 },
    description: 'ウナギのような細長い体型'
  }
];

// 利用可能なパーツ
const availablePartsList = {
  dorsalFin: [
    { id: 'dorsal-basic', name: '基本背ビレ', shape: 'triangular', size: 1.0 },
    { id: 'dorsal-large', name: '大きな背ビレ', shape: 'triangular', size: 1.5 },
    { id: 'dorsal-spiky', name: 'トゲトゲ背ビレ', shape: 'spiky', size: 1.2 }
  ],
  pectoralFins: [
    { id: 'pectoral-basic', name: '基本胸ビレ', shape: 'oval', size: 1.0 },
    { id: 'pectoral-long', name: '長い胸ビレ', shape: 'elongated', size: 1.3 }
  ],
  tailFin: [
    { id: 'tail-fan', name: '扇型尾ビレ', shape: 'fan', size: 1.0 },
    { id: 'tail-forked', name: '二股尾ビレ', shape: 'forked', size: 1.2 },
    { id: 'tail-ribbon', name: 'リボン尾ビレ', shape: 'ribbon', size: 1.4 }
  ],
  eyes: [
    { id: 'eyes-round', name: '丸い目', shape: 'circle', size: 1.0 },
    { id: 'eyes-large', name: '大きな目', shape: 'circle', size: 1.5 },
    { id: 'eyes-sleepy', name: '眠そうな目', shape: 'sleepy', size: 1.0 }
  ],
  mouth: [
    { id: 'mouth-small', name: '小さい口', shape: 'small', size: 1.0 },
    { id: 'mouth-large', name: '大きな口', shape: 'large', size: 1.5 }
  ],
  scales: [
    { id: 'scales-basic', name: '基本ウロコ', shape: 'basic', size: 1.0 },
    { id: 'scales-diamond', name: 'ダイヤウロコ', shape: 'diamond', size: 1.2 }
  ]
};

// 利用可能な色
const availableColors = [
  '#ff6b6b', '#ff9999', '#ffb7c5', '#ffa500', '#f4a261',
  '#45b7d1', '#4ecdc4', '#96ceb4', '#a8e6cf', '#9370db',
  '#ffd700', '#c0c0c0', '#000000', '#ffffff', '#808080',
  '#8b4513', '#ff1493', '#00ced1', '#32cd32', '#ff8c00'
];

// 利用可能な模様
const availablePatterns: BodyPattern[] = [
  {
    id: 'spotted',
    name: 'まだら模様',
    type: 'spotted',
    description: 'ランダムな斑点',
    colors: ['#ffffff'],
    intensity: 0.6,
    scale: 1.0
  },
  {
    id: 'striped-horizontal',
    name: '横縞模様',
    type: 'striped',
    description: '水平な縞模様',
    colors: ['#ffffff'],
    intensity: 0.7,
    scale: 1.0,
    direction: 'horizontal'
  },
  {
    id: 'striped-vertical',
    name: '縦縞模様',
    type: 'striped',
    description: '垂直な縞模様',
    colors: ['#ffffff'],
    intensity: 0.7,
    scale: 1.0,
    direction: 'vertical'
  },
  {
    id: 'polka',
    name: '水玉模様',
    type: 'polka',
    description: '規則的な水玉',
    colors: ['#ffffff'],
    intensity: 0.5,
    scale: 1.0
  },
  {
    id: 'calico',
    name: 'キャリコ',
    type: 'calico',
    description: '三色模様',
    colors: ['#ff6b6b', '#ffffff', '#2c3e50'],
    intensity: 0.8,
    scale: 1.2
  }
];

// 魚の解剖学的構造に基づくデフォルト位置（AccessorySelectorと統一）
const defaultPositions: Record<Accessory['category'], { x: number; y: number }> = {
  crown: { x: 0.2, y: -0.8 },      // 頭部上方（魚の頭の真上）
  hat: { x: 0.2, y: -0.9 },        // 頭部上方（少し高め）
  glasses: { x: 0.2, y: -0.3 },    // 目の位置（頭部前方）
  ribbon: { x: 0.0, y: -0.7 },     // 頭部上方（王冠より少し後ろ）
  bow: { x: 0.4, y: 0.15 }         // 胸部（首の下）
};

// 利用可能なアクセサリー
const availableAccessoryTemplates = [
  { id: 'crown-simple', name: 'シンプルな王冠', category: 'crown' as const, color: '#ffd700' },
  { id: 'crown-jeweled', name: 'ジュエル王冠', category: 'crown' as const, color: '#ffd700' },
  { id: 'hat-top', name: 'シルクハット', category: 'hat' as const, color: '#2c3e50' },
  { id: 'glasses-round', name: '丸メガネ', category: 'glasses' as const, color: '#34495e' },
  { id: 'glasses-sunglasses', name: 'サングラス', category: 'glasses' as const, color: '#2c3e50' },
  { id: 'ribbon-bow', name: 'リボン', category: 'ribbon' as const, color: '#ff69b4' },
  { id: 'bow-tie', name: '蝶ネクタイ', category: 'bow' as const, color: '#8b4513' }
];

// ランダム選択ヘルパー関数
const getRandomItem = <T,>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

const getRandomFloat = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export default function RandomGenerator({ currentDesign, onDesignGenerate }: RandomGeneratorProps) {
  const [options, setOptions] = useState<RandomGenerationOptions>({
    includeBase: true,
    includeParts: true,
    includeColors: true,
    includePatterns: true,
    includeAccessories: true,
    keepCurrentSizes: false
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const generateRandomDesign = () => {
    setIsGenerating(true);
    
    // アニメーション効果のための遅延
    setTimeout(() => {
      const newDesign = { ...currentDesign };

      // ベース形状のランダム生成
      if (options.includeBase) {
        newDesign.base = getRandomItem(availableBases);
      }

      // パーツのランダム生成
      if (options.includeParts) {
        const newParts: SelectedParts = {
          dorsalFin: {
            ...getRandomItem(availablePartsList.dorsalFin),
            category: 'dorsalFin',
            thumbnail: '',
            description: '',
            renderData: {
              shape: getRandomItem(availablePartsList.dorsalFin).shape,
              size: getRandomItem(availablePartsList.dorsalFin).size
            }
          },
          pectoralFins: {
            ...getRandomItem(availablePartsList.pectoralFins),
            category: 'pectoralFins',
            thumbnail: '',
            description: '',
            renderData: {
              shape: getRandomItem(availablePartsList.pectoralFins).shape,
              size: getRandomItem(availablePartsList.pectoralFins).size
            }
          },
          tailFin: {
            ...getRandomItem(availablePartsList.tailFin),
            category: 'tailFin',
            thumbnail: '',
            description: '',
            renderData: {
              shape: getRandomItem(availablePartsList.tailFin).shape,
              size: getRandomItem(availablePartsList.tailFin).size
            }
          },
          eyes: {
            ...getRandomItem(availablePartsList.eyes),
            category: 'eyes',
            thumbnail: '',
            description: '',
            renderData: {
              shape: getRandomItem(availablePartsList.eyes).shape,
              size: getRandomItem(availablePartsList.eyes).size
            }
          },
          mouth: {
            ...getRandomItem(availablePartsList.mouth),
            category: 'mouth',
            thumbnail: '',
            description: '',
            renderData: {
              shape: getRandomItem(availablePartsList.mouth).shape,
              size: getRandomItem(availablePartsList.mouth).size
            }
          },
          scales: {
            ...getRandomItem(availablePartsList.scales),
            category: 'scales',
            thumbnail: '',
            description: '',
            renderData: {
              shape: getRandomItem(availablePartsList.scales).shape,
              size: getRandomItem(availablePartsList.scales).size
            }
          }
        };
        newDesign.parts = newParts;
      }

      // 色のランダム生成
      if (options.includeColors) {
        const bodyColor = getRandomItem(availableColors);
        const finColor = getRandomItem(availableColors);
        const eyeColor = getRandomItem(['#000000', '#8b4513', '#2c3e50', '#34495e']);

        newDesign.customizations = {
          ...newDesign.customizations,
          bodyColor,
          finColor,
          eyeColor
        };
      }

      // サイズ・位置のランダム生成（現在のサイズを維持するオプション）
      if (!options.keepCurrentSizes) {
        const newCustomizations: FishCustomizations = {
          ...newDesign.customizations,
          size: getRandomFloat(0.7, 1.8),
          finSize: getRandomFloat(0.8, 1.5),
          eyeSize: getRandomFloat(0.7, 1.6),
          eyePosition: {
            x: getRandomFloat(-0.3, 0.1),
            y: getRandomFloat(-0.35, -0.15)
          },
          mouthPosition: {
            x: getRandomFloat(-0.1, 0.2),
            y: getRandomFloat(0.15, 0.5)
          },
          dorsalFinPosition: {
            x: getRandomFloat(-0.3, 0.3),
            y: getRandomFloat(-0.1, 0.1)
          },
          tailFinPosition: {
            x: getRandomFloat(-0.2, 0.2),
            y: getRandomFloat(-0.3, 0.3)
          },
          pectoralFinPosition: {
            x: getRandomFloat(-0.3, 0.3),
            y: getRandomFloat(-0.4, 0.4)
          }
        };
        newDesign.customizations = newCustomizations;
      }

      // 模様のランダム生成
      if (options.includePatterns) {
        if (Math.random() > 0.3) { // 70%の確率で模様を追加
          const pattern = { ...getRandomItem(availablePatterns) };
          pattern.intensity = getRandomFloat(0.3, 0.9);
          pattern.scale = getRandomFloat(0.5, 1.8);
          
          // パターンに応じた色の調整
          if (pattern.type === 'calico') {
            pattern.colors = ['#ff6b6b', '#ffffff', '#2c3e50'];
          } else {
            pattern.colors = [getRandomItem(availableColors)];
          }
          
          newDesign.bodyPattern = pattern;
        } else {
          newDesign.bodyPattern = undefined;
        }
      }

      // アクセサリーのランダム生成
      if (options.includeAccessories) {
        const accessories: Accessory[] = [];
        const numAccessories = getRandomInt(0, 3); // 0-3個のアクセサリー

        for (let i = 0; i < numAccessories; i++) {
          const template = getRandomItem(availableAccessoryTemplates);
          const basePosition = defaultPositions[template.category];
          const accessory: Accessory = {
            ...template,
            description: '',
            size: getRandomFloat(0.6, 1.4),
            rotation: getRandomInt(-15, 15),
            color: getRandomItem(availableColors),
            visible: true,
            position: {
              x: basePosition.x + getRandomFloat(-0.15, 0.15),
              y: basePosition.y + getRandomFloat(-0.1, 0.1)
            }
          };
          
          // 同じカテゴリーのアクセサリーは1つまで
          if (!accessories.some(acc => acc.category === accessory.category)) {
            accessories.push(accessory);
          }
        }
        
        newDesign.accessories = accessories;
      }

      // 新しいIDとタイムスタンプ
      newDesign.id = `fish-${Date.now()}`;
      newDesign.createdAt = new Date();

      onDesignGenerate(newDesign);
      setIsGenerating(false);
    }, 800); // アニメーション効果のための遅延
  };

  const handleOptionChange = (option: keyof RandomGenerationOptions, value: boolean) => {
    setOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  return (
    <div className="random-generator">
      <div className="generator-header">
        <h3 className="generator-title">🎲 おまかせ生成</h3>
        <p className="generator-description">
          ランダムな組み合わせで驚きの魚を作ってみましょう
        </p>
      </div>

      {/* 生成オプション */}
      <div className="generation-options">
        <h4 className="options-title">⚙️ 生成設定</h4>
        
        <div className="options-grid">
          <label className="option-item">
            <input
              type="checkbox"
              checked={options.includeBase}
              onChange={(e) => handleOptionChange('includeBase', e.target.checked)}
            />
            <span className="option-icon">🐟</span>
            <span className="option-text">体型を変更</span>
          </label>

          <label className="option-item">
            <input
              type="checkbox"
              checked={options.includeParts}
              onChange={(e) => handleOptionChange('includeParts', e.target.checked)}
            />
            <span className="option-icon">🌊</span>
            <span className="option-text">パーツを変更</span>
          </label>

          <label className="option-item">
            <input
              type="checkbox"
              checked={options.includeColors}
              onChange={(e) => handleOptionChange('includeColors', e.target.checked)}
            />
            <span className="option-icon">🎨</span>
            <span className="option-text">色を変更</span>
          </label>

          <label className="option-item">
            <input
              type="checkbox"
              checked={options.includePatterns}
              onChange={(e) => handleOptionChange('includePatterns', e.target.checked)}
            />
            <span className="option-icon">🌈</span>
            <span className="option-text">模様を追加</span>
          </label>

          <label className="option-item">
            <input
              type="checkbox"
              checked={options.includeAccessories}
              onChange={(e) => handleOptionChange('includeAccessories', e.target.checked)}
            />
            <span className="option-icon">👑</span>
            <span className="option-text">アクセサリー追加</span>
          </label>

          <label className="option-item">
            <input
              type="checkbox"
              checked={options.keepCurrentSizes}
              onChange={(e) => handleOptionChange('keepCurrentSizes', e.target.checked)}
            />
            <span className="option-icon">📏</span>
            <span className="option-text">サイズ維持</span>
          </label>
        </div>
      </div>

      {/* 生成ボタン */}
      <div className="generate-section">
        <button
          className={`generate-button ${isGenerating ? 'generating' : ''}`}
          onClick={generateRandomDesign}
          disabled={isGenerating}
        >
          <span className="button-icon">
            {isGenerating ? '🔄' : '🎲'}
          </span>
          <span className="button-text">
            {isGenerating ? '生成中...' : 'ランダム生成'}
          </span>
        </button>

        <div className="generate-note">
          <span className="note-icon">💡</span>
          <span className="note-text">
            何度でも生成して、お気に入りの組み合わせを見つけてください
          </span>
        </div>
      </div>

      {/* 生成統計 */}
      <div className="generation-stats">
        <h4 className="stats-title">📊 組み合わせ数</h4>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">体型</span>
            <span className="stat-value">{availableBases.length}種類</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">色</span>
            <span className="stat-value">{availableColors.length}色</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">模様</span>
            <span className="stat-value">{availablePatterns.length}種類</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">アクセサリー</span>
            <span className="stat-value">{availableAccessoryTemplates.length}種類</span>
          </div>
        </div>
        <div className="total-combinations">
          <span className="total-text">
            数十万通りの組み合わせが可能です！
          </span>
        </div>
      </div>

      {/* ヒント */}
      <div className="generator-tips">
        <div className="tip">
          <span className="tip-icon">🎯</span>
          <span className="tip-text">
            <strong>コツ:</strong> 特定の要素を固定したい場合は、該当する設定をオフにしてください
          </span>
        </div>
        <div className="tip">
          <span className="tip-icon">🎨</span>
          <span className="tip-text">
            <strong>活用法:</strong> ランダム生成後に細かい調整を行うと、より理想的な魚が作れます
          </span>
        </div>
      </div>
    </div>
  );
}