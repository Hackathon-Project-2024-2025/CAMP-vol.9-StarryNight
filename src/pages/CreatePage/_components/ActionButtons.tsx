import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveFishToAquarium } from '../../../services/storage/localStorage';
import type { FishDesign } from '../../../types/common.types';
import './ActionButtons.css';

interface ActionButtonsProps {
  onSave: () => void;
  onReset: () => void;
  fishName: string;
  onNameChange: (name: string) => void;
  fishDesign: FishDesign;
}

export default function ActionButtons({ 
  onSave, 
  onReset, 
  fishName, 
  onNameChange,
  fishDesign
}: ActionButtonsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(fishName);
  const [isMovingToAquarium, setIsMovingToAquarium] = useState(false);
  const navigate = useNavigate();

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

  const handleMoveToAquarium = async () => {
    try {
      setIsMovingToAquarium(true);
      
      // 最新の名前で金魚データを更新
      const updatedFishDesign = {
        ...fishDesign,
        name: fishName
      };
      
      // 金魚を水槽に保存
      saveFishToAquarium(updatedFishDesign);
      
      // 少し待ってから水槽ページに移動
      setTimeout(() => {
        navigate('/panel');
      }, 500);
      
    } catch (error) {
      console.error('Error moving fish to aquarium:', error);
      setIsMovingToAquarium(false);
    }
  };

  const handleShareToX = () => {
    const tweetText = encodeURIComponent(`🎣 ぼくの作った魚「${fishName}」を見てみて！ #自作魚`);
    const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
    window.open(tweetUrl, "_blank");
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

      <div className="button-groups">
        <div className="button-group reset-save-group">
          <button
            className="action-button action-button-reset"
            onClick={onReset}
            title="すべてリセット"
          >
            <span className="button-text">リセット</span>
          </button>
          
          <button
            className="action-button action-button-save"
            onClick={onSave}
            title="魚を画像として保存"
          >
            <span className="button-text">画像保存</span>
          </button>
        </div>
        <div className="button-group aquarium-share-group">
          <button
            className="action-button action-button-aquarium"
            onClick={handleMoveToAquarium}
            disabled={isMovingToAquarium}
            title="魚を水槽に移動"
          >
            <span className="button-text">
              {isMovingToAquarium ? '移動中...' : '水槽へ移動'}
            </span>
          </button>
          <button
            className="action-button action-button-twitter"
            onClick={handleShareToX}
            title="Xに投稿"
          >
            <span className="button-text">Xに投稿</span>
          </button>
        </div>
      </div>
      
      <div className="tips">
        <p className="tip-text">
          💡 <strong>ヒント:</strong> 作成した魚は画像保存または水槽に移動してみんなと共有できます！
        </p>
      </div>
    </div>
  );
}