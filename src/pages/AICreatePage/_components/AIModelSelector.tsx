import type { AIModel, AIModelInfo } from '../../../types/ai.types';
import './AIModelSelector.css';

interface AIModelSelectorProps {
  selectedModel: AIModel;
  onModelChange: (model: AIModel) => void;
}

// AIモデル情報定義
const AI_MODELS: AIModelInfo[] = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Googleの最新AI。創造性豊かで詳細な表現が得意',
    features: ['高い創造性', '詳細な描写', '色彩表現豊か'],
    icon: '🌟'
  },
  {
    id: 'chatgpt',
    name: 'OpenAI ChatGPT',
    description: 'OpenAIの高性能AI。バランスの取れたデザインが得意',
    features: ['バランス重視', '安定した品質', '実用的デザイン'],
    icon: '🤖'
  }
];

export default function AIModelSelector({ selectedModel, onModelChange }: AIModelSelectorProps) {
  const handleModelChange = (modelId: string) => {
    onModelChange(modelId as AIModel);
  };

  return (
    <div className="ai-model-selector">
      <div className="selector-header">
        <h3 className="selector-title">
          <span className="selector-icon">🧠</span>
          AIモデル選択
        </h3>
        <p className="selector-description">
          金魚を生成するAIモデルを選択してください
        </p>
      </div>

      <div className="model-options">
        {AI_MODELS.map((model) => (
          <div
            key={model.id}
            className={`model-option ${selectedModel === model.id ? 'selected' : ''}`}
            onClick={() => handleModelChange(model.id)}
          >
            <input
              type="radio"
              id={`model-${model.id}`}
              name="ai-model"
              value={model.id}
              checked={selectedModel === model.id}
              onChange={() => handleModelChange(model.id)}
              className="model-radio"
            />
            
            <label htmlFor={`model-${model.id}`} className="model-label">
              <div className="model-header">
                <span className="model-icon">{model.icon}</span>
                <span className="model-name">{model.name}</span>
              </div>
              
              <p className="model-description">{model.description}</p>
              
              <div className="model-features">
                {model.features.map((feature, index) => (
                  <span key={index} className="feature-tag">
                    {feature}
                  </span>
                ))}
              </div>
            </label>

            <div className="selection-indicator">
              {selectedModel === model.id && (
                <span className="check-icon">✓</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="selector-note">
        <p className="note-text">
          💡 各AIモデルは異なる特徴を持っています。お好みに合わせて選択してください。
        </p>
      </div>
    </div>
  );
}