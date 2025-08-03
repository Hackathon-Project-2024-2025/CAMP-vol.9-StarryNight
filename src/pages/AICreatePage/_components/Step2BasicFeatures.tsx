import type { AISelections } from '../../../types/ai.types';
import './Step2BasicFeatures.css';

interface Step2BasicFeaturesProps {
  selections: AISelections;
  onSelectionsChange: (changes: Partial<AISelections>) => void;
}

interface OptionGroup {
  key: keyof AISelections;
  title: string;
  icon: string;
  options: Array<{
    value: string;
    label: string;
    description: string;
    color?: string;
  }>;
}

const BASIC_FEATURES: OptionGroup[] = [
  {
    key: 'bodyType',
    title: '体型',
    icon: '🐟',
    options: [
      { value: 'round', label: '丸型', description: '丸みを帯びた可愛らしい体型', color: '#ff6b6b' },
      { value: 'streamlined', label: '流線型', description: 'スマートで洗練された体型', color: '#4ecdc4' },
      { value: 'flat', label: '平型', description: '横に広がった優雅な体型', color: '#45b7d1' },
      { value: 'elongated', label: '細長型', description: '縦に長いエレガントな体型', color: '#96ceb4' }
    ]
  },
  {
    key: 'baseColor',
    title: '基本色',
    icon: '🎨',
    options: [
      { value: 'red', label: '赤系', description: '情熱的で華やかな赤色', color: '#ff6b6b' },
      { value: 'blue', label: '青系', description: '涼しげで上品な青色', color: '#4ecdc4' },
      { value: 'yellow', label: '黄系', description: '明るく元気な黄色', color: '#ffd93d' },
      { value: 'white', label: '白系', description: '清楚で美しい白色', color: '#ffffff' },
      { value: 'black', label: '黒系', description: '神秘的で高級感のある黒色', color: '#2c3e50' },
      { value: 'colorful', label: 'カラフル', description: '多彩で鮮やかな色合い', color: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #ffd93d)' }
    ]
  },
  {
    key: 'size',
    title: 'サイズ',
    icon: '📏',
    options: [
      { value: 'small', label: '小さめ', description: '可憐で上品なサイズ', color: '#ff9999' },
      { value: 'medium', label: '標準', description: 'バランスの良いサイズ', color: '#66b3ff' },
      { value: 'large', label: '大きめ', description: '迫力と存在感のあるサイズ', color: '#99ff99' }
    ]
  },
  {
    key: 'personality',
    title: '性格・雰囲気',
    icon: '✨',
    options: [
      { value: 'calm', label: '穏やか', description: '落ち着いて優雅な印象', color: '#a8e6cf' },
      { value: 'active', label: '活発', description: '元気で動きのある印象', color: '#ffd93d' },
      { value: 'elegant', label: '上品', description: '洗練された美しい印象', color: '#c7cedb' },
      { value: 'unique', label: '個性的', description: 'ユニークで印象的な外見', color: '#ff8b94' }
    ]
  }
];

export default function Step2BasicFeatures({ selections, onSelectionsChange }: Step2BasicFeaturesProps) {
  const handleOptionChange = (key: keyof AISelections, value: string) => {
    onSelectionsChange({ [key]: value });
  };

  return (
    <div className="step2-basic-features">
      <div className="ai-step-content-header">
        <h3 className="ai-step-content-title">
          <span className="ai-step-content-icon">🐟</span>
          基本特徴を設定してください
        </h3>
        <p className="ai-step-content-description">
          金魚の基本的な特徴を設定します。これらの設定がAI生成の基盤となります。
        </p>
      </div>

      <div className="feature-groups">
        {BASIC_FEATURES.map((group) => (
          <div key={group.key} className="feature-group">
            <div className="group-header">
              <h4 className="group-title">
                <span className="group-icon">{group.icon}</span>
                {group.title}
              </h4>
            </div>

            <div className="options-grid">
              {group.options.map((option) => {
                const isSelected = selections[group.key] === option.value;
                
                return (
                  <div
                    key={option.value}
                    className={`option-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleOptionChange(group.key, option.value)}
                    style={{
                      '--option-color': typeof option.color === 'string' && option.color.startsWith('#') 
                        ? option.color 
                        : '#3b82f6'
                    } as React.CSSProperties}
                  >
                    <div className="option-visual">
                      <div 
                        className="option-color-display"
                        style={{
                          background: option.color || '#3b82f6',
                          border: option.value === 'white' ? '2px solid #e2e8f0' : 'none'
                        }}
                      ></div>
                      {isSelected && (
                        <div className="selection-check">✓</div>
                      )}
                    </div>
                    
                    <div className="option-content">
                      <h5 className="option-label">{option.label}</h5>
                      <p className="option-description">{option.description}</p>
                    </div>
                    
                    <div className="option-footer">
                      <div className="selection-status">
                        {isSelected ? '選択中' : 'クリックして選択'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="selection-preview">
        <div className="preview-card">
          <h4 className="preview-title">
            <span className="preview-icon">👁️</span>
            設定プレビュー
          </h4>
          <div className="preview-content">
            <div className="preview-items">
              <div className="preview-item">
                <span className="preview-label">体型:</span>
                <span className="preview-value">
                  {BASIC_FEATURES[0].options.find(opt => opt.value === selections.bodyType)?.label}
                </span>
              </div>
              <div className="preview-item">
                <span className="preview-label">色:</span>
                <span className="preview-value">
                  {BASIC_FEATURES[1].options.find(opt => opt.value === selections.baseColor)?.label}
                </span>
              </div>
              <div className="preview-item">
                <span className="preview-label">サイズ:</span>
                <span className="preview-value">
                  {BASIC_FEATURES[2].options.find(opt => opt.value === selections.size)?.label}
                </span>
              </div>
              <div className="preview-item">
                <span className="preview-label">雰囲気:</span>
                <span className="preview-value">
                  {BASIC_FEATURES[3].options.find(opt => opt.value === selections.personality)?.label}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="step-tips">
        <h5 className="tips-title">
          <span className="tips-icon">💡</span>
          設定のヒント
        </h5>
        <ul className="tips-list">
          <li>
            <strong>体型</strong>は金魚全体の印象を大きく左右します
          </li>
          <li>
            <strong>基本色</strong>は後の詳細設定でも重要な基準となります
          </li>
          <li>
            <strong>性格・雰囲気</strong>はヒレの形や目の表情に影響します
          </li>
        </ul>
      </div>
    </div>
  );
}