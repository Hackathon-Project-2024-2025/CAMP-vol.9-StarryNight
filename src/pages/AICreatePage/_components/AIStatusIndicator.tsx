import type { AIGenerationStatus } from '../../../types/ai.types';
import './AIStatusIndicator.css';

interface AIStatusIndicatorProps {
  status: AIGenerationStatus;
  errorMessage?: string;
}

// ステータス情報定義
const STATUS_INFO = {
  idle: {
    icon: '⭐',
    title: '生成待機中',
    message: '設定を確認して「金魚を生成する」ボタンをクリックしてください',
    color: '#6b7280',
    bgColor: 'rgba(107, 114, 128, 0.1)',
    borderColor: 'rgba(107, 114, 128, 0.2)'
  },
  generating: {
    icon: '🚀',
    title: 'AI生成中',
    message: 'AIが創造力を発揮しています... しばらくお待ちください',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.1)',
    borderColor: 'rgba(139, 92, 246, 0.3)'
  },
  success: {
    icon: '✅',
    title: '生成完了',
    message: '素晴らしい金魚が生成されました！ プレビューをご確認ください',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)'
  },
  error: {
    icon: '❌',
    title: '生成エラー',
    message: 'AI生成中にエラーが発生しました',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)'
  }
};

export default function AIStatusIndicator({ status, errorMessage }: AIStatusIndicatorProps) {
  const statusInfo = STATUS_INFO[status];
  
  // エラーの場合は、カスタムメッセージがあれば使用
  const displayMessage = status === 'error' && errorMessage 
    ? errorMessage 
    : statusInfo.message;

  return (
    <div 
      className={`ai-status-indicator status-${status}`}
      style={{
        '--status-color': statusInfo.color,
        '--status-bg-color': statusInfo.bgColor,
        '--status-border-color': statusInfo.borderColor,
      } as React.CSSProperties}
    >
      <div className="status-content">
        <div className="status-icon-wrapper">
          <span className="status-icon">{statusInfo.icon}</span>
          {status === 'generating' && (
            <div className="pulse-ring"></div>
          )}
        </div>
        
        <div className="status-text">
          <h4 className="status-title">{statusInfo.title}</h4>
          <p className="status-message">{displayMessage}</p>
        </div>
      </div>
      
      {status === 'generating' && (
        <div className="status-progress">
          <div className="progress-dots">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        </div>
      )}
      
      {status === 'success' && (
        <div className="status-celebration">
          <div className="celebration-particles">
            <span className="particle">✨</span>
            <span className="particle">🎉</span>
            <span className="particle">⭐</span>
            <span className="particle">💫</span>
            <span className="particle">🌟</span>
          </div>
        </div>
      )}
      
      {status === 'error' && errorMessage && (
        <div className="error-details">
          <details className="error-accordion">
            <summary className="error-summary">
              詳細を見る
            </summary>
            <div className="error-content">
              <p className="error-text">{errorMessage}</p>
              <div className="error-actions">
                <button 
                  type="button" 
                  className="retry-button"
                  onClick={() => window.location.reload()}
                >
                  ページを再読み込み
                </button>
              </div>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}