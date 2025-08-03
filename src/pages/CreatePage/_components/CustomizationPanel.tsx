import SliderControl from './SliderControl';
import ColorPicker from './ColorPicker';
import type { FishDesign } from '../../../types/common.types';
import './CustomizationPanel.css';

interface CustomizationPanelProps {
  fishDesign: FishDesign;
  onCustomize: (property: string, value: string | number | { x: number; y: number }) => void;
}

// バッチ更新用の型定義
interface BatchUpdate {
  [key: string]: string | number | { x: number; y: number };
}

export default function CustomizationPanel({ fishDesign, onCustomize }: CustomizationPanelProps) {
  const { customizations } = fishDesign;

  const handleSliderChange = (property: string, value: number) => {
    onCustomize(property, value);
  };

  const handleColorChange = (property: string, value: string) => {
    onCustomize(property, value);
  };

  const handlePositionChange = (
    property: 'eyePosition' | 'mouthPosition' | 'dorsalFinPosition' | 'tailFinPosition' | 'pectoralFinPosition', 
    axis: 'x' | 'y', 
    value: number
  ) => {
    const currentPosition = customizations[property];
    const newPosition = {
      ...currentPosition,
      [axis]: value
    };
    onCustomize(property, newPosition);
  };

  // バッチ更新のヘルパー関数
  const applyBatchUpdates = (updates: BatchUpdate) => {
    // タイマーを使用して順次適用（React の状態更新を確実にするため）
    Object.entries(updates).forEach(([property, value], index) => {
      setTimeout(() => {
        onCustomize(property, value);
      }, index * 50); // 50ms間隔で順次適用
    });
  };

  return (
    <div className="customization-panel">
      <div className="panel-header">
        <h3 className="panel-title">🎨 仕上げ</h3>
        <p className="panel-description">
          色やサイズを調整して魚を完成させましょう
        </p>
      </div>

      <div className="customization-sections">
        {/* 色の設定 */}
        <section className="customization-section">
          <h4 className="section-title">🌈 色の設定</h4>
          
          <ColorPicker
            label="体の色"
            currentColor={customizations.bodyColor}
            onColorChange={(color) => handleColorChange('bodyColor', color)}
            icon="🐟"
          />
          
          <ColorPicker
            label="ヒレの色"
            currentColor={customizations.finColor}
            onColorChange={(color) => handleColorChange('finColor', color)}
            icon="🌊"
          />
          
          <ColorPicker
            label="目の色"
            currentColor={customizations.eyeColor}
            onColorChange={(color) => handleColorChange('eyeColor', color)}
            icon="👁️"
          />
        </section>

        {/* サイズの設定 */}
        <section className="customization-section">
          <h4 className="section-title">📏 サイズの設定</h4>
          
          <SliderControl
            label="全体サイズ"
            value={customizations.size}
            min={0.5}
            max={2.0}
            step={0.1}
            onChange={(value) => handleSliderChange('size', value)}
            unit="倍"
            icon="🐠"
          />
          
          <SliderControl
            label="ヒレサイズ"
            value={customizations.finSize}
            min={0.5}
            max={2.0}
            step={0.1}
            onChange={(value) => handleSliderChange('finSize', value)}
            unit="倍"
            icon="🌊"
          />
          
          <SliderControl
            label="目のサイズ"
            value={customizations.eyeSize}
            min={0.5}
            max={2.0}
            step={0.1}
            onChange={(value) => handleSliderChange('eyeSize', value)}
            unit="倍"
            icon="👁️"
          />
        </section>

        {/* 位置の設定 */}
        <section className="customization-section">
          <h4 className="section-title">📍 位置の設定</h4>
          
          <div className="position-controls">
            <div className="position-group">
              <h5 className="position-label">👁️ 目の位置</h5>
              
              <SliderControl
                label="横位置"
                value={customizations.eyePosition.x}
                min={-0.4}
                max={0.2}
                step={0.05}
                onChange={(value) => handlePositionChange('eyePosition', 'x', value)}
                icon="↔️"
              />
              
              <SliderControl
                label="縦位置"
                value={customizations.eyePosition.y}
                min={-0.4}
                max={0.1}
                step={0.05}
                onChange={(value) => handlePositionChange('eyePosition', 'y', value)}
                icon="↕️"
              />
            </div>
            
            <div className="position-group">
              <h5 className="position-label">👄 口の位置</h5>
              
              <SliderControl
                label="横位置"
                value={customizations.mouthPosition.x}
                min={-0.2}
                max={0.3}
                step={0.05}
                onChange={(value) => handlePositionChange('mouthPosition', 'x', value)}
                icon="↔️"
              />
              
              <SliderControl
                label="縦位置"
                value={customizations.mouthPosition.y}
                min={0.1}
                max={0.6}
                step={0.05}
                onChange={(value) => handlePositionChange('mouthPosition', 'y', value)}
                icon="↕️"
              />
            </div>
          </div>
        </section>

        {/* ヒレの位置設定 */}
        <section className="customization-section">
          <h4 className="section-title">🐟 ヒレの位置</h4>
          
          <div className="position-controls">
            <div className="position-group">
              <h5 className="position-label">🔺 背ビレの位置</h5>
              
              <SliderControl
                label="横位置"
                value={customizations.dorsalFinPosition.x}
                min={-0.5}
                max={0.5}
                step={0.05}
                onChange={(value) => handlePositionChange('dorsalFinPosition', 'x', value)}
                icon="↔️"
              />
              
              <SliderControl
                label="縦位置"
                value={customizations.dorsalFinPosition.y}
                min={-0.2}
                max={0.2}
                step={0.05}
                onChange={(value) => handlePositionChange('dorsalFinPosition', 'y', value)}
                icon="↕️"
              />
            </div>
            
            <div className="position-group">
              <h5 className="position-label">🎋 尾ビレの位置</h5>
              
              <SliderControl
                label="横位置"
                value={customizations.tailFinPosition.x}
                min={-0.3}
                max={0.3}
                step={0.05}
                onChange={(value) => handlePositionChange('tailFinPosition', 'x', value)}
                icon="↔️"
              />
              
              <SliderControl
                label="縦位置"
                value={customizations.tailFinPosition.y}
                min={-0.4}
                max={0.4}
                step={0.05}
                onChange={(value) => handlePositionChange('tailFinPosition', 'y', value)}
                icon="↕️"
              />
            </div>
            
            <div className="position-group">
              <h5 className="position-label">🌊 胸ビレの位置</h5>
              
              <SliderControl
                label="横位置"
                value={customizations.pectoralFinPosition.x}
                min={-0.4}
                max={0.4}
                step={0.05}
                onChange={(value) => handlePositionChange('pectoralFinPosition', 'x', value)}
                icon="↔️"
              />
              
              <SliderControl
                label="縦位置"
                value={customizations.pectoralFinPosition.y}
                min={-0.5}
                max={0.5}
                step={0.05}
                onChange={(value) => handlePositionChange('pectoralFinPosition', 'y', value)}
                icon="↕️"
              />
            </div>
          </div>
        </section>

        {/* プリセット */}
        <section className="customization-section">
          <h4 className="section-title">⚡ クイック設定</h4>
          
          <div className="preset-buttons">
            <button
              className="preset-button"
              onClick={() => {
                applyBatchUpdates({
                  size: 1.5,
                  finSize: 1.3,
                  eyeSize: 1.2
                });
              }}
            >
              <span className="preset-icon">🐲</span>
              <span className="preset-text">大きめ</span>
            </button>
            
            <button
              className="preset-button"
              onClick={() => {
                applyBatchUpdates({
                  size: 0.8,
                  finSize: 0.9,
                  eyeSize: 1.3
                });
              }}
            >
              <span className="preset-icon">🐣</span>
              <span className="preset-text">小さめ</span>
            </button>
            
            <button
              className="preset-button"
              onClick={() => {
                applyBatchUpdates({
                  bodyColor: '#ffd700',
                  finColor: '#ffed4e',
                  eyeColor: '#000000'
                });
              }}
            >
              <span className="preset-icon">👑</span>
              <span className="preset-text">金色</span>
            </button>
            
            <button
              className="preset-button"
              onClick={() => {
                applyBatchUpdates({
                  bodyColor: '#ff6b6b',
                  finColor: '#ff9999',
                  eyeColor: '#000000'
                });
              }}
            >
              <span className="preset-icon">🌸</span>
              <span className="preset-text">桜色</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}