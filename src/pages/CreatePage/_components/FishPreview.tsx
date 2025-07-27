import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import type { FishDesign } from '../../../types/common.types';
import './FishPreview.css';

interface FishPreviewProps {
  fishDesign: FishDesign;
  className?: string;
}

export interface FishPreviewRef {
  exportAsImage: (filename?: string) => void;
}

const FishPreview = forwardRef<FishPreviewRef, FishPreviewProps>(({ fishDesign, className = '' }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 魚の形状に応じたY位置での幅係数を取得
  const getFishShapeFactorAtY = useCallback((shape: string, normalizedY: number) => {
    const absY = Math.abs(normalizedY);
    
    switch (shape) {
      case 'round':
        // 楕円形状の幅
        return Math.sqrt(Math.max(0, 1 - absY * absY)) * 0.9;
      case 'streamlined':
        // 流線型の幅
        return Math.sqrt(Math.max(0, 1 - absY * absY * 1.5)) * 0.95;
      case 'flat':
        // 平型の幅
        return Math.sqrt(Math.max(0, 1 - absY * absY * 0.5)) * 0.85;
      case 'elongated':
        // 細長型の幅
        return Math.sqrt(Math.max(0, 1 - absY * absY * 2)) * 0.8;
      default:
        return Math.sqrt(Math.max(0, 1 - absY * absY)) * 0.9;
    }
  }, []);

  // 体型に応じた寸法を取得するヘルパー関数
  const getBodyDimensions = useCallback((shape: string, baseSize: number) => {
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

  // 色の明度を調整するヘルパー関数
  const adjustBrightness = useCallback((color: string, amount: number) => {
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  }, []);

  // 自然な魚の形状を描画するヘルパー関数
  const drawFishShape = useCallback((
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    shape: string
  ) => {
    // 右向きの魚を描画（頭が右、尾が左）
    const headX = x + width * 0.3;  // 頭部位置
    const tailX = x - width * 0.3;  // 尾部位置
    
    switch (shape) {
      case 'round':
        // 丸型：ふっくらした金魚体型
        ctx.moveTo(tailX, y);
        ctx.quadraticCurveTo(x - width * 0.1, y - height * 0.8, x + width * 0.1, y - height * 0.7);
        ctx.quadraticCurveTo(headX, y - height * 0.5, headX + width * 0.1, y);
        ctx.quadraticCurveTo(headX, y + height * 0.5, x + width * 0.1, y + height * 0.7);
        ctx.quadraticCurveTo(x - width * 0.1, y + height * 0.8, tailX, y);
        break;
        
      case 'streamlined':
        // 流線型：スピード重視の体型
        ctx.moveTo(tailX, y);
        ctx.quadraticCurveTo(x, y - height * 0.6, headX - width * 0.05, y - height * 0.4);
        ctx.quadraticCurveTo(headX + width * 0.15, y - height * 0.2, headX + width * 0.2, y);
        ctx.quadraticCurveTo(headX + width * 0.15, y + height * 0.2, headX - width * 0.05, y + height * 0.4);
        ctx.quadraticCurveTo(x, y + height * 0.6, tailX, y);
        break;
        
      case 'flat':
        // 平型：横に平たい体型
        ctx.moveTo(tailX, y);
        ctx.quadraticCurveTo(x, y - height * 0.9, headX, y - height * 0.8);
        ctx.quadraticCurveTo(headX + width * 0.2, y - height * 0.3, headX + width * 0.2, y);
        ctx.quadraticCurveTo(headX + width * 0.2, y + height * 0.3, headX, y + height * 0.8);
        ctx.quadraticCurveTo(x, y + height * 0.9, tailX, y);
        break;
        
      case 'elongated':
        // 細長型：ウナギのような体型
        ctx.moveTo(tailX, y);
        ctx.quadraticCurveTo(x - width * 0.2, y - height * 0.5, x, y - height * 0.4);
        ctx.quadraticCurveTo(headX - width * 0.1, y - height * 0.3, headX + width * 0.1, y);
        ctx.quadraticCurveTo(headX - width * 0.1, y + height * 0.3, x, y + height * 0.4);
        ctx.quadraticCurveTo(x - width * 0.2, y + height * 0.5, tailX, y);
        break;
    }
    ctx.closePath();
  }, []);

  const drawFish = useCallback((ctx: CanvasRenderingContext2D, design: FishDesign, width: number, height: number) => {
    // キャンバスをクリア
    ctx.clearRect(0, 0, width, height);

    // 魚の中心位置
    const centerX = width / 2;
    const centerY = height / 2;
    const baseSize = design.customizations.size * 80;

    // 体を描画
    drawBody(ctx, design, centerX, centerY, baseSize);
    
    // ヒレを描画
    drawFins(ctx, design, centerX, centerY, baseSize);
    
    // 目を描画
    drawEyes(ctx, design, centerX, centerY, baseSize);
    
    // 口を描画
    drawMouth(ctx, design, centerX, centerY, baseSize);
    
    // ウロコ模様を描画
    drawScales(ctx, design, centerX, centerY, baseSize);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const drawBody = useCallback((ctx: CanvasRenderingContext2D, design: FishDesign, x: number, y: number, size: number) => {
    const bodyDimensions = getBodyDimensions(design.base.shape, size);
    const bodyWidth = bodyDimensions.width;
    const bodyHeight = bodyDimensions.height;
    
    // グラデーション効果を追加
    const gradient = ctx.createLinearGradient(x - bodyWidth, y - bodyHeight/2, x + bodyWidth, y + bodyHeight/2);
    const bodyColor = design.customizations.bodyColor;
    gradient.addColorStop(0, bodyColor);
    gradient.addColorStop(0.5, bodyColor);
    gradient.addColorStop(1, adjustBrightness(bodyColor, -20));
    
    ctx.fillStyle = gradient;
    ctx.beginPath();

    // 自然な魚の形状を描画（右向き）
    switch (design.base.shape) {
      case 'round':
        drawFishShape(ctx, x, y, bodyWidth, bodyHeight, 'round');
        break;
      case 'streamlined':
        drawFishShape(ctx, x, y, bodyWidth, bodyHeight, 'streamlined');
        break;
      case 'flat':
        drawFishShape(ctx, x, y, bodyWidth, bodyHeight, 'flat');
        break;
      case 'elongated':
        drawFishShape(ctx, x, y, bodyWidth, bodyHeight, 'elongated');
        break;
    }
    
    ctx.fill();
    
    // 体の輪郭
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }, [getBodyDimensions, adjustBrightness, drawFishShape]);

  const drawFins = useCallback((ctx: CanvasRenderingContext2D, design: FishDesign, x: number, y: number, size: number) => {
    const bodyDimensions = getBodyDimensions(design.base.shape, size);
    const bodyWidth = bodyDimensions.width;
    const bodyHeight = bodyDimensions.height;
    const finSize = design.customizations.finSize * size * 0.35;
    
    // ヒレのグラデーション
    const finGradient = ctx.createLinearGradient(x - bodyWidth, y - bodyHeight, x + bodyWidth, y + bodyHeight);
    finGradient.addColorStop(0, design.customizations.finColor);
    finGradient.addColorStop(1, adjustBrightness(design.customizations.finColor, -15));
    ctx.fillStyle = finGradient;

    // 背ビレ（魚の背中上部、中央やや後方）
    const dorsalX = x - bodyWidth * 0.1 + design.customizations.dorsalFinPosition.x * bodyWidth * 0.5;
    const dorsalY = y - bodyHeight * 0.9 + design.customizations.dorsalFinPosition.y * bodyHeight * 0.3;
    
    ctx.beginPath();
    switch (design.parts.dorsalFin.renderData.shape) {
      case 'spiky':
        // ギザギザした背ビレ
        ctx.moveTo(dorsalX - finSize * 0.4, dorsalY + finSize * 0.2);
        ctx.lineTo(dorsalX - finSize * 0.2, dorsalY - finSize * 0.8);
        ctx.lineTo(dorsalX, dorsalY - finSize * 0.4);
        ctx.lineTo(dorsalX + finSize * 0.2, dorsalY - finSize * 1.0);
        ctx.lineTo(dorsalX + finSize * 0.4, dorsalY - finSize * 0.6);
        ctx.lineTo(dorsalX + finSize * 0.5, dorsalY + finSize * 0.2);
        ctx.closePath();
        break;
      case 'triangular':
      default:
        // 標準的な三角形の背ビレ
        ctx.moveTo(dorsalX - finSize * 0.4, dorsalY + finSize * 0.2);
        ctx.lineTo(dorsalX + finSize * 0.4, dorsalY + finSize * 0.2);
        ctx.lineTo(dorsalX, dorsalY - finSize * 0.8 * design.parts.dorsalFin.renderData.size);
        ctx.closePath();
    }
    ctx.fill();
    
    // 背ビレの輪郭
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 胸ビレ（横向きの魚なので片側のみ表示）
    const pectoralX = x + bodyWidth * 0.1 + design.customizations.pectoralFinPosition.x * bodyWidth * 0.4;
    const pectoralY = y + bodyHeight * 0.3 + design.customizations.pectoralFinPosition.y * bodyHeight * 0.5;
    
    ctx.fillStyle = finGradient;
    ctx.beginPath();
    if (design.parts.pectoralFins.renderData.shape === 'elongated') {
      // 長い胸ビレ
      ctx.ellipse(pectoralX, pectoralY, finSize * 0.6, finSize * 0.3, Math.PI / 6, 0, Math.PI * 2);
    } else {
      // 標準的な胸ビレ
      ctx.ellipse(pectoralX, pectoralY, finSize * 0.4, finSize * 0.25, Math.PI / 4, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.stroke();

    // 尾ビレ（体の後端）
    const tailX = x - bodyWidth * 0.4 + design.customizations.tailFinPosition.x * bodyWidth * 0.3;
    const tailY = y + design.customizations.tailFinPosition.y * bodyHeight * 0.4;
    
    ctx.fillStyle = finGradient;
    ctx.beginPath();
    switch (design.parts.tailFin.renderData.shape) {
      case 'forked':
        // 二股の尾ビレ
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(tailX - finSize * 0.8, tailY - finSize * 0.6);
        ctx.lineTo(tailX - finSize * 1.2, tailY - finSize * 0.4);
        ctx.lineTo(tailX - finSize * 0.9, tailY);
        ctx.lineTo(tailX - finSize * 1.2, tailY + finSize * 0.4);
        ctx.lineTo(tailX - finSize * 0.8, tailY + finSize * 0.6);
        ctx.closePath();
        break;
      case 'ribbon':
        // リボン状の尾ビレ
        ctx.moveTo(tailX, tailY);
        ctx.quadraticCurveTo(tailX - finSize * 0.6, tailY - finSize * 0.8, tailX - finSize * 1.4, tailY - finSize * 0.3);
        ctx.quadraticCurveTo(tailX - finSize * 1.1, tailY, tailX - finSize * 1.4, tailY + finSize * 0.3);
        ctx.quadraticCurveTo(tailX - finSize * 0.6, tailY + finSize * 0.8, tailX, tailY);
        ctx.closePath();
        break;
      case 'fan':
      default:
        // 扇型の尾ビレ
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(tailX - finSize * 0.8, tailY - finSize * 0.6);
        ctx.lineTo(tailX - finSize * 1.1, tailY);
        ctx.lineTo(tailX - finSize * 0.8, tailY + finSize * 0.6);
        ctx.closePath();
    }
    ctx.fill();
    ctx.stroke();
  }, [getBodyDimensions, adjustBrightness]);

  const drawEyes = useCallback((ctx: CanvasRenderingContext2D, design: FishDesign, x: number, y: number, size: number) => {
    const eyeSize = design.customizations.eyeSize * size * 0.15;
    const bodyDimensions = getBodyDimensions(design.base.shape, size);
    
    // 頭部の位置を計算（魚の右側が頭部）
    const headX = x + bodyDimensions.width * 0.3;
    
    // 目の位置を頭部基準で計算
    const eyeX = headX + design.customizations.eyePosition.x * bodyDimensions.width * 0.3;
    const eyeY = y + design.customizations.eyePosition.y * bodyDimensions.height;

    // 単眼表示（横向きの魚）
    switch (design.parts.eyes.renderData.shape) {
      case 'sleepy':
        // 眠そうな目（半目）
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(eyeX, eyeY, eyeSize, eyeSize * 0.4, 0, 0, Math.PI);
        ctx.fill();

        // 瞳（小さめ）
        ctx.fillStyle = design.customizations.eyeColor;
        ctx.beginPath();
        ctx.ellipse(eyeX, eyeY, eyeSize * 0.6, eyeSize * 0.25, 0, 0, Math.PI);
        ctx.fill();
        break;
        
      case 'circle':
      default: {
        // 通常の丸い目
        const currentEyeSize = design.parts.eyes.renderData.shape === 'circle' && design.parts.eyes.id === 'eyes-large' 
          ? eyeSize * 1.3 : eyeSize;
        
        // 目の白い部分
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(eyeX, eyeY, currentEyeSize, currentEyeSize, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 目の輪郭
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 瞳
        ctx.fillStyle = design.customizations.eyeColor;
        ctx.beginPath();
        ctx.ellipse(eyeX + currentEyeSize * 0.1, eyeY, currentEyeSize * 0.65, currentEyeSize * 0.65, 0, 0, Math.PI * 2);
        ctx.fill();

        // ハイライト
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(eyeX + currentEyeSize * 0.3, eyeY - currentEyeSize * 0.2, currentEyeSize * 0.25, currentEyeSize * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 小さなハイライト
        ctx.beginPath();
        ctx.ellipse(eyeX - currentEyeSize * 0.1, eyeY + currentEyeSize * 0.1, currentEyeSize * 0.1, currentEyeSize * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
    }
  }, [getBodyDimensions]);

  const drawMouth = useCallback((ctx: CanvasRenderingContext2D, design: FishDesign, x: number, y: number, size: number) => {
    const bodyDimensions = getBodyDimensions(design.base.shape, size);
    
    // 頭部の最前端位置を計算
    const headTipX = x + bodyDimensions.width * 0.4;
    
    // 口の位置を頭部前端基準で計算（魚の先端近く、やや下方）
    const mouthX = headTipX + design.customizations.mouthPosition.x * bodyDimensions.width * 0.2;
    const mouthY = y + design.customizations.mouthPosition.y * bodyDimensions.height * 0.8;

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    switch (design.parts.mouth.renderData.shape) {
      case 'large': {
        // 大きな口
        ctx.lineWidth = 3;
        const mouthRadius = size * 0.08;
        
        ctx.beginPath();
        ctx.arc(mouthX, mouthY, mouthRadius, Math.PI * 0.1, Math.PI * 0.9);
        ctx.stroke();
        
        // 口角を下げて自然な表情に
        ctx.beginPath();
        ctx.moveTo(mouthX - mouthRadius * 0.9, mouthY + mouthRadius * 0.4);
        ctx.lineTo(mouthX - mouthRadius * 1.1, mouthY + mouthRadius * 0.6);
        ctx.moveTo(mouthX + mouthRadius * 0.9, mouthY + mouthRadius * 0.4);
        ctx.lineTo(mouthX + mouthRadius * 1.1, mouthY + mouthRadius * 0.6);
        ctx.stroke();
        break;
      }
      case 'small':
      default: {
        // 小さな口
        const mouthRadius = design.parts.mouth.renderData.shape === 'small' ? size * 0.03 : size * 0.05;
        
        ctx.beginPath();
        ctx.arc(mouthX, mouthY, mouthRadius, Math.PI * 0.2, Math.PI * 0.8);
        ctx.stroke();
        break;
      }
    }
  }, [getBodyDimensions]);

  const drawScales = useCallback((ctx: CanvasRenderingContext2D, design: FishDesign, x: number, y: number, size: number) => {
    const bodyDimensions = getBodyDimensions(design.base.shape, size);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;

    // 体型に応じたウロコの配置
    const scalePattern = design.parts.scales.renderData.shape;
    const scaleSize = size * 0.05;
    
    // 魚の形状に沿ったウロコ配置
    const rows = 4;  // ウロコの行数
    const colsPerRow = [5, 7, 7, 5];  // 各行のウロコ数
    
    for (let row = 0; row < rows; row++) {
      const rowY = y + (row - 1.5) * bodyDimensions.height * 0.25;
      const cols = colsPerRow[row];
      
      for (let col = 0; col < cols; col++) {
        // 魚の形状に合わせた横位置の計算
        const normalizedCol = (col - (cols - 1) / 2) / ((cols - 1) / 2);
        const fishShapeFactor = getFishShapeFactorAtY(design.base.shape, (rowY - y) / bodyDimensions.height);
        const scaleX = x + normalizedCol * bodyDimensions.width * fishShapeFactor * 0.8;
        
        // ウロコが魚の体内にあるかチェック
        if (Math.abs(normalizedCol) <= fishShapeFactor) {
          ctx.save();
          ctx.globalAlpha = 0.6;
          ctx.beginPath();
          
          switch (scalePattern) {
            case 'diamond': {
              // ダイヤモンド型のウロコ
              ctx.moveTo(scaleX, rowY - scaleSize);
              ctx.lineTo(scaleX + scaleSize, rowY);
              ctx.lineTo(scaleX, rowY + scaleSize);
              ctx.lineTo(scaleX - scaleSize, rowY);
              ctx.closePath();
              ctx.stroke();
              break;
            }
            case 'basic':
            default: {
              // 基本的なウロコ（扇形）
              const startAngle = row % 2 === 0 ? Math.PI * 0.8 : Math.PI * 1.2;
              const endAngle = startAngle + Math.PI * 0.4;
              ctx.arc(scaleX, rowY, scaleSize, startAngle, endAngle);
              ctx.stroke();
              
              // ウロコの境界線
              ctx.moveTo(scaleX, rowY);
              ctx.lineTo(scaleX + Math.cos(startAngle) * scaleSize, rowY + Math.sin(startAngle) * scaleSize);
              ctx.moveTo(scaleX, rowY);
              ctx.lineTo(scaleX + Math.cos(endAngle) * scaleSize, rowY + Math.sin(endAngle) * scaleSize);
              ctx.stroke();
              break;
            }
          }
          
          ctx.restore();
        }
      }
    }
  }, [getBodyDimensions, getFishShapeFactorAtY]);

  // 画像エクスポート機能
  const exportAsImage = useCallback((filename?: string) => {
    // 高解像度用のCanvasを作成
    const exportCanvas = document.createElement('canvas');
    const exportWidth = 800;
    const exportHeight = 600;
    
    exportCanvas.width = exportWidth;
    exportCanvas.height = exportHeight;
    
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;
    
    // 背景を透明または白に設定
    ctx.fillStyle = 'rgba(135, 206, 235, 0.2)'; // 水色背景
    ctx.fillRect(0, 0, exportWidth, exportHeight);
    
    // 魚を高解像度で描画
    drawFish(ctx, fishDesign, exportWidth, exportHeight);
    
    // 画像をBlob形式で取得してダウンロード
    exportCanvas.toBlob((blob) => {
      if (!blob) return;
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // ファイル名生成
      const timestamp = new Date().toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}Z$/, '')
        .replace('T', '_');
      
      const sanitizedFishName = fishDesign.name.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');
      const defaultFilename = `${sanitizedFishName}_${timestamp}.png`;
      
      link.href = url;
      link.download = filename || defaultFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 'image/png', 1.0);
  }, [fishDesign, drawFish]);

  // 外部からexportAsImageを呼び出せるようにする
  useImperativeHandle(ref, () => ({
    exportAsImage
  }), [exportAsImage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvasサイズ設定
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // 魚を描画
    drawFish(ctx, fishDesign, rect.width, rect.height);
  }, [fishDesign, drawFish]);

  return (
    <div className={`fish-preview ${className}`}>
      <div className="preview-header">
        <h3 className="fish-name">{fishDesign.name}</h3>
        <div className="fish-info">
          <span className="fish-type">{fishDesign.base.name}</span>
        </div>
      </div>
      
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          className="fish-canvas"
          style={{ 
            width: '100%', 
            height: '300px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 'var(--border-radius-md)',
            background: 'linear-gradient(to bottom, rgba(135, 206, 235, 0.2), rgba(173, 216, 230, 0.3))'
          }}
        />
      </div>
      
      <div className="swimming-animation">
        <div className="bubble bubble-1"></div>
        <div className="bubble bubble-2"></div>
        <div className="bubble bubble-3"></div>
      </div>
    </div>
  );
});

FishPreview.displayName = 'FishPreview';

export default FishPreview;