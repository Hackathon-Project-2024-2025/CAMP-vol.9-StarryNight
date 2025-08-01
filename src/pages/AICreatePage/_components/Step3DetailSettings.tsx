import type { AISelections } from '../../../types/ai.types';
import './Step3DetailSettings.css';

interface Step3DetailSettingsProps {
  selections: AISelections;
  onSelectionsChange: (changes: Partial<AISelections>) => void;
}

interface DetailGroup {
  key: keyof AISelections;
  title: string;
  icon: string;
  options: Array<{
    value: string;
    label: string;
    description: string;
    visual: string;
  }>;
}

const DETAIL_FEATURES: DetailGroup[] = [
  {
    key: 'fins',
    title: 'ヒレの形状',
    icon: '🦈',
    options: [
      { value: 'standard', label: '標準', description: '一般的でバランスの良いヒレ', visual: '🔸' },
      { value: 'large', label: '大きめ', description: '存在感のある大きなヒレ', visual: '🔷' },
      { value: 'decorative', label: '装飾的', description: '華やかで複雑な形状のヒレ', visual: '💎' },
      { value: 'simple', label: 'シンプル', description: 'すっきりとした控えめなヒレ', visual: '🔹' }
    ]
  },
  {
    key: 'eyes',
    title: '目の形状',
    icon: '👁️',
    options: [
      { value: 'normal', label: '標準', description: '自然で親しみやすい目', visual: '○' },
      { value: 'large', label: '大きめ', description: '可愛らしい大きな目', visual: '●' },
      { value: 'small', label: '小さめ', description: '上品で落ち着いた小さな目', visual: '・' },
      { value: 'distinctive', label: '個性的', description: 'ユニークで印象的な目', visual: '◆' }
    ]
  },
  {
    key: 'pattern',
    title: '体の模様',
    icon: '🌈',
    options: [
      { value: 'none', label: 'なし', description: '無地でシンプルな美しさ', visual: '□' },
      { value: 'spotted', label: '斑点', description: '可愛らしい斑点模様', visual: '⚪' },
      { value: 'striped', label: '縞模様', description: 'エレガントな縞パターン', visual: '═' },
      { value: 'polka', label: '水玉', description: 'ポップな水玉模様', visual: '⚫' },
      { value: 'gradient', label: 'グラデーション', description: '美しい色の濃淡', visual: '🌈' }
    ]
  }
];

export default function Step3DetailSettings({ selections, onSelectionsChange }: Step3DetailSettingsProps) {
  const handleOptionChange = (key: keyof AISelections, value: string) => {
    onSelectionsChange({ [key]: value });
  };

  return (
    <div className="step3-detail-settings">
      <div className="ai-step-content-header">
        <h3 className="ai-step-content-title">
          <span className="ai-step-content-icon">✨</span>
          詳細設定を選択してください
        </h3>
        <p className="ai-step-content-description">
          金魚の細かな特徴を設定します。これらの設定で個性がより際立ちます。
        </p>
      </div>

      <div className="detail-groups">
        {DETAIL_FEATURES.map((group) => (
          <div key={group.key} className="detail-group">
            <div className="group-header">
              <h4 className="group-title">
                <span className="group-icon">{group.icon}</span>
                {group.title}
              </h4>
              <p className="group-subtitle">
                選択中: {group.options.find(opt => opt.value === selections[group.key])?.label}
              </p>
            </div>

            <div className="detail-options">
              {group.options.map((option) => {
                const isSelected = selections[group.key] === option.value;
                
                return (
                  <div
                    key={option.value}
                    className={`detail-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleOptionChange(group.key, option.value)}
                  >
                    <div className="option-visual-wrapper">
                      <div className="option-visual-icon">
                        {option.visual}
                      </div>
                      {isSelected && (
                        <div className="selected-indicator">✓</div>
                      )}
                    </div>
                    
                    <div className="option-info">
                      <h5 className="option-name">{option.label}</h5>
                      <p className="option-desc">{option.description}</p>
                    </div>

                    <div className="option-status">
                      <div className={`status-dot ${isSelected ? 'active' : ''}`}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="settings-summary">
        <div className="summary-card">
          <h4 className="summary-title">
            <span className="summary-icon">🎯</span>
            詳細設定まとめ
          </h4>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">ヒレ:</span>
              <div className="summary-value">
                <span className="summary-visual">
                  {DETAIL_FEATURES[0].options.find(opt => opt.value === selections.fins)?.visual}
                </span>
                <span className="summary-text">
                  {DETAIL_FEATURES[0].options.find(opt => opt.value === selections.fins)?.label}
                </span>
              </div>
            </div>
            <div className="summary-item">
              <span className="summary-label">目:</span>
              <div className="summary-value">
                <span className="summary-visual">
                  {DETAIL_FEATURES[1].options.find(opt => opt.value === selections.eyes)?.visual}
                </span>
                <span className="summary-text">
                  {DETAIL_FEATURES[1].options.find(opt => opt.value === selections.eyes)?.label}
                </span>
              </div>
            </div>
            <div className="summary-item">
              <span className="summary-label">模様:</span>
              <div className="summary-value">
                <span className="summary-visual">
                  {DETAIL_FEATURES[2].options.find(opt => opt.value === selections.pattern)?.visual}
                </span>
                <span className="summary-text">
                  {DETAIL_FEATURES[2].options.find(opt => opt.value === selections.pattern)?.label}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="combination-tips">
        <h5 className="tips-title">
          <span className="tips-icon">🎨</span>
          組み合わせのコツ
        </h5>
        <div className="tips-grid">
          <div className="tip-item">
            <h6 className="tip-title">🔸 バランス重視</h6>
            <p className="tip-description">標準的なヒレ + 標準的な目 = 安定した美しさ</p>
          </div>
          <div className="tip-item">
            <h6 className="tip-title">💎 華やか</h6>
            <p className="tip-description">装飾的なヒレ + 大きな目 + 斑点模様 = 印象的</p>
          </div>
          <div className="tip-item">
            <h6 className="tip-title">🔹 上品</h6>
            <p className="tip-description">シンプルなヒレ + 小さな目 + 無地 = 洗練</p>
          </div>
        </div>
      </div>
    </div>
  );
}