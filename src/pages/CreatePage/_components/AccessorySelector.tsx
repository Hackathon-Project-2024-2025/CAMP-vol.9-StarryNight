import { useState } from 'react';
import SliderControl from './SliderControl';
import ColorPicker from './ColorPicker';
import type { Accessory } from '../../../types/common.types';
import './AccessorySelector.css';

interface AccessorySelectorProps {
  accessories: Accessory[];
  onAccessoriesChange: (accessories: Accessory[]) => void;
}

// 利用可能なアクセサリー
const availableAccessories: Omit<Accessory, 'position' | 'size' | 'rotation' | 'color' | 'visible'>[] = [
  {
    id: 'crown-simple',
    name: 'シンプルな王冠',
    category: 'crown',
    description: '上品で可愛らしい王冠'
  },
  {
    id: 'crown-jeweled',
    name: 'ジュエル王冠',
    category: 'crown',
    description: '宝石がついた豪華な王冠'
  },
  {
    id: 'hat-top',
    name: 'シルクハット',
    category: 'hat',
    description: '紳士的なシルクハット'
  },
  {
    id: 'hat-cap',
    name: 'キャップ',
    category: 'hat',
    description: 'カジュアルな野球帽'
  },
  {
    id: 'glasses-round',
    name: '丸メガネ',
    category: 'glasses',
    description: 'クラシックな丸いメガネ'
  },
  {
    id: 'glasses-sunglasses',
    name: 'サングラス',
    category: 'glasses',
    description: 'クールなサングラス'
  },
  {
    id: 'ribbon-bow',
    name: 'リボン',
    category: 'ribbon',
    description: '可愛らしいリボン'
  },
  {
    id: 'ribbon-headband',
    name: 'ヘッドバンド',
    category: 'ribbon',
    description: 'おしゃれなヘッドバンド'
  },
  {
    id: 'bow-tie',
    name: '蝶ネクタイ',
    category: 'bow',
    description: 'フォーマルな蝶ネクタイ'
  },
  {
    id: 'jewelry-necklace',
    name: 'ネックレス',
    category: 'jewelry',
    description: 'エレガントなネックレス'
  },
  {
    id: 'jewelry-earrings',
    name: 'イヤリング',
    category: 'jewelry',
    description: 'キラキラのイヤリング'
  }
];

// カテゴリー情報
const accessoryCategories = [
  { key: 'crown', name: '王冠', icon: '👑' },
  { key: 'hat', name: '帽子', icon: '🎩' },
  { key: 'glasses', name: 'メガネ', icon: '👓' },
  { key: 'ribbon', name: 'リボン', icon: '🎀' },
  { key: 'bow', name: '蝶ネクタイ', icon: '🎀' },
  { key: 'jewelry', name: 'アクセサリー', icon: '💎' }
];

// 魚の解剖学的構造に基づくデフォルト位置
const defaultPositions: Record<Accessory['category'], { x: number; y: number }> = {
  crown: { x: 0.2, y: -0.8 },      // 頭部上方（魚の頭の真上）
  hat: { x: 0.2, y: -0.9 },        // 頭部上方（少し高め）
  glasses: { x: 0.2, y: -0.3 },    // 目の位置（頭部前方）
  ribbon: { x: 0.0, y: -0.7 },     // 頭部上方（王冠より少し後ろ）
  bow: { x: 0.4, y: 0.15 },        // 胸部（首の下）
  jewelry: { x: 0.4, y: 0.25 }     // 胸部（蝶ネクタイより少し下）
};

// デフォルトのアクセサリー設定
const createDefaultAccessory = (template: typeof availableAccessories[0]): Accessory => {
  // 魚の解剖学的構造に基づく適切な位置
  const defaultPositions: Record<Accessory['category'], { x: number; y: number }> = {
    crown: { x: 0.2, y: -0.8 },      // 頭部上方（魚の頭の真上）
    hat: { x: 0.2, y: -0.9 },        // 頭部上方（少し高め）
    glasses: { x: 0.2, y: -0.3 },    // 目の位置（頭部前方）
    ribbon: { x: 0.0, y: -0.7 },     // 頭部上方（王冠より少し後ろ）
    bow: { x: 0.4, y: 0.15 },        // 胸部（首の下）
    jewelry: { x: 0.4, y: 0.25 }     // 胸部（蝶ネクタイより少し下）
  };

  const defaultColors: Record<Accessory['category'], string> = {
    crown: '#ffd700',    // 金色
    hat: '#2c3e50',      // 濃い灰色
    glasses: '#34495e',  // 灰色
    ribbon: '#ff69b4',   // ピンク
    bow: '#8b4513',      // 茶色
    jewelry: '#c0c0c0'   // 銀色
  };

  return {
    ...template,
    position: defaultPositions[template.category],
    size: 1.0,
    rotation: 0,
    color: defaultColors[template.category],
    visible: true
  };
};

export default function AccessorySelector({ accessories, onAccessoriesChange }: AccessorySelectorProps) {
  const [activeCategory, setActiveCategory] = useState<Accessory['category']>('crown');
  const [selectedAccessoryId, setSelectedAccessoryId] = useState<string | null>(null);

  const handleCategoryChange = (category: Accessory['category']) => {
    setActiveCategory(category);
    setSelectedAccessoryId(null);
  };

  const handleAccessoryAdd = (template: typeof availableAccessories[0]) => {
    const newAccessory = createDefaultAccessory(template);
    const updatedAccessories = [...accessories, newAccessory];
    onAccessoriesChange(updatedAccessories);
    setSelectedAccessoryId(newAccessory.id);
  };

  const handleAccessoryRemove = (accessoryId: string) => {
    const updatedAccessories = accessories.filter(acc => acc.id !== accessoryId);
    onAccessoriesChange(updatedAccessories);
    if (selectedAccessoryId === accessoryId) {
      setSelectedAccessoryId(null);
    }
  };

  const handleAccessoryUpdate = (accessoryId: string, updates: Partial<Accessory>) => {
    const updatedAccessories = accessories.map(acc =>
      acc.id === accessoryId ? { ...acc, ...updates } : acc
    );
    onAccessoriesChange(updatedAccessories);
  };

  const handlePositionChange = (accessoryId: string, axis: 'x' | 'y', value: number) => {
    const accessory = accessories.find(acc => acc.id === accessoryId);
    if (!accessory) return;

    const newPosition = {
      ...accessory.position,
      [axis]: value
    };
    handleAccessoryUpdate(accessoryId, { position: newPosition });
  };

  const currentCategoryAccessories = availableAccessories.filter(
    acc => acc.category === activeCategory
  );

  const equippedAccessories = accessories.filter(acc => acc.visible);
  const selectedAccessory = selectedAccessoryId ? 
    accessories.find(acc => acc.id === selectedAccessoryId) : null;

  const renderAccessoryIcon = (category: Accessory['category']) => {
    const categoryInfo = accessoryCategories.find(c => c.key === category);
    return categoryInfo?.icon || '✨';
  };

  const renderAccessoryPreview = (template: typeof availableAccessories[0]) => {
    const isEquipped = accessories.some(acc => acc.id === template.id);

    return (
      <div key={template.id} className="accessory-option">
        <div className="accessory-preview">
          <div className="accessory-icon">
            {renderAccessoryIcon(template.category)}
          </div>
        </div>
        
        <div className="accessory-info">
          <h4 className="accessory-name">{template.name}</h4>
          <p className="accessory-description">{template.description}</p>
        </div>
        
        <div className="accessory-actions">
          {!isEquipped ? (
            <button
              className="accessory-button add-button"
              onClick={() => handleAccessoryAdd(template)}
              title="装着する"
            >
              <span className="button-icon">➕</span>
              <span className="button-text">装着</span>
            </button>
          ) : (
            <button
              className="accessory-button remove-button"
              onClick={() => handleAccessoryRemove(template.id)}
              title="外す"
            >
              <span className="button-icon">➖</span>
              <span className="button-text">外す</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="accessory-selector">
      <div className="selector-header">
        <h3 className="selector-title">✨ アクセサリーを追加</h3>
        <p className="selector-description">
          魚にお洒落なアクセサリーを身に着けさせましょう
        </p>
      </div>

      {/* 装着中のアクセサリー表示 */}
      {equippedAccessories.length > 0 && (
        <div className="equipped-accessories">
          <h4 className="equipped-title">👑 装着中のアクセサリー</h4>
          <div className="equipped-list">
            {equippedAccessories.map((accessory) => (
              <div
                key={accessory.id}
                className={`equipped-item ${selectedAccessoryId === accessory.id ? 'selected' : ''}`}
                onClick={() => setSelectedAccessoryId(accessory.id)}
              >
                <span className="equipped-icon">
                  {renderAccessoryIcon(accessory.category)}
                </span>
                <span className="equipped-name">{accessory.name}</span>
                <button
                  className="equipped-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAccessoryRemove(accessory.id);
                  }}
                  title="外す"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* カテゴリータブ */}
      <div className="category-tabs">
        {accessoryCategories.map((category) => (
          <button
            key={category.key}
            className={`category-tab ${activeCategory === category.key ? 'active' : ''}`}
            onClick={() => handleCategoryChange(category.key as Accessory['category'])}
          >
            <span className="tab-icon">{category.icon}</span>
            <span className="tab-name">{category.name}</span>
          </button>
        ))}
      </div>

      {/* アクセサリー選択エリア */}
      <div className="accessories-area">
        <div className="accessories-grid">
          {currentCategoryAccessories.map(renderAccessoryPreview)}
        </div>
      </div>

      {/* 選択されたアクセサリーの詳細設定 */}
      {selectedAccessory && (
        <div className="accessory-customization">
          <div className="customization-header">
            <h4 className="customization-title">🔧 {selectedAccessory.name}の調整</h4>
            <div className="visibility-toggle">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={selectedAccessory.visible}
                  onChange={(e) => handleAccessoryUpdate(selectedAccessory.id, { visible: e.target.checked })}
                />
                <span className="toggle-text">表示</span>
              </label>
            </div>
          </div>

          <div className="customization-settings">
            {/* 位置調整 */}
            <div className="setting-group">
              <h5 className="group-title">📍 位置</h5>
              
              <SliderControl
                label="横位置"
                value={selectedAccessory.position.x}
                min={-0.8}
                max={0.8}
                step={0.05}
                onChange={(value) => handlePositionChange(selectedAccessory.id, 'x', value)}
                icon="↔️"
              />
              
              <SliderControl
                label="縦位置"
                value={selectedAccessory.position.y}
                min={-1.0}
                max={0.8}
                step={0.05}
                onChange={(value) => handlePositionChange(selectedAccessory.id, 'y', value)}
                icon="↕️"
              />
            </div>

            {/* サイズ・角度調整 */}
            <div className="setting-group">
              <h5 className="group-title">📏 サイズ・角度</h5>
              
              <SliderControl
                label="サイズ"
                value={selectedAccessory.size}
                min={0.3}
                max={2.0}
                step={0.1}
                onChange={(value) => handleAccessoryUpdate(selectedAccessory.id, { size: value })}
                unit="倍"
                icon="🔍"
              />
              
              <SliderControl
                label="回転"
                value={selectedAccessory.rotation || 0}
                min={-180}
                max={180}
                step={5}
                onChange={(value) => handleAccessoryUpdate(selectedAccessory.id, { rotation: value })}
                unit="度"
                icon="🔄"
              />
            </div>

            {/* 色調整 */}
            <div className="setting-group">
              <h5 className="group-title">🎨 色</h5>
              
              <ColorPicker
                label="アクセサリーの色"
                currentColor={selectedAccessory.color || '#ffd700'}
                onColorChange={(color) => handleAccessoryUpdate(selectedAccessory.id, { color })}
                icon="🎨"
              />
            </div>
          </div>

          {/* クイック設定 */}
          <div className="quick-settings">
            <h5 className="group-title">⚡ クイック設定</h5>
            <div className="quick-buttons">
              <button
                className="quick-button"
                onClick={() => {
                  // 王様風：頭上中央、大きめサイズ
                  const basePosition = defaultPositions[selectedAccessory.category];
                  handleAccessoryUpdate(selectedAccessory.id, {
                    position: { x: basePosition.x, y: basePosition.y - 0.1 },
                    size: 1.3,
                    rotation: 0
                  });
                }}
              >
                <span className="quick-icon">👑</span>
                <span className="quick-text">中央</span>
              </button>
              
              <button
                className="quick-button"
                onClick={() => {
                  // おしゃれ風：少し斜めに小さめ
                  const basePosition = defaultPositions[selectedAccessory.category];
                  handleAccessoryUpdate(selectedAccessory.id, {
                    position: { x: basePosition.x + 0.1, y: basePosition.y },
                    size: 0.9,
                    rotation: 15
                  });
                }}
              >
                <span className="quick-icon">😎</span>
                <span className="quick-text">おしゃれ</span>
              </button>
              
              <button
                className="quick-button"
                onClick={() => {
                  // 標準位置：デフォルトの位置とサイズ
                  const basePosition = defaultPositions[selectedAccessory.category];
                  handleAccessoryUpdate(selectedAccessory.id, {
                    position: { x: basePosition.x, y: basePosition.y },
                    size: 1.0,
                    rotation: 0
                  });
                }}
              >
                <span className="quick-icon">🎯</span>
                <span className="quick-text">標準</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ヒント */}
      <div className="accessory-tips">
        <div className="tip">
          <span className="tip-icon">💡</span>
          <span className="tip-text">
            <strong>ヒント:</strong> アクセサリーをクリックして選択すると、位置やサイズを調整できます
          </span>
        </div>
        <div className="tip">
          <span className="tip-icon">✨</span>
          <span className="tip-text">
            <strong>コツ:</strong> 複数のアクセサリーを組み合わせて、ユニークな魚を作ってみましょう
          </span>
        </div>
      </div>
    </div>
  );
}