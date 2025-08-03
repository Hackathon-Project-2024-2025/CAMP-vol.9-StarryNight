import type { AISelections } from '../../../types/ai.types';
import './Step4Accessories.css';

interface Step4AccessoriesProps {
  selections: AISelections;
  onSelectionsChange: (changes: Partial<AISelections>) => void;
}

interface AccessoryGroup {
  key: keyof AISelections;
  title: string;
  icon: string;
  position: string;
  options: Array<{
    value: string;
    label: string;
    description: string;
    icon: string;
  }>;
}

const ACCESSORY_GROUPS: AccessoryGroup[] = [
  {
    key: 'headAccessory',
    title: '頭の装飾',
    icon: '👑',
    position: '頭部',
    options: [
      { value: 'none', label: 'なし', description: '装飾なしでシンプルに', icon: '⭕' },
      { value: 'crown', label: '王冠', description: '高貴で華やかな王冠', icon: '👑' },
      { value: 'hat', label: '帽子', description: '可愛らしい帽子', icon: '🎩' },
      { value: 'ribbon', label: 'リボン', description: 'エレガントなリボン', icon: '🎀' }
    ]
  },
  {
    key: 'faceAccessory',
    title: '顔の装飾',
    icon: '👓',
    position: '顔部',
    options: [
      { value: 'none', label: 'なし', description: '装飾なしで自然に', icon: '⭕' },
      { value: 'glasses', label: 'メガネ', description: '知的なメガネ', icon: '👓' },
      { value: 'sunglasses', label: 'サングラス', description: 'クールなサングラス', icon: '🕶️' }
    ]
  },
  {
    key: 'neckAccessory',
    title: '首の装飾',
    icon: '📿',
    position: '首部',
    options: [
      { value: 'none', label: 'なし', description: '装飾なしですっきりと', icon: '⭕' },
      { value: 'necklace', label: 'ネックレス', description: '上品なネックレス', icon: '📿' },
      { value: 'bowtie', label: 'ボウタイ', description: 'フォーマルなボウタイ', icon: '🎩' }
    ]
  }
];

export default function Step4Accessories({ selections, onSelectionsChange }: Step4AccessoriesProps) {
  const handleAccessoryChange = (key: keyof AISelections, value: string) => {
    onSelectionsChange({ [key]: value });
  };


  return (
    <div className="step4-accessories">
      <div className="ai-step-content-header">
        <h3 className="ai-step-content-title">
          <span className="ai-step-content-icon">👑</span>
          アクセサリーを選択してください
        </h3>
        <p className="ai-step-content-description">
          金魚をより個性的に飾るアクセサリーを選択できます。すべて「なし」でもOKです。
        </p>
      </div>

      <div className="accessory-groups">
        {ACCESSORY_GROUPS.map((group) => (
          <div key={group.key} className="accessory-group">
            <div className="group-header">
              <h4 className="group-title">
                <span className="group-icon">{group.icon}</span>
                {group.title}
              </h4>
              <p className="group-position">装着位置: {group.position}</p>
            </div>

            <div className="accessory-options">
              {group.options.map((option) => {
                const isSelected = selections[group.key] === option.value;
                const isNone = option.value === 'none';
                
                return (
                  <div
                    key={option.value}
                    className={`accessory-option ${isSelected ? 'selected' : ''} ${isNone ? 'none-option' : ''}`}
                    onClick={() => handleAccessoryChange(group.key, option.value)}
                  >
                    <div className="option-header">
                      <div className="option-icon-display">
                        {option.icon}
                      </div>
                      {isSelected && !isNone && (
                        <div className="selection-badge">装着中</div>
                      )}
                      {isSelected && isNone && (
                        <div className="selection-badge none-badge">選択中</div>
                      )}
                    </div>
                    
                    <div className="option-content">
                      <h5 className="option-label">{option.label}</h5>
                      <p className="option-description">{option.description}</p>
                    </div>

                    <div className="option-selector">
                      <div className={`radio-button ${isSelected ? 'selected' : ''}`}>
                        {isSelected && <div className="radio-dot"></div>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>


      <div className="style-suggestions">
        <h5 className="suggestions-title">
          <span className="suggestions-icon">💡</span>
          スタイル提案
        </h5>
        <div className="suggestions-grid">
          <div className="suggestion-item">
            <h6 className="suggestion-name">🎩 フォーマルスタイル</h6>
            <p className="suggestion-desc">帽子 + メガネ + ボウタイで紳士的に</p>
          </div>
          <div className="suggestion-item">
            <h6 className="suggestion-name">👑 ロイヤルスタイル</h6>
            <p className="suggestion-desc">王冠 + ネックレスで高貴に</p>
          </div>
          <div className="suggestion-item">
            <h6 className="suggestion-name">🎀 キュートスタイル</h6>
            <p className="suggestion-desc">リボンだけでシンプル可愛く</p>
          </div>
          <div className="suggestion-item">
            <h6 className="suggestion-name">🕶️ クールスタイル</h6>
            <p className="suggestion-desc">サングラスでクールに決める</p>
          </div>
        </div>
      </div>
    </div>
  );
}