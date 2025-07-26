import { useState } from 'react';
import type { SelectedParts, FishPart } from '../../../types/common.types';
import './PartsSelector.css';

interface PartsSelectorProps {
  selectedParts: SelectedParts;
  onPartSelect: (category: string, part: FishPart) => void;
}

// パーツカテゴリ情報
const partCategories = [
  { key: 'dorsalFin', name: '背ビレ', icon: '🔺' },
  { key: 'pectoralFins', name: '胸ビレ', icon: '🌊' },
  { key: 'tailFin', name: '尾ビレ', icon: '🎋' },
  { key: 'eyes', name: '目', icon: '👁️' },
  { key: 'mouth', name: '口', icon: '👄' },
  { key: 'scales', name: 'ウロコ', icon: '⚫' }
];

// 利用可能なパーツ（簡略版）
const availableParts: Record<string, FishPart[]> = {
  dorsalFin: [
    {
      id: 'dorsal-basic',
      name: '基本背ビレ',
      category: 'dorsalFin',
      thumbnail: '',
      description: '標準的な三角形の背ビレ',
      renderData: { shape: 'triangular', size: 1.0 }
    },
    {
      id: 'dorsal-large',
      name: '大きな背ビレ',
      category: 'dorsalFin',
      thumbnail: '',
      description: '存在感のある大きな背ビレ',
      renderData: { shape: 'triangular', size: 1.5 }
    },
    {
      id: 'dorsal-spiky',
      name: 'トゲトゲ背ビレ',
      category: 'dorsalFin',
      thumbnail: '',
      description: 'ギザギザした形の背ビレ',
      renderData: { shape: 'spiky', size: 1.2 }
    }
  ],
  pectoralFins: [
    {
      id: 'pectoral-basic',
      name: '基本胸ビレ',
      category: 'pectoralFins',
      thumbnail: '',
      description: '標準的な楕円形の胸ビレ',
      renderData: { shape: 'oval', size: 1.0 }
    },
    {
      id: 'pectoral-long',
      name: '長い胸ビレ',
      category: 'pectoralFins',
      thumbnail: '',
      description: '優雅で長い胸ビレ',
      renderData: { shape: 'elongated', size: 1.3 }
    }
  ],
  tailFin: [
    {
      id: 'tail-fan',
      name: '扇型尾ビレ',
      category: 'tailFin',
      thumbnail: '',
      description: '扇のような形の尾ビレ',
      renderData: { shape: 'fan', size: 1.0 }
    },
    {
      id: 'tail-forked',
      name: '二股尾ビレ',
      category: 'tailFin',
      thumbnail: '',
      description: '二股に分かれた尾ビレ',
      renderData: { shape: 'forked', size: 1.2 }
    },
    {
      id: 'tail-ribbon',
      name: 'リボン尾ビレ',
      category: 'tailFin',
      thumbnail: '',
      description: 'リボンのように流れる尾ビレ',
      renderData: { shape: 'ribbon', size: 1.4 }
    }
  ],
  eyes: [
    {
      id: 'eyes-round',
      name: '丸い目',
      category: 'eyes',
      thumbnail: '',
      description: '丸くて可愛い目',
      renderData: { shape: 'circle', size: 1.0 }
    },
    {
      id: 'eyes-large',
      name: '大きな目',
      category: 'eyes',
      thumbnail: '',
      description: 'ぱっちりした大きな目',
      renderData: { shape: 'circle', size: 1.5 }
    },
    {
      id: 'eyes-sleepy',
      name: '眠そうな目',
      category: 'eyes',
      thumbnail: '',
      description: '半分閉じた眠そうな目',
      renderData: { shape: 'sleepy', size: 1.0 }
    }
  ],
  mouth: [
    {
      id: 'mouth-small',
      name: '小さい口',
      category: 'mouth',
      thumbnail: '',
      description: '小さくて上品な口',
      renderData: { shape: 'small', size: 1.0 }
    },
    {
      id: 'mouth-large',
      name: '大きな口',
      category: 'mouth',
      thumbnail: '',
      description: '大きく開いた口',
      renderData: { shape: 'large', size: 1.5 }
    }
  ],
  scales: [
    {
      id: 'scales-basic',
      name: '基本ウロコ',
      category: 'scales',
      thumbnail: '',
      description: '標準的なウロコ模様',
      renderData: { shape: 'basic', size: 1.0 }
    },
    {
      id: 'scales-diamond',
      name: 'ダイヤウロコ',
      category: 'scales',
      thumbnail: '',
      description: 'ダイヤモンド型のウロコ',
      renderData: { shape: 'diamond', size: 1.2 }
    }
  ]
};

export default function PartsSelector({ selectedParts, onPartSelect }: PartsSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<string>('dorsalFin');

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const handlePartClick = (part: FishPart) => {
    onPartSelect(activeCategory, part);
  };

  const getCurrentSelectedPart = () => {
    return selectedParts[activeCategory as keyof SelectedParts];
  };

  const currentParts = availableParts[activeCategory] || [];
  const currentSelectedPart = getCurrentSelectedPart();

  return (
    <div className="parts-selector">
      <div className="selector-header">
        <h3 className="selector-title">✨ パーツを選択</h3>
        <p className="selector-description">
          カテゴリを選んでパーツをカスタマイズしましょう
        </p>
      </div>

      {/* カテゴリタブ */}
      <div className="category-tabs">
        {partCategories.map((category) => (
          <button
            key={category.key}
            className={`category-tab ${activeCategory === category.key ? 'active' : ''}`}
            onClick={() => handleCategoryChange(category.key)}
          >
            <span className="tab-icon">{category.icon}</span>
            <span className="tab-name">{category.name}</span>
          </button>
        ))}
      </div>

      {/* パーツ選択エリア */}
      <div className="parts-area">
        <div className="parts-grid">
          {currentParts.map((part) => {
            const isSelected = currentSelectedPart?.id === part.id;
            
            return (
              <div
                key={part.id}
                className={`part-option ${isSelected ? 'selected' : ''}`}
                onClick={() => handlePartClick(part)}
              >
                <div className="part-preview">
                  {/* パーツのアイコン表示（簡略版） */}
                  <div className="part-icon">
                    {partCategories.find(c => c.key === activeCategory)?.icon}
                  </div>
                </div>
                
                <div className="part-info">
                  <h4 className="part-name">{part.name}</h4>
                  <p className="part-description">{part.description}</p>
                </div>
                
                {isSelected && (
                  <div className="selected-indicator">
                    ✓
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* 現在の選択表示 */}
      <div className="current-selection">
        <div className="selection-info">
          <span className="selection-label">選択中:</span>
          <span className="selection-value">{currentSelectedPart?.name}</span>
        </div>
      </div>
    </div>
  );
}