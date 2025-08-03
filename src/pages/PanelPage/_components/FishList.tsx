import { useRef, useEffect, useCallback } from 'react';
import type { FishDesign } from '../../../types/common.types';
import type { AIFishImage } from '../../../services/storage/localStorage';
import { removeFishFromAquarium, removeAIFishImageFromAquarium } from '../../../services/storage/localStorage';
import './FishList.css';

interface FishListProps {
  fishList: FishDesign[];
  aiFishImages: AIFishImage[];
  onFishRemove: (fishId: string) => void;
  onAIFishRemove: (imageId: string) => void;
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

  // 体型に応じた寸法を取得するヘルパー関数（サムネイル用）
  const getBodyDimensionsThumbnail = useCallback((shape: string, baseSize: number) => {
    switch (shape) {
      case 'round':
        return { width: baseSize * 0.8, height: baseSize * 0.6 };
      case 'streamlined':
        return { width: baseSize * 1.2, height: baseSize * 0.5 };
      case 'flat':
        return { width: baseSize * 1.0, height: baseSize * 0.3 };
      case 'elongated':
        return { width: baseSize * 1.5, height: baseSize * 0.4 };
      default:
        return { width: baseSize * 0.8, height: baseSize * 0.6 };
    }
  }, []);

  // 魚の形状を描画するヘルパー関数（サムネイル用）
  const drawFishShapeThumbnail = useCallback((
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    shape: string
  ) => {
    const headX = x + width * 0.3;
    const tailX = x - width * 0.3;
    
    switch (shape) {
      case 'round':
        ctx.moveTo(tailX, y);
        ctx.quadraticCurveTo(x - width * 0.1, y - height * 0.8, x + width * 0.1, y - height * 0.7);
        ctx.quadraticCurveTo(headX, y - height * 0.5, headX + width * 0.1, y);
        ctx.quadraticCurveTo(headX, y + height * 0.5, x + width * 0.1, y + height * 0.7);
        ctx.quadraticCurveTo(x - width * 0.1, y + height * 0.8, tailX, y);
        break;
      case 'streamlined':
        ctx.moveTo(tailX, y);
        ctx.quadraticCurveTo(x, y - height * 0.6, headX - width * 0.05, y - height * 0.4);
        ctx.quadraticCurveTo(headX + width * 0.15, y - height * 0.2, headX + width * 0.2, y);
        ctx.quadraticCurveTo(headX + width * 0.15, y + height * 0.2, headX - width * 0.05, y + height * 0.4);
        ctx.quadraticCurveTo(x, y + height * 0.6, tailX, y);
        break;
      case 'flat':
        ctx.moveTo(tailX, y);
        ctx.quadraticCurveTo(x, y - height * 0.9, headX, y - height * 0.8);
        ctx.quadraticCurveTo(headX + width * 0.1, y, headX, y + height * 0.8);
        ctx.quadraticCurveTo(x, y + height * 0.9, tailX, y);
        break;
      case 'elongated':
      default:
        ctx.moveTo(tailX, y);
        ctx.quadraticCurveTo(x - width * 0.1, y - height * 0.8, x + width * 0.1, y - height * 0.7);
        ctx.quadraticCurveTo(headX, y - height * 0.5, headX + width * 0.1, y);
        ctx.quadraticCurveTo(headX, y + height * 0.5, x + width * 0.1, y + height * 0.7);
        ctx.quadraticCurveTo(x - width * 0.1, y + height * 0.8, tailX, y);
    }
    ctx.closePath();
  }, []);

  // サムネイル用の簡単な模様描画
  const drawSimplePattern = useCallback((ctx: CanvasRenderingContext2D, design: FishDesign, x: number, y: number, size: number) => {
    const pattern = design.bodyPattern;
    if (!pattern) return;

    const bodyDimensions = getBodyDimensionsThumbnail(design.base.shape, size);
    const bodyWidth = bodyDimensions.width;
    const bodyHeight = bodyDimensions.height;
    
    ctx.save();
    ctx.globalAlpha = 0.4;

    // 体の形状にクリッピングパスを設定
    ctx.beginPath();
    drawFishShapeThumbnail(ctx, x, y, bodyWidth, bodyHeight, design.base.shape);
    ctx.clip();

    switch (pattern.type) {
      case 'spotted': {
        const spotColor = pattern.colors?.[0] || '#ffffff';
        ctx.fillStyle = spotColor;
        
        // サムネイル用に数を減らしたスポット
        for (let i = 0; i < 5; i++) {
          const spotX = x + (Math.random() - 0.5) * bodyWidth * 0.8;
          const spotY = y + (Math.random() - 0.5) * bodyHeight * 0.8;
          const spotSize = Math.random() * 3 + 2;
          
          ctx.beginPath();
          ctx.arc(spotX, spotY, spotSize, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'striped': {
        const stripeColor = pattern.colors?.[1] || '#ffffff';
        const direction = pattern.direction || 'horizontal';
        const stripeWidth = 2;
        const spacing = 6;

        const numStripes = direction === 'horizontal' ? 4 : 3;
        
        for (let i = 0; i < numStripes; i++) {
          ctx.fillStyle = i % 2 === 0 ? design.customizations.bodyColor : stripeColor;
          
          if (direction === 'horizontal') {
            const stripeY = y - bodyHeight/2 + (i * spacing);
            ctx.fillRect(x - bodyWidth/2, stripeY, bodyWidth, stripeWidth);
          } else {
            const stripeX = x - bodyWidth/2 + (i * spacing);
            ctx.fillRect(stripeX, y - bodyHeight/2, stripeWidth, bodyHeight);
          }
        }
        break;
      }
    }

    ctx.restore();
  }, [getBodyDimensionsThumbnail, drawFishShapeThumbnail]);

  // サムネイル用の簡単なアクセサリー描画
  const drawSimpleAccessories = useCallback((ctx: CanvasRenderingContext2D, design: FishDesign, x: number, y: number, size: number) => {
    if (!design.accessories || design.accessories.length === 0) return;

    const bodyDimensions = getBodyDimensionsThumbnail(design.base.shape, size);
    
    design.accessories.forEach(accessory => {
      if (!accessory.visible) return;
      
      ctx.save();
      
      const accessorySize = size * 0.15;
      let accessoryX = x;
      let accessoryY = y - bodyDimensions.height * 0.8;
      
      ctx.fillStyle = accessory.color || '#ffd700';
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 1;
      
      switch (accessory.category) {
        case 'crown': {
          // 簡単な王冠
          ctx.beginPath();
          ctx.rect(accessoryX - accessorySize/2, accessoryY, accessorySize, accessorySize * 0.3);
          ctx.fill();
          ctx.stroke();
          
          // 中央のトゲ
          ctx.beginPath();
          ctx.moveTo(accessoryX, accessoryY);
          ctx.lineTo(accessoryX, accessoryY - accessorySize * 0.5);
          ctx.stroke();
          break;
        }

        case 'glasses': {
          // 簡単なメガネ
          accessoryX = x + bodyDimensions.width * 0.2;
          accessoryY = y - bodyDimensions.height * 0.2;
          
          ctx.strokeStyle = accessory.color || '#34495e';
          ctx.lineWidth = 2;
          
          ctx.beginPath();
          ctx.arc(accessoryX, accessoryY, accessorySize * 0.6, 0, Math.PI * 2);
          ctx.stroke();
          break;
        }

        case 'hat': {
          // 簡単な帽子
          ctx.beginPath();
          ctx.rect(accessoryX - accessorySize/3, accessoryY - accessorySize/2, accessorySize/1.5, accessorySize/2);
          ctx.fill();
          ctx.stroke();
          break;
        }

        case 'ribbon': {
          // 簡単なリボン
          ctx.beginPath();
          ctx.arc(accessoryX - accessorySize/3, accessoryY, accessorySize/3, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          
          ctx.beginPath();
          ctx.arc(accessoryX + accessorySize/3, accessoryY, accessorySize/3, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          break;
        }
      }
      
      ctx.restore();
    });
  }, [getBodyDimensionsThumbnail]);

  // 改善された魚の描画（サムネイル用）
  const drawFishThumbnail = useCallback((
    ctx: CanvasRenderingContext2D,
    design: FishDesign,
    width: number,
    height: number
  ) => {
    ctx.clearRect(0, 0, width, height);
    
    const centerX = width / 2;
    const centerY = height / 2;
    const size = Math.min(width, height) * 0.4;
    
    const bodyDimensions = getBodyDimensionsThumbnail(design.base.shape, size);
    const bodyWidth = bodyDimensions.width;
    const bodyHeight = bodyDimensions.height;
    
    // 体を描画
    const gradient = ctx.createLinearGradient(
      centerX - bodyWidth/2, centerY - bodyHeight/2,
      centerX + bodyWidth/2, centerY + bodyHeight/2
    );
    gradient.addColorStop(0, design.customizations.bodyColor);
    gradient.addColorStop(0.5, design.customizations.bodyColor);
    gradient.addColorStop(1, adjustBrightness(design.customizations.bodyColor, -20));
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    drawFishShapeThumbnail(ctx, centerX, centerY, bodyWidth, bodyHeight, design.base.shape);
    ctx.fill();
    
    // 体の輪郭
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // 模様を描画
    if (design.bodyPattern) {
      drawSimplePattern(ctx, design, centerX, centerY, size);
    }
    
    // 尾ビレ
    ctx.fillStyle = design.customizations.finColor;
    ctx.beginPath();
    const tailX = centerX - bodyWidth * 0.3;
    ctx.moveTo(tailX, centerY);
    ctx.lineTo(tailX - bodyWidth * 0.4, centerY - bodyHeight * 0.4);
    ctx.lineTo(tailX - bodyWidth * 0.6, centerY);
    ctx.lineTo(tailX - bodyWidth * 0.4, centerY + bodyHeight * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // 目を描画
    const eyeSize = size * 0.1;
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
    
    // アクセサリーを描画
    if (design.accessories && design.accessories.length > 0) {
      drawSimpleAccessories(ctx, design, centerX, centerY, size);
    }
  }, [adjustBrightness, getBodyDimensionsThumbnail, drawFishShapeThumbnail, drawSimplePattern, drawSimpleAccessories]);

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

// AI画像魚サムネイルコンポーネント
function AIFishThumbnail({ aiFish, onRemove }: { aiFish: AIFishImage; onRemove: () => void }) {
  const handleRemove = () => {
    removeAIFishImageFromAquarium(aiFish.id);
    onRemove();
  };

  return (
    <div className="fish-item ai-fish-item">
      <div className="fish-thumbnail ai-fish-thumbnail">
        <img 
          src={`data:image/png;base64,${aiFish.imageData}`}
          alt={aiFish.name}
          className="ai-fish-image"
        />
      </div>
      
      <div className="fish-info">
        <div className="fish-name">{aiFish.name}</div>
        <div className="fish-details">
          <span className="ai-generated-label">AI生成</span>
          <span className="fish-model">{aiFish.aiModel}</span>
        </div>
      </div>
      
      <button 
        className="remove-button"
        onClick={handleRemove}
        title="この金魚を削除"
      >
        🗑️
      </button>
    </div>
  );
}

export default function FishList({ fishList, aiFishImages, onFishRemove, onAIFishRemove }: FishListProps) {
  const handleFishRemove = (fishId: string) => {
    onFishRemove(fishId);
  };

  const handleAIFishRemove = (imageId: string) => {
    onAIFishRemove(imageId);
  };

  const totalFishCount = fishList.length + aiFishImages.length;

  return (
    <div className="fish-list">
      <div className="list-header">
        <h3 className="list-title">🐠 水槽の金魚</h3>
        <span className="fish-count-badge">
          {totalFishCount}匹
        </span>
      </div>
      
      <div className="fish-items">
        {totalFishCount === 0 ? (
          <div className="empty-list">
            <div className="empty-icon">🐠</div>
            <p className="empty-text">
              まだ金魚がいません<br />
              手作りまたはAI生成で作成してください！
            </p>
          </div>
        ) : (
          <>
            {/* 手作り金魚（Canvas描画） */}
            {fishList.map((fish) => (
              <FishThumbnail
                key={fish.id}
                fish={fish}
                onRemove={() => handleFishRemove(fish.id)}
              />
            ))}
            
            {/* AI生成金魚（画像） */}
            {aiFishImages.map((aiFish) => (
              <AIFishThumbnail
                key={aiFish.id}
                aiFish={aiFish}
                onRemove={() => handleAIFishRemove(aiFish.id)}
              />
            ))}
          </>
        )}
      </div>
      
      {totalFishCount > 0 && (
        <div className="list-footer">
          <p className="list-tip">
            💡 不要な金魚は🗑️ボタンで削除できます
          </p>
        </div>
      )}
    </div>
  );
}