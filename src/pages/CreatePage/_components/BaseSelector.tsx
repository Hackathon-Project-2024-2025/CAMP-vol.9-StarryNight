import type { FishBase } from '../../../types/common.types';
import './BaseSelector.css';

interface BaseSelectorProps {
  selectedBase: FishBase;
  onBaseSelect: (base: FishBase) => void;
}

// 利用可能な魚の基本体型
const availableBases: FishBase[] = [
  {
    id: 'base-round',
    name: '丸型',
    shape: 'round',
    defaultColor: '#ff6b6b',
    size: { width: 100, height: 60 },
    description: '丸みを帯びた可愛らしい体型。人気の金魚らしいフォルム。'
  },
  {
    id: 'base-streamlined',
    name: '流線型',
    shape: 'streamlined',
    defaultColor: '#4ecdc4',
    size: { width: 120, height: 50 },
    description: '泳ぎが得意そうなスマートな体型。スピード感がある。'
  },
  {
    id: 'base-flat',
    name: '平型',
    shape: 'flat',
    defaultColor: '#45b7d1',
    size: { width: 100, height: 30 },
    description: '平たく扁平な体型。優雅で上品な印象。'
  },
  {
    id: 'base-elongated',
    name: '細長型',
    shape: 'elongated',
    defaultColor: '#96ceb4',
    size: { width: 150, height: 40 },
    description: '細長くエレガントな体型。独特の美しさがある。'
  }
];

export default function BaseSelector({ selectedBase, onBaseSelect }: BaseSelectorProps) {
  const handleBaseClick = (base: FishBase) => {
    onBaseSelect(base);
  };

  // SVGで魚の体型を描画
  const renderFishShape = (base: FishBase, isSelected: boolean) => {
    const scale = isSelected ? 1.1 : 1.0;
    const opacity = isSelected ? 1.0 : 0.8;
    
    return (
      <svg 
        width="80" 
        height="60" 
        viewBox="0 0 80 60" 
        style={{ 
          transform: `scale(${scale})`,
          opacity,
          transition: 'all 0.3s ease'
        }}
      >
        <defs>
          <linearGradient id={`gradient-${base.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={base.defaultColor} />
            <stop offset="100%" stopColor={`${base.defaultColor}80`} />
          </linearGradient>
        </defs>
        
        {/* 魚の体 */}
        {base.shape === 'round' && (
          <ellipse
            cx="30"
            cy="30"
            rx="25"
            ry="18"
            fill={`url(#gradient-${base.id})`}
            stroke={isSelected ? '#fff' : 'rgba(255,255,255,0.3)'}
            strokeWidth={isSelected ? '2' : '1'}
          />
        )}
        
        {base.shape === 'streamlined' && (
          <ellipse
            cx="30"
            cy="30"
            rx="30"
            ry="15"
            fill={`url(#gradient-${base.id})`}
            stroke={isSelected ? '#fff' : 'rgba(255,255,255,0.3)'}
            strokeWidth={isSelected ? '2' : '1'}
          />
        )}
        
        {base.shape === 'flat' && (
          <ellipse
            cx="30"
            cy="30"
            rx="25"
            ry="8"
            fill={`url(#gradient-${base.id})`}
            stroke={isSelected ? '#fff' : 'rgba(255,255,255,0.3)'}
            strokeWidth={isSelected ? '2' : '1'}
          />
        )}
        
        {base.shape === 'elongated' && (
          <ellipse
            cx="30"
            cy="30"
            rx="35"
            ry="12"
            fill={`url(#gradient-${base.id})`}
            stroke={isSelected ? '#fff' : 'rgba(255,255,255,0.3)'}
            strokeWidth={isSelected ? '2' : '1'}
          />
        )}
        
        {/* 尾ビレ */}
        <path
          d="M 55 30 L 70 25 L 75 30 L 70 35 Z"
          fill={base.defaultColor}
          opacity="0.7"
        />
        
        {/* 目 */}
        <circle cx="20" cy="25" r="3" fill="white" />
        <circle cx="20" cy="25" r="2" fill="black" />
        <circle cx="21" cy="24" r="1" fill="white" />
      </svg>
    );
  };

  return (
    <div className="base-selector">
      <div className="selector-header">
        <h3 className="selector-title">🐟 体型を選択</h3>
        <p className="selector-description">
          魚の基本となる体型を選んでください
        </p>
      </div>

      <div className="base-grid">
        {availableBases.map((base) => {
          const isSelected = selectedBase.id === base.id;
          
          return (
            <div
              key={base.id}
              className={`base-option ${isSelected ? 'selected' : ''}`}
              onClick={() => handleBaseClick(base)}
            >
              <div className="base-preview">
                {renderFishShape(base, isSelected)}
              </div>
              
              <div className="base-info">
                <h4 className="base-name">{base.name}</h4>
                <p className="base-description">{base.description}</p>
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
      
      <div className="current-selection">
        <div className="selection-info">
          <span className="selection-label">選択中:</span>
          <span className="selection-value">{selectedBase.name}</span>
        </div>
      </div>
    </div>
  );
}