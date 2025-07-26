import { useState } from 'react';
import './ActionButtons.css';

interface ActionButtonsProps {
  onSave: () => void;
  onReset: () => void;
  fishName: string;
  onNameChange: (name: string) => void;
}

export default function ActionButtons({ 
  onSave, 
  onReset, 
  fishName, 
  onNameChange 
}: ActionButtonsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(fishName);

  const handleNameEdit = () => {
    setIsEditing(true);
    setTempName(fishName);
  };

  const handleNameSave = () => {
    onNameChange(tempName);
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
    <div className="action-buttons">
      <div className="fish-naming">
        <label className="naming-label">🏷️ 魚の名前</label>
        
        {isEditing ? (
          <div className="name-edit-container">
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onKeyDown={handleKeyPress}
              className="name-input"
              placeholder="魚の名前を入力"
              autoFocus
              maxLength={20}
            />
            <div className="name-edit-buttons">
              <button
                className="name-button name-button-save"
                onClick={handleNameSave}
                disabled={!tempName.trim()}
              >
                ✓
              </button>
              <button
                className="name-button name-button-cancel"
                onClick={handleNameCancel}
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
            >
              ✏️
            </button>
          </div>
        )}
      </div>

      <div className="button-group">
        <button
          className="action-button action-button-reset"
          onClick={onReset}
          title="すべてリセット"
        >
          <span className="button-icon">🔄</span>
          <span className="button-text">リセット</span>
        </button>
        
        <button
          className="action-button action-button-save"
          onClick={onSave}
          title="魚を保存"
        >
          <span className="button-icon">💾</span>
          <span className="button-text">保存</span>
        </button>
      </div>
      
      <div className="tips">
        <p className="tip-text">
          💡 <strong>ヒント:</strong> 作成した魚は水槽で泳がせることができます！
        </p>
      </div>
    </div>
  );
}