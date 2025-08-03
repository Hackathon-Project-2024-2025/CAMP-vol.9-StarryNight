import type { AIModel, GenerationMode } from '../../../types/ai.types';
import './Step1ModelSelection.css';

interface Step1ModelSelectionProps {
  selectedModel: AIModel;
  onModelChange: (model: AIModel) => void;
  generationMode?: GenerationMode;
  onGenerationModeChange?: (mode: GenerationMode) => void;
}

interface ModelInfo {
  id: AIModel;
  name: string;
  description: string;
  features: string[];
  icon: string;
  color: string;
}

const MODELS: ModelInfo[] = [
  {
    id: 'chatgpt',
    name: 'OpenAI ChatGPT',
    description: 'OpenAIの高性能AI。バランスの取れたデザインが得意',
    features: ['バランス重視', '安定した品質', '実用的デザイン'],
    icon: '🤖',
    color: '#10b981'
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Googleの最新AI。創造性豊かで詳細な表現が得意',
    features: ['高い創造性', '詳細な描写', '色彩表現豊か'],
    icon: '🌟',
    color: '#3b82f6'
  }
];

interface GenerationModeInfo {
  id: GenerationMode;
  name: string;
  description: string;
  features: string[];
  icon: string;
  color: string;
}

const GENERATION_MODES: GenerationModeInfo[] = [
  {
    id: 'initial',
    name: '初期生成',
    description: '完全に新しい金魚をAIが一から生成します',
    features: ['完全AI生成', '高い創造性', '予期しない結果'],
    icon: '✨',
    color: '#8b5cf6'
  },
  {
    id: 'i2i',
    name: 'Image-to-Image',
    description: 'Canvas金魚をベースにAIが改良・変換します',
    features: ['背景透過確実', '設定反映高', 'ハイブリッド品質'],
    icon: '🎨',
    color: '#f59e0b'
  }
];

export default function Step1ModelSelection({ 
  selectedModel, 
  onModelChange, 
  generationMode = 'initial', 
  onGenerationModeChange 
}: Step1ModelSelectionProps) {
  return (
    <div className="ai-step1-model-selection">
      <div className="ai-step-content-header">
        <h3 className="ai-step-content-title">
          <span className="ai-step-content-icon">🤖</span>
          AIモデルを選択してください
        </h3>
        <p className="ai-step-content-description">
          金魚を生成するAIモデルを選択してください。それぞれ異なる特徴があります。
        </p>
      </div>

      <div className="model-selection-grid">
        {MODELS.map((model) => (
          <div
            key={model.id}
            className={`model-card ${selectedModel === model.id ? 'selected' : ''}`}
            onClick={() => onModelChange(model.id)}
            style={{ '--model-color': model.color } as React.CSSProperties}
          >
            <div className="model-card-header">
              <div className="model-icon">{model.icon}</div>
              <div className="model-info">
                <h4 className="model-name">{model.name}</h4>
                <p className="model-description">{model.description}</p>
              </div>
              <div className="selection-indicator">
                {selectedModel === model.id && (
                  <div className="check-mark">✓</div>
                )}
              </div>
            </div>

            <div className="model-features">
              <h5 className="features-title">特徴:</h5>
              <ul className="features-list">
                {model.features.map((feature, index) => (
                  <li key={index} className="feature-item">
                    <span className="feature-bullet">•</span>
                    <span className="feature-text">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="model-card-footer">
              <div className="selection-prompt">
                {selectedModel === model.id ? '選択中' : 'クリックして選択'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gemini選択時の生成モード選択 */}
      {selectedModel === 'gemini' && (
        <div className="generation-mode-section">
          <div className="ai-step-content-header">
            <h3 className="ai-step-content-title">
              <span className="ai-step-content-icon">🎨</span>
              生成方式を選択してください
            </h3>
            <p className="ai-step-content-description">
              Geminiでの金魚生成方式を選択してください。
            </p>
          </div>

          <div className="generation-mode-grid">
            {GENERATION_MODES.map((mode) => (
              <div
                key={mode.id}
                className={`generation-mode-card ${generationMode === mode.id ? 'selected' : ''}`}
                onClick={() => onGenerationModeChange?.(mode.id)}
                style={{ '--mode-color': mode.color } as React.CSSProperties}
              >
                <div className="mode-card-header">
                  <div className="mode-icon">{mode.icon}</div>
                  <div className="mode-info">
                    <h4 className="mode-name">{mode.name}</h4>
                    <p className="mode-description">{mode.description}</p>
                  </div>
                  <div className="selection-indicator">
                    {generationMode === mode.id && (
                      <div className="check-mark">✓</div>
                    )}
                  </div>
                </div>

                <div className="mode-features">
                  <h5 className="features-title">特徴:</h5>
                  <ul className="features-list">
                    {mode.features.map((feature, index) => (
                      <li key={index} className="feature-item">
                        <span className="feature-bullet">•</span>
                        <span className="feature-text">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mode-card-footer">
                  <div className="selection-prompt">
                    {generationMode === mode.id ? '選択中' : 'クリックして選択'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="selection-summary">
        <div className="summary-card">
          <h4 className="summary-title">
            <span className="summary-icon">📋</span>
            選択内容
          </h4>
          <div className="summary-content">
            {selectedModel ? (
              <div className="selected-model-info">
                <div className="selected-model-header">
                  <span className="selected-icon">
                    {MODELS.find(m => m.id === selectedModel)?.icon}
                  </span>
                  <span className="selected-name">
                    {MODELS.find(m => m.id === selectedModel)?.name}
                  </span>
                </div>
                <p className="selected-description">
                  {MODELS.find(m => m.id === selectedModel)?.description}
                </p>
                
                {/* Gemini選択時の生成モード表示 */}
                {selectedModel === 'gemini' && (
                  <div className="selected-generation-mode">
                    <div className="generation-mode-header">
                      <span className="mode-icon">
                        {GENERATION_MODES.find(m => m.id === generationMode)?.icon}
                      </span>
                      <span className="mode-name">
                        {GENERATION_MODES.find(m => m.id === generationMode)?.name}
                      </span>
                    </div>
                    <p className="mode-description">
                      {GENERATION_MODES.find(m => m.id === generationMode)?.description}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="no-selection">まだAIモデルが選択されていません</p>
            )}
          </div>
        </div>
      </div>

      <div className="ai-step-tips">
        <h5 className="ai-tips-title">
          <span className="ai-tips-icon">💡</span>
          選択のヒント
        </h5>
        <ul className="ai-tips-list">
          <li>
            <strong>ChatGPT</strong>: 初めての方におすすめ。バランスの取れた結果が期待できます
          </li>
          <li>
            <strong>Gemini</strong>: より創造的で個性的な金魚を作りたい方におすすめ
          </li>
          {selectedModel === 'gemini' && (
            <>
              <li>
                <strong>初期生成</strong>: 完全にAIにお任せで予期しない素晴らしい結果が期待できます
              </li>
              <li>
                <strong>Image-to-Image</strong>: 背景透過や設定反映を重視する場合におすすめです
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}