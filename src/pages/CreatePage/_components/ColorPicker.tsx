import { useState } from 'react';
import './ColorPicker.css';

interface ColorPickerProps {
  label: string;
  currentColor: string;
  onColorChange: (color: string) => void;
  presetColors?: string[];
  icon?: string;
}

const defaultPresetColors = [
  '#ff6b6b', // 赤系
  '#ff9999', // 薄い赤
  '#ffb7c5', // 桜ピンク
  '#ffa500', // オレンジ
  '#f4a261', // 金色
  '#45b7d1', // 青
  '#4ecdc4', // 青緑
  '#96ceb4', // 緑
  '#a8e6cf', // 薄い緑
  '#9370db', // 紫
  '#ffd700', // 金
  '#c0c0c0', // 銀
  '#000000', // 黒
  '#ffffff', // 白
  '#808080', // グレー
  '#8b4513'  // 茶色
];

export default function ColorPicker({
  label,
  currentColor,
  onColorChange,
  presetColors = defaultPresetColors,
  icon
}: ColorPickerProps) {
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customColor, setCustomColor] = useState(currentColor);

  const handlePresetColorClick = (color: string) => {
    onColorChange(color);
    setCustomColor(color);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    onColorChange(newColor);
  };

  const toggleCustomPicker = () => {
    setShowCustomPicker(!showCustomPicker);
  };

  return (
    <div className="color-picker">
      <div className="picker-header">
        <label className="picker-label">
          {icon && <span className="picker-icon">{icon}</span>}
          {label}
        </label>
        <div className="current-color-display">
          <div 
            className="color-preview"
            style={{ backgroundColor: currentColor }}
            title={`現在の色: ${currentColor}`}
          />
          <span className="color-value">{currentColor}</span>
        </div>
      </div>

      {/* プリセットカラー */}
      <div className="preset-colors">
        <div className="preset-grid">
          {presetColors.map((color, index) => (
            <button
              key={index}
              className={`preset-color ${currentColor === color ? 'selected' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => handlePresetColorClick(color)}
              title={color}
            >
              {currentColor === color && (
                <span className="selected-check">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* カスタムカラーピッカー */}
      <div className="custom-color-section">
        <button
          className="custom-toggle"
          onClick={toggleCustomPicker}
        >
          <span className="toggle-icon">🎨</span>
          <span className="toggle-text">
            {showCustomPicker ? 'カスタムカラーを隠す' : 'カスタムカラー'}
          </span>
          <span className={`toggle-arrow ${showCustomPicker ? 'open' : ''}`}>
            ▼
          </span>
        </button>
        
        {showCustomPicker && (
          <div className="custom-picker">
            <input
              type="color"
              value={customColor}
              onChange={handleCustomColorChange}
              className="custom-color-input"
            />
            <div className="custom-picker-info">
              <span className="custom-label">カスタムカラー</span>
              <span className="custom-value">{customColor}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}