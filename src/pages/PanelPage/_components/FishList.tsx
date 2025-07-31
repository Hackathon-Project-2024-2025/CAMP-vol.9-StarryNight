import { useRef, useEffect, useCallback } from 'react';
import type { FishDesign } from '../../../types/common.types';
import { removeFishFromAquarium } from '../../../services/storage/localStorage';
import './FishList.css';

interface FishListProps {
  fishList: FishDesign[];
  onFishRemove: (fishId: string) => void;
}

interface FishThumbnailProps {
  fish: FishDesign;
  onRemove: () => void;
}

function FishThumbnail({ fish, onRemove }: FishThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 色の明度調整ヘルパー関数
  const adjustBrightness = useCallback((color: string, amount: number) => {
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  }, []);

  // 簡単な魚の描画（サムネイル用）
  const drawFishThumbnail = useCallback((
    ctx: CanvasRenderingContext2D,
    design: FishDesign,
    width: number,
    height: number
  ) => {
    ctx.clearRect(0, 0, width, height);
    
    const centerX = width / 2;
    const centerY = height / 2;
    const size = Math.min(width, height) * 0.3;
    
    // 体を描画
    const bodyWidth = size * 0.8;
    const bodyHeight = size * 0.6;
    
    const gradient = ctx.createLinearGradient(
      centerX - bodyWidth/2, centerY - bodyHeight/2,
      centerX + bodyWidth/2, centerY + bodyHeight/2
    );
    gradient.addColorStop(0, design.customizations.bodyColor);
    gradient.addColorStop(1, adjustBrightness(design.customizations.bodyColor, -20));
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    
    // 簡単な魚の形状
    const headX = centerX + bodyWidth * 0.3;
    const tailX = centerX - bodyWidth * 0.3;
    
    ctx.moveTo(tailX, centerY);
    ctx.quadraticCurveTo(centerX - bodyWidth * 0.1, centerY - bodyHeight * 0.8, centerX + bodyWidth * 0.1, centerY - bodyHeight * 0.7);
    ctx.quadraticCurveTo(headX, centerY - bodyHeight * 0.5, headX + bodyWidth * 0.1, centerY);
    ctx.quadraticCurveTo(headX, centerY + bodyHeight * 0.5, centerX + bodyWidth * 0.1, centerY + bodyHeight * 0.7);
    ctx.quadraticCurveTo(centerX - bodyWidth * 0.1, centerY + bodyHeight * 0.8, tailX, centerY);
    ctx.closePath();
    
    ctx.fill();
    
    // 体の輪郭
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // 目を描画
    const eyeSize = size * 0.12;
    const eyeX = centerX + bodyWidth * 0.2;
    const eyeY = centerY - bodyHeight * 0.2;
    
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = design.customizations.eyeColor;
    ctx.beginPath();
    ctx.arc(eyeX + eyeSize * 0.1, eyeY, eyeSize * 0.6, 0, Math.PI * 2);
    ctx.fill();
    
    // 尾ビレ
    ctx.fillStyle = design.customizations.finColor;
    ctx.beginPath();
    ctx.moveTo(tailX, centerY);
    ctx.lineTo(tailX - bodyWidth * 0.4, centerY - bodyHeight * 0.4);
    ctx.lineTo(tailX - bodyWidth * 0.6, centerY);
    ctx.lineTo(tailX - bodyWidth * 0.4, centerY + bodyHeight * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }, [adjustBrightness]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    drawFishThumbnail(ctx, fish, rect.width, rect.height);
  }, [fish, drawFishThumbnail]);

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`${fish.name}を水槽から削除しますか？`)) {
      try {
        removeFishFromAquarium(fish.id);
        onRemove();
      } catch (error) {
        console.error('Failed to remove fish:', error);
      }
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <div className="fish-item">
      <div className="fish-thumbnail">
        <canvas
          ref={canvasRef}
          className="fish-canvas"
          width={80}
          height={60}
        />
      </div>
      
      <div className="fish-info">
        <h4 className="fish-name">{fish.name}</h4>
        <p className="fish-details">
          {fish.base.name} • 作成: {formatDate(fish.createdAt)}
        </p>
      </div>
      
      <button
        className="remove-button"
        onClick={handleRemove}
        title={`${fish.name}を削除`}
      >
        🗑️
      </button>
    </div>
  );
}

export default function FishList({ fishList, onFishRemove }: FishListProps) {
  const handleFishRemove = (fishId: string) => {
    onFishRemove(fishId);
  };

  return (
    <div className="fish-list">
      <div className="list-header">
        <h3 className="list-title">🐠 水槽の金魚</h3>
        <span className="fish-count-badge">
          {fishList.length}匹
        </span>
      </div>
      
      <div className="fish-items">
        {fishList.length === 0 ? (
          <div className="empty-list">
            <div className="empty-icon">🐠</div>
            <p className="empty-text">
              まだ金魚がいません<br />
              CreatePageで作成してください！
            </p>
          </div>
        ) : (
          fishList.map((fish) => (
            <FishThumbnail
              key={fish.id}
              fish={fish}
              onRemove={() => handleFishRemove(fish.id)}
            />
          ))
        )}
      </div>
      
      {fishList.length > 0 && (
        <div className="list-footer">
          <p className="list-tip">
            💡 不要な金魚は🗑️ボタンで削除できます
          </p>
        </div>
      )}
    </div>
  );
}