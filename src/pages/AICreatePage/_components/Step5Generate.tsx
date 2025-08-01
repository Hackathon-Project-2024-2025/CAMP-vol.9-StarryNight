import { useState } from 'react';
import type { AISelections, AIGenerationStatus } from '../../../types/ai.types';
import './Step5Generate.css';

interface Step5GenerateProps {
  selections: AISelections;
  customText: string;
  onCustomTextChange: (text: string) => void;
  onGenerate: () => void;
  generationStatus: AIGenerationStatus;
  errorMessage: string;
}

const EXAMPLE_PROMPTS = [
  '和風で上品な印象にしたい',
  '子供っぽくて可愛らしい感じで',
  '豪華で派手な金魚を作って',
  'シンプルで洗練されたデザイン',
  '祭りの縁日にいそうな金魚',
  'おもちゃのような可愛い金魚',
  '神秘的で幻想的な雰囲気',
  '温かみのある家庭的な印象'
];

export default function Step5Generate({
  selections,
  customText,
  onCustomTextChange,
  onGenerate,
  generationStatus,
  errorMessage
}: Step5GenerateProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [charCount, setCharCount] = useState(customText.length);

  const handleTextChange = (newText: string) => {
    if (newText.length <= 200) {
      onCustomTextChange(newText);
      setCharCount(newText.length);
    }
  };

  const handleExampleClick = (example: string) => {
    handleTextChange(example);
  };

  const isGenerating = generationStatus === 'generating';
  const canGenerate = !isGenerating;

  return (
    <div className="step5-generate">
      <div className="ai-step-content-header">
        <h3 className="ai-step-content-title">
          <span className="ai-step-content-icon">✨</span>
          AI生成の準備完了！
        </h3>
        <p className="ai-step-content-description">
          最後に、追加のカスタム要望があれば入力してください。その後、AI生成を実行します。
        </p>
      </div>

      {/* 設定要約 */}
      <div className="settings-overview">
        <h4 className="overview-title">
          <span className="overview-icon">📋</span>
          現在の設定
        </h4>
        <div className="overview-grid">
          <div className="overview-item">
            <span className="overview-label">AIモデル:</span>
            <span className="overview-value">{selections.model === 'chatgpt' ? 'ChatGPT' : 'Gemini'}</span>
          </div>
          <div className="overview-item">
            <span className="overview-label">体型:</span>
            <span className="overview-value">{selections.bodyType}</span>
          </div>
          <div className="overview-item">
            <span className="overview-label">基本色:</span>
            <span className="overview-value">{selections.baseColor}</span>
          </div>
          <div className="overview-item">
            <span className="overview-label">サイズ:</span>
            <span className="overview-value">{selections.size}</span>
          </div>
          <div className="overview-item">
            <span className="overview-label">性格:</span>
            <span className="overview-value">{selections.personality}</span>
          </div>
          <div className="overview-item">
            <span className="overview-label">ヒレ:</span>
            <span className="overview-value">{selections.fins}</span>
          </div>
        </div>
      </div>

      {/* カスタムテキスト入力 */}
      <div className="custom-input-section">
        <h4 className="input-title">
          <span className="input-icon">💭</span>
          追加の要望（オプション）
        </h4>
        <p className="input-description">
          さらに具体的な要望があれば、自由に入力してください。
        </p>

        <div className="text-input-container">
          <textarea
            value={customText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="例: もっと可愛らしく、温かみのある色合いで..."
            className={`custom-textarea ${isExpanded ? 'expanded' : ''}`}
            disabled={isGenerating}
            maxLength={200}
            rows={isExpanded ? 4 : 2}
            onFocus={() => setIsExpanded(true)}
          />
          <div className="textarea-footer">
            <span className="char-counter">
              {charCount}/200文字
            </span>
            <button
              type="button"
              className="expand-button"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? '縮小' : '拡大'}
            </button>
          </div>
        </div>

        <div className="example-prompts">
          <h5 className="examples-title">💡 入力例:</h5>
          <div className="examples-grid">
            {EXAMPLE_PROMPTS.map((example, index) => (
              <button
                key={index}
                type="button"
                className="example-button"
                onClick={() => handleExampleClick(example)}
                disabled={isGenerating}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 生成ボタンセクション */}
      <div className="generation-section">
        <div className="generation-card">
          <h4 className="generation-title">
            <span className="generation-icon">🎨</span>
            {isGenerating ? 'AI生成中...' : 'AI生成実行'}
          </h4>
          
          {!isGenerating && (
            <p className="generation-description">
              設定内容に基づいて、AIが素敵な金魚を生成します。
            </p>
          )}

          <button
            type="button"
            className={`generate-button ${isGenerating ? 'generating' : ''}`}
            onClick={onGenerate}
            disabled={!canGenerate}
          >
            <div className="button-content">
              {isGenerating ? (
                <>
                  <div className="loading-spinner">
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                  </div>
                  <span className="button-text">AI生成中...</span>
                </>
              ) : (
                <>
                  <span className="button-icon">✨</span>
                  <span className="button-text">金魚を生成する</span>
                  <span className="button-arrow">→</span>
                </>
              )}
            </div>
            
            {isGenerating && (
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
            )}
          </button>

          {/* ステータス表示 */}
          {generationStatus !== 'idle' && (
            <div className={`status-display ${generationStatus}`}>
              {generationStatus === 'generating' && (
                <div className="generating-status">
                  <div className="status-icon">🔄</div>
                  <p className="status-text">AIが創造力を発揮しています...</p>
                </div>
              )}
              {generationStatus === 'success' && (
                <div className="success-status">
                  <div className="status-icon">✅</div>
                  <p className="status-text">金魚の生成が完了しました！</p>
                </div>
              )}
              {generationStatus === 'error' && (
                <div className="error-status">
                  <div className="status-icon">❌</div>
                  <p className="status-text">生成中にエラーが発生しました</p>
                  {errorMessage && (
                    <p className="error-message">{errorMessage}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 生成のヒント */}
      <div className="generation-tips">
        <h5 className="tips-title">
          <span className="tips-icon">🚀</span>
          生成のコツ
        </h5>
        <ul className="tips-list">
          <li>具体的な要望を入力すると、より理想に近い結果が得られます</li>
          <li>「可愛い」「上品」「華やか」などの印象を伝えるのも効果的です</li>
          <li>生成結果が気に入らない場合は、要望を調整して再生成できます</li>
          <li>空欄でも基本設定だけで素敵な金魚が生成されます</li>
        </ul>
      </div>
    </div>
  );
}