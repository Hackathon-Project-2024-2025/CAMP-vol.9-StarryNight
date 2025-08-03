import { useState } from 'react';
import type { AIGenerationParams } from '../../types/aiFish.types';
import './CreativeControls.css';

interface CreativeControlsProps {
  params: AIGenerationParams;
  onParamsChange: (newParams: Partial<AIGenerationParams>) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

// コンセプトオプション
const CONCEPT_OPTIONS = [
  { 
    value: 'elegant', 
    label: '優雅', 
    description: '洗練された美しさ、流れるような線',
    emoji: '✨',
    color: '#e8f4fd'
  },
  { 
    value: 'mystical', 
    label: '神秘的', 
    description: '幻想的で魔法的な雰囲気',
    emoji: '🌙',
    color: '#f0e8ff'
  },
  { 
    value: 'powerful', 
    label: '力強い', 
    description: '堂々とした存在感とエネルギー',
    emoji: '⚡',
    color: '#ffe8e8'
  },
  { 
    value: 'cute', 
    label: '可愛らしい', 
    description: '愛らしく親しみやすい',
    emoji: '🌸',
    color: '#ffebf0'
  },
  { 
    value: 'traditional', 
    label: '伝統的', 
    description: '日本の古典美と金魚文化',
    emoji: '🏮',
    color: '#fff5e6'
  },
  { 
    value: 'modern', 
    label: '現代的', 
    description: '革新的で独創的なデザイン',
    emoji: '🎨',
    color: '#e6fffa'
  }
];

// 感情・雰囲気オプション
const MOOD_OPTIONS = [
  { value: 'calm', label: '穏やか', emoji: '🕊️' },
  { value: 'dynamic', label: '躍動的', emoji: '💨' },
  { value: 'graceful', label: '優雅', emoji: '🦢' },
  { value: 'playful', label: '遊び心', emoji: '🎪' },
  { value: 'noble', label: '気高い', emoji: '👑' },
  { value: 'mysterious', label: '神秘的', emoji: '🔮' }
];

// 色調オプション
const COLOR_TONE_OPTIONS = [
  { value: 'warm', label: '暖色系', description: '赤・オレンジ・黄色', emoji: '🔥' },
  { value: 'cool', label: '寒色系', description: '青・緑・紫', emoji: '❄️' },
  { value: 'vibrant', label: '鮮やか', description: '彩度の高い色彩', emoji: '🌈' },
  { value: 'subtle', label: '控えめ', description: 'パステル・淡い色', emoji: '🌙' },
  { value: 'monochrome', label: '単色', description: '同系色のグラデーション', emoji: '⚫' },
  { value: 'rainbow', label: '虹色', description: 'スペクトラム全体', emoji: '🦄' }
];

export default function CreativeControls({ 
  params, 
  onParamsChange, 
  onGenerate, 
  isGenerating 
}: CreativeControlsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (key: keyof AIGenerationParams, value: string | number) => {
    onParamsChange({ [key]: value });
  };

  return (
    <div className="creative-controls">
      <div className="controls-header">
        <h2 className="controls-title">
          <span className="controls-icon">🎭</span>
          創造的な金魚デザイン
        </h2>
        <p className="controls-subtitle">
          感情や概念から美しい金魚を生成します
        </p>
      </div>

      {/* メインコンセプト選択 */}
      <div className="control-section">
        <h3 className="section-title">
          <span className="section-icon">💡</span>
          基本コンセプト
        </h3>
        <div className="concept-grid">
          {CONCEPT_OPTIONS.map(option => (
            <button
              key={option.value}
              className={`concept-card ${params.concept === option.value ? 'selected' : ''}`}
              onClick={() => handleChange('concept', option.value)}
              style={{ backgroundColor: option.color }}
            >
              <div className="concept-emoji">{option.emoji}</div>
              <div className="concept-label">{option.label}</div>
              <div className="concept-description">{option.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 感情・雰囲気 */}
      <div className="control-section">
        <h3 className="section-title">
          <span className="section-icon">🎭</span>
          感情・雰囲気
        </h3>
        <div className="mood-buttons">
          {MOOD_OPTIONS.map(option => (
            <button
              key={option.value}
              className={`mood-button ${params.mood === option.value ? 'selected' : ''}`}
              onClick={() => handleChange('mood', option.value)}
            >
              <span className="mood-emoji">{option.emoji}</span>
              <span className="mood-label">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 色調 */}
      <div className="control-section">
        <h3 className="section-title">
          <span className="section-icon">🌈</span>
          色調
        </h3>
        <div className="color-tone-grid">
          {COLOR_TONE_OPTIONS.map(option => (
            <button
              key={option.value}
              className={`color-tone-card ${params.colorTone === option.value ? 'selected' : ''}`}
              onClick={() => handleChange('colorTone', option.value)}
            >
              <div className="color-tone-emoji">{option.emoji}</div>
              <div className="color-tone-label">{option.label}</div>
              <div className="color-tone-description">{option.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 基本設定 */}
      <div className="control-section">
        <h3 className="section-title">
          <span className="section-icon">⚙️</span>
          基本設定
        </h3>
        <div className="basic-controls">
          <div className="control-group">
            <label className="control-label">サイズ感</label>
            <div className="scale-buttons">
              {(['small', 'medium', 'large'] as const).map(scale => (
                <button
                  key={scale}
                  className={`scale-button ${params.scale === scale ? 'selected' : ''}`}
                  onClick={() => handleChange('scale', scale)}
                >
                  {scale === 'small' ? '小' : scale === 'medium' ? '中' : '大'}
                </button>
              ))}
            </div>
          </div>

          <div className="control-group">
            <label className="control-label">複雑さ</label>
            <div className="complexity-buttons">
              {(['simple', 'moderate', 'complex'] as const).map(complexity => (
                <button
                  key={complexity}
                  className={`complexity-button ${params.complexity === complexity ? 'selected' : ''}`}
                  onClick={() => handleChange('complexity', complexity)}
                >
                  {complexity === 'simple' ? 'シンプル' : 
                   complexity === 'moderate' ? '標準' : '複雑'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 高度な設定 */}
      <div className="control-section">
        <button
          className="advanced-toggle"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <span className="advanced-icon">
            {showAdvanced ? '▼' : '▶'}
          </span>
          高度な設定
        </button>
        
        {showAdvanced && (
          <div className="advanced-controls">
            <div className="control-group">
              <label className="control-label">
                創造性レベル: {Math.round(params.creativityLevel * 100)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={params.creativityLevel}
                onChange={(e) => handleChange('creativityLevel', parseFloat(e.target.value))}
                className="creativity-slider"
              />
              <div className="slider-labels">
                <span>伝統的</span>
                <span>革新的</span>
              </div>
            </div>

            <div className="control-group">
              <label className="control-label">特別な要望</label>
              <textarea
                value={params.customRequest || ''}
                onChange={(e) => handleChange('customRequest', e.target.value)}
                placeholder="例: 桜の花びらのような模様、水面に映る月のイメージ..."
                className="custom-request-textarea"
                rows={3}
              />
            </div>
          </div>
        )}
      </div>

      {/* 生成ボタン */}
      <div className="generate-section">
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className={`generate-button ${isGenerating ? 'generating' : ''}`}
        >
          {isGenerating ? (
            <>
              <span className="generate-spinner">⏳</span>
              AI金魚を生成中...
            </>
          ) : (
            <>
              <span className="generate-icon">✨</span>
              AI金魚を生成する
            </>
          )}
        </button>
      </div>
    </div>
  );
}