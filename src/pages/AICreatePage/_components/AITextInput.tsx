import { useState } from 'react';
import './AITextInput.css';

interface AITextInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

// 入力例のテンプレート
const INPUT_EXAMPLES = [
  '和風で上品な印象にしたい',
  '子供っぽくて可愛らしい感じで',
  '豪華で派手な金魚を作って',
  'シンプルで洗練されたデザイン',
  '祭りの縁日にいそうな金魚',
  '宮殿にいるような高貴な金魚',
  'おもちゃのような可愛い金魚',
  '神秘的で幻想的な雰囲気'
];

export default function AITextInput({ value, onChange, disabled = false }: AITextInputProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [charCount, setCharCount] = useState(value.length);

  const handleChange = (newValue: string) => {
    if (newValue.length <= 200 && !disabled) { // 最大文字数制限
      onChange(newValue);
      setCharCount(newValue.length);
    }
  };

  const handleExampleClick = (example: string) => {
    handleChange(example);
  };

  const handleClear = () => {
    handleChange('');
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="ai-text-input">
      <div className="input-header">
        <h3 className="input-title">
          <span className="title-icon">💬</span>
          追加の要望（オプション）
        </h3>
        <p className="input-description">
          セレクトボックスでは表現しきれない細かな要望を自由に入力してください
        </p>
      </div>

      <div className="input-container">
        <div className="textarea-wrapper">
          <textarea
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="例：「和風で上品な印象にしたい」「子供っぽくて可愛らしい感じで」など"
            className={`text-input ${isExpanded ? 'expanded' : ''}`}
            rows={isExpanded ? 4 : 2}
          />
          
          <div className="input-controls">
            <div className="char-counter">
              <span className={`char-count ${charCount > 180 ? 'warning' : ''}`}>
                {charCount}/200
              </span>
            </div>
            
            <div className="control-buttons">
              {value && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="control-button clear-button"
                  title="クリア"
                >
                  ✕
                </button>
              )}
              
              <button
                type="button"
                onClick={toggleExpanded}
                className="control-button expand-button"
                title={isExpanded ? '縮小' : '拡大'}
              >
                {isExpanded ? '🔽' : '🔼'}
              </button>
            </div>
          </div>
        </div>

        {/* 入力例テンプレート */}
        <div className="input-examples">
          <h4 className="examples-title">
            <span className="examples-icon">💡</span>
            入力例
          </h4>
          
          <div className="examples-grid">
            {INPUT_EXAMPLES.map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleExampleClick(example)}
                className="example-button"
                title={`「${example}」を入力`}
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* ヒントとコツ */}
        <div className="input-tips">
          <div className="tips-header">
            <span className="tips-icon">🎯</span>
            <span className="tips-title">効果的な入力のコツ</span>
          </div>
          
          <ul className="tips-list">
            <li>「和風」「モダン」「クラシック」などスタイルを指定</li>
            <li>「上品」「可愛い」「クール」など印象を描写</li>
            <li>「祭り」「宮殿」「庭園」など場面をイメージ</li>
            <li>具体的で分かりやすい表現を心がける</li>
          </ul>
        </div>
      </div>
    </div>
  );
}