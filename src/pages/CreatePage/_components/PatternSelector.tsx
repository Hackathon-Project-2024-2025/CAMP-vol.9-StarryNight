import { useState } from 'react';
import ColorPicker from './ColorPicker';
import SliderControl from './SliderControl';
import type { BodyPattern } from '../../../types/common.types';
import './PatternSelector.css';

interface PatternSelectorProps {
  selectedPattern?: BodyPattern;
  onPatternSelect: (pattern?: BodyPattern) => void;
  baseColor: string;
}

// 利用可能な模様パターン
const availablePatterns: Omit<BodyPattern, 'colors' | 'intensity' | 'scale' | 'direction'>[] = [
  {
    id: 'none',
    name: '無地',
    type: 'solid',
    description: '単色の美しいシンプルな体色'
  },
  {
    id: 'spotted',
    name: 'まだら模様',
    type: 'spotted',
    description: 'ランダムな斑点が散りばめられた模様'
  },
  {
    id: 'striped-horizontal',
    name: '横縞模様',
    type: 'striped',
    description: '水平な縞模様'
  },
  {
    id: 'striped-vertical',
    name: '縦縞模様',
    type: 'striped',
    description: '垂直な縞模様'
  },
  {
    id: 'polka',
    name: '水玉模様',
    type: 'polka',
    description: '規則的な水玉の模様'
  },
  {
    id: 'calico',
    name: 'キャリコ（三色）',
    type: 'calico',
    description: '赤・白・黒の三色が混ざった模様'
  },
  {
    id: 'gradient',
    name: 'グラデーション',
    type: 'gradient',
    description: '色が滑らかに変化する美しいグラデーション'
  }
];

// デフォルトの模様色設定
const getDefaultPatternColors = (type: BodyPattern['type'], baseColor: string): string[] => {
  switch (type) {
    case 'calico':
      return ['#ff6b6b', '#ffffff', '#2c3e50']; // 赤・白・黒
    case 'gradient':
      return [baseColor, '#ffffff'];
    case 'spotted':
    case 'polka':
      return ['#ffffff', baseColor];
    case 'striped':
      return [baseColor, '#ffffff'];
    default:
      return [baseColor];
  }
};

export default function PatternSelector({ selectedPattern, onPatternSelect, baseColor }: PatternSelectorProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handlePatternClick = (patternTemplate: typeof availablePatterns[0]) => {
    if (patternTemplate.id === 'none') {
      onPatternSelect(undefined);
      return;
    }

    // シード値を生成（patternのIDとbaseColorを基にしたハッシュ）
    const generateSeed = (id: string, baseColor: string): number => {
      let hash = 0;
      const str = id + baseColor;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // 32bit整数に変換
      }
      return Math.abs(hash);
    };

    const pattern: BodyPattern = {
      ...patternTemplate,
      colors: getDefaultPatternColors(patternTemplate.type, baseColor),
      intensity: 0.6,
      scale: 1.0,
      direction: patternTemplate.type === 'striped' 
        ? (patternTemplate.id.includes('horizontal') ? 'horizontal' : 'vertical')
        : undefined,
      seed: generateSeed(patternTemplate.id, baseColor)
    };

    onPatternSelect(pattern);
  };

  const handlePatternUpdate = (updates: Partial<BodyPattern>) => {
    if (!selectedPattern) return;
    
    const updatedPattern = {
      ...selectedPattern,
      ...updates
    };

    // 色が変更された場合は新しいシード値を生成
    if (updates.colors) {
      const generateSeed = (id: string, colors: string[]): number => {
        let hash = 0;
        const str = id + colors.join('');
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash; // 32bit整数に変換
        }
        return Math.abs(hash);
      };
      updatedPattern.seed = generateSeed(selectedPattern.id, updates.colors);
    }
    
    onPatternSelect(updatedPattern);
  };

  const handleColorChange = (colorIndex: number, newColor: string) => {
    if (!selectedPattern?.colors) return;
    
    const newColors = [...selectedPattern.colors];
    newColors[colorIndex] = newColor;
    
    handlePatternUpdate({ colors: newColors });
  };

  const renderPatternPreview = (pattern: typeof availablePatterns[0]) => {
    const isSelected = selectedPattern?.id === pattern.id || (pattern.id === 'none' && !selectedPattern);
    
    return (
      <div
        key={pattern.id}
        className={`pattern-option ${isSelected ? 'selected' : ''}`}
        onClick={() => handlePatternClick(pattern)}
      >
        <div className="pattern-preview">
          <div className={`pattern-demo pattern-demo-${pattern.type}`}>
            {pattern.type === 'solid' && (
              <div className="pattern-solid" style={{ backgroundColor: baseColor }} />
            )}
            {pattern.type === 'spotted' && (
              <div className="pattern-spotted">
                <div className="base" style={{ backgroundColor: baseColor }} />
                <div className="spots" />
              </div>
            )}
            {pattern.type === 'striped' && (
              <div className={`pattern-striped ${pattern.id.includes('horizontal') ? 'horizontal' : 'vertical'}`}>
                <div className="stripe-base" style={{ backgroundColor: baseColor }} />
                <div className="stripes" />
              </div>
            )}
            {pattern.type === 'polka' && (
              <div className="pattern-polka">
                <div className="base" style={{ backgroundColor: baseColor }} />
                <div className="dots" />
              </div>
            )}
            {pattern.type === 'calico' && (
              <div className="pattern-calico">
                <div className="calico-red" />
                <div className="calico-white" />
                <div className="calico-black" />
              </div>
            )}
            {pattern.type === 'gradient' && (
              <div 
                className="pattern-gradient" 
                style={{ 
                  background: `linear-gradient(45deg, ${baseColor}, #ffffff)` 
                }} 
              />
            )}
          </div>
        </div>
        
        <div className="pattern-info">
          <h4 className="pattern-name">{pattern.name}</h4>
          <p className="pattern-description">{pattern.description}</p>
        </div>
        
        {isSelected && (
          <div className="selected-indicator">
            ✓
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="pattern-selector">
      <div className="selector-header">
        <h3 className="selector-title">🎨 模様を選択</h3>
        <p className="selector-description">
          魚の体に美しい模様を追加しましょう
        </p>
      </div>

      {/* パターン選択グリッド */}
      <div className="patterns-grid">
        {availablePatterns.map(renderPatternPreview)}
      </div>

      {/* 選択された模様の詳細設定 */}
      {selectedPattern && (
        <div className="pattern-customization">
          <div className="customization-header">
            <h4 className="customization-title">🔧 模様の調整</h4>
            <button
              className="advanced-toggle"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <span className="toggle-text">
                {showAdvanced ? '詳細設定を隠す' : '詳細設定'}
              </span>
              <span className={`toggle-arrow ${showAdvanced ? 'open' : ''}`}>
                ▼
              </span>
            </button>
          </div>

          <div className="current-pattern">
            <span className="current-label">選択中の模様:</span>
            <span className="current-value">{selectedPattern.name}</span>
          </div>

          {/* 基本設定 */}
          <div className="basic-settings">
            <SliderControl
              label="模様の濃さ"
              value={selectedPattern.intensity || 0.6}
              min={0.1}
              max={1.0}
              step={0.1}
              onChange={(value) => handlePatternUpdate({ intensity: value })}
              unit=""
              icon="🎨"
            />

            <SliderControl
              label="模様のサイズ"
              value={selectedPattern.scale || 1.0}
              min={0.3}
              max={2.0}
              step={0.1}
              onChange={(value) => handlePatternUpdate({ scale: value })}
              unit="倍"
              icon="📏"
            />
          </div>

          {/* 詳細設定 */}
          {showAdvanced && (
            <div className="advanced-settings">
              {/* 色設定（キャリコや複数色パターン用） */}
              {selectedPattern.colors && selectedPattern.colors.length > 1 && (
                <div className="pattern-colors">
                  <h5 className="colors-title">🌈 模様の色</h5>
                  {selectedPattern.colors.map((color, index) => (
                    <ColorPicker
                      key={index}
                      label={`色 ${index + 1}`}
                      currentColor={color}
                      onColorChange={(newColor) => handleColorChange(index, newColor)}
                      icon="🎨"
                    />
                  ))}
                </div>
              )}

              {/* 縞模様の方向設定 */}
              {selectedPattern.type === 'striped' && (
                <div className="stripe-direction">
                  <h5 className="direction-title">📐 縞の方向</h5>
                  <div className="direction-buttons">
                    {['horizontal', 'vertical', 'diagonal'].map((direction) => (
                      <button
                        key={direction}
                        className={`direction-button ${selectedPattern.direction === direction ? 'active' : ''}`}
                        onClick={() => handlePatternUpdate({ direction: direction as BodyPattern['direction'] })}
                      >
                        <span className="direction-icon">
                          {direction === 'horizontal' && '↔️'}
                          {direction === 'vertical' && '↕️'}
                          {direction === 'diagonal' && '↗️'}
                        </span>
                        <span className="direction-name">
                          {direction === 'horizontal' && '水平'}
                          {direction === 'vertical' && '垂直'}
                          {direction === 'diagonal' && '斜め'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ヒント */}
      <div className="pattern-tips">
        <div className="tip">
          <span className="tip-icon">💡</span>
          <span className="tip-text">
            <strong>ヒント:</strong> 模様の濃さやサイズを調整して、お好みの見た目に仕上げてください
          </span>
        </div>
        {selectedPattern?.type === 'calico' && (
          <div className="tip">
            <span className="tip-icon">🌸</span>
            <span className="tip-text">
              <strong>キャリコ:</strong> 日本の金魚で人気の三色模様です。伝統的な美しさを楽しめます
            </span>
          </div>
        )}
      </div>
    </div>
  );
}