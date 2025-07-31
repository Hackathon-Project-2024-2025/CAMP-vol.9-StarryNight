import { useState } from 'react';
import './AIActionButtons.css';

interface AIActionButtonsProps {
  onSave: () => void;
  onReset: () => void;
  fishName: string;
  onNameChange: (name: string) => void;
  disabled?: boolean;
}

export default function AIActionButtons({ 
  onSave, 
  onReset, 
  fishName, 
  onNameChange,
  disabled = false
}: AIActionButtonsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(fishName);

  const handleNameEdit = () => {
    if (!disabled) {
      setIsEditing(true);
      setTempName(fishName);
    }
  };

  const handleNameSave = () => {
    onNameChange(tempName.trim() || 'AI生成金魚');
    setIsEditing(false);
  };

  const handleNameCancel = () => {
    setTempName(fishName);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      handleNameCancel();
    }
  };

  return (
    <div className={`ai-action-buttons ${disabled ? 'disabled' : ''}`}>
      <div className="actions-header">
        <h3 className="actions-title">
          <span className="actions-icon">🎯</span>
          アクション
        </h3>
        <p className="actions-description">
          生成された金魚の保存や設定リセットができます
        </p>
      </div>

      <div className="actions-container">
        {/* 魚の名前設定 */}
        <div className="fish-naming">
          <label className="naming-label">
            <span className="label-icon">🏷️</span>
            金魚の名前
          </label>
          
          {isEditing ? (
            <div className="name-edit-container">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={handleKeyPress}
                className="name-input"
                placeholder="金魚の名前を入力"
                autoFocus
                maxLength={20}
                disabled={disabled}
              />
              <div className="name-edit-buttons">
                <button
                  className="name-button name-button-save"
                  onClick={handleNameSave}
                  disabled={!tempName.trim() || disabled}
                  title="名前を保存"
                >
                  ✓
                </button>
                <button
                  className="name-button name-button-cancel"
                  onClick={handleNameCancel}
                  disabled={disabled}
                  title="編集をキャンセル"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <div className="name-display-container">
              <span className="fish-name-display">{fishName}</span>
              <button
                className="name-edit-trigger"
                onClick={handleNameEdit}
                title="名前を編集"
                disabled={disabled}
              >
                ✏️
              </button>
            </div>
          )}
        </div>

        {/* アクションボタングループ */}
        <div className="button-group">
          <button
            className="action-button action-button-reset"
            onClick={onReset}
            title="すべての設定をリセット"
            disabled={disabled}
          >
            <span className="button-icon">🔄</span>
            <span className="button-text">リセット</span>
          </button>
          
          <button
            className="action-button action-button-save"
            onClick={onSave}
            title="AI生成した金魚を画像として保存"
            disabled={disabled}
          >
            <span className="button-icon">📸</span>
            <span className="button-text">画像保存</span>
          </button>
        </div>
        
        {/* ヒント */}
        <div className="tips">
          <p className="tip-text">
            💡 <strong>ヒント:</strong> AI生成した金魚は高品質PNG画像として保存できます！
          </p>
        </div>

        {disabled && (
          <div className="disabled-overlay">
            <div className="disabled-message">
              <span className="disabled-icon">⏳</span>
              <span className="disabled-text">AI生成完了後に利用可能になります</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}