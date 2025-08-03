import './AIGenerateButton.css';

interface AIGenerateButtonProps {
  onGenerate: () => void;
  isGenerating: boolean;
  disabled?: boolean;
}

export default function AIGenerateButton({ 
  onGenerate, 
  isGenerating, 
  disabled = false 
}: AIGenerateButtonProps) {
  const handleClick = () => {
    if (!isGenerating && !disabled) {
      onGenerate();
    }
  };

  return (
    <div className="ai-generate-button-container">
      <div className="generate-header">
        <h3 className="generate-title">
          <span className="generate-icon">✨</span>
          AI生成実行
        </h3>
        <p className="generate-description">
          設定した内容でAI金魚を生成します
        </p>
      </div>

      <div className="generate-button-wrapper">
        <button
          type="button"
          onClick={handleClick}
          disabled={isGenerating || disabled}
          className={`generate-button ${isGenerating ? 'generating' : ''} ${disabled ? 'disabled' : ''}`}
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
                <span className="button-icon">🎨</span>
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

        {!isGenerating && !disabled && (
          <div className="button-hint">
            <p className="hint-text">
              🚀 <strong>準備完了！</strong> ボタンをクリックしてAI金魚を生成しましょう
            </p>
          </div>
        )}

        {isGenerating && (
          <div className="generating-info">
            <p className="info-text">
              🧠 AIが創造力を発揮しています... しばらくお待ちください
            </p>
            <div className="generating-steps">
              <div className="step active">
                <span className="step-icon">📝</span>
                <span className="step-text">プロンプト解析</span>
              </div>
              <div className="step active">
                <span className="step-icon">🎨</span>
                <span className="step-text">デザイン生成</span>
              </div>
              <div className="step">
                <span className="step-icon">🐠</span>
                <span className="step-text">金魚作成</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}