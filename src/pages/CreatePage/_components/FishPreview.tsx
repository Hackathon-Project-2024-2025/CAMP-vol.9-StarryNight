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
        // 楕円形状の幅 - より正確な楕円の計算
        return Math.sqrt(Math.max(0, 1 - absY * absY)) * 0.75;
      case 'streamlined':
        // 流線型の幅 - 先細りを強調
        return Math.sqrt(Math.max(0, 1 - absY * absY * 2.0)) * 0.8;
      case 'flat':
        // 平型の幅 - 上下により平たく
        return Math.sqrt(Math.max(0, 1 - absY * absY * 0.3)) * 0.7;
      case 'elongated':
        // 細長型の幅 - より細く
        return Math.sqrt(Math.max(0, 1 - absY * absY * 3.0)) * 0.6;
      default:
        return Math.sqrt(Math.max(0, 1 - absY * absY)) * 0.75;
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
    
    // 体の模様を描画（体の上に重ねる）
    if (design.bodyPattern) {
      drawBodyPattern(ctx, design, centerX, centerY, baseSize);
    }
    
    // ヒレを描画
    drawFins(ctx, design, centerX, centerY, baseSize);
    
    // ウロコ模様を描画
    drawScales(ctx, design, centerX, centerY, baseSize);
    
    // 目を描画
    drawEyes(ctx, design, centerX, centerY, baseSize);
    
    // 口を描画
    drawMouth(ctx, design, centerX, centerY, baseSize);
    
    // アクセサリーを描画（最上層）
    if (design.accessories && design.accessories.length > 0) {
      drawAccessories(ctx, design, centerX, centerY, baseSize);
    }
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

    // 背ビレ（魚の背中上部、中央やや後方）- 体型に応じた適切な位置計算
    const dorsalX = x - bodyWidth * 0.1 + design.customizations.dorsalFinPosition.x * bodyWidth * 0.5;
    
    // 体型別の背ビレ基準位置を設定
    let dorsalBaseY;
    switch (design.base.shape) {
      case 'round':
        dorsalBaseY = y - bodyHeight * 0.85; // 丸型は少し下目
        break;
      case 'streamlined':
        dorsalBaseY = y - bodyHeight * 0.75; // 流線型は中央寄り
        break;
      case 'flat':
        dorsalBaseY = y - bodyHeight * 1.1; // 平型は上目
        break;
      case 'elongated':
        dorsalBaseY = y - bodyHeight * 0.9; // 細長型は標準
        break;
      default:
        dorsalBaseY = y - bodyHeight * 0.85;
    }
    
    const dorsalY = dorsalBaseY + design.customizations.dorsalFinPosition.y * bodyHeight * 0.4;
    
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
    const scaleSize = size * 0.04;  // ウロコサイズを少し小さく
    
    // 魚の形状に沿ったウロコ配置
    const rows = 4;  // ウロコの行数
    const colsPerRow = [3, 5, 5, 3];  // 各行のウロコ数を減らして密度調整
    
    for (let row = 0; row < rows; row++) {
      const rowY = y + (row - 1.5) * bodyDimensions.height * 0.25;
      const cols = colsPerRow[row];
      
      // 行のY位置に対する魚の幅係数を取得
      const normalizedRowY = (rowY - y) / bodyDimensions.height;
      const fishShapeFactor = getFishShapeFactorAtY(design.base.shape, normalizedRowY);
      
      for (let col = 0; col < cols; col++) {
        // 正規化された横位置（-1〜1の範囲）
        const normalizedCol = (col - (cols - 1) / 2) / ((cols - 1) / 2);
        
        // 実際の横位置計算（魚の形状に合わせて縮小）
        const scaleX = x + normalizedCol * bodyDimensions.width * fishShapeFactor * 0.6;
        
        // より厳密な体内判定：正規化位置と形状係数を両方考慮
        const isInsideBody = Math.abs(normalizedCol) <= 0.65 && fishShapeFactor > 0.2;
        
        if (isInsideBody) {
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

  // シード基準の疑似乱数生成器
  const seededRandom = useCallback((seed: number) => {
    let currentSeed = seed;
    return () => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };
  }, []);

  // 体の模様を描画する関数
  const drawBodyPattern = useCallback((ctx: CanvasRenderingContext2D, design: FishDesign, x: number, y: number, size: number) => {
    const pattern = design.bodyPattern;
    if (!pattern) return;

    const bodyDimensions = getBodyDimensions(design.base.shape, size);
    const bodyWidth = bodyDimensions.width;
    const bodyHeight = bodyDimensions.height;
    const intensity = pattern.intensity || 0.6;
    const scale = pattern.scale || 1.0;
    
    // シード基準の乱数生成器を作成
    const random = seededRandom(pattern.seed || 12345);

    ctx.save();
    ctx.globalAlpha = intensity;

    // 体の形状にクリッピングパスを設定
    ctx.beginPath();
    drawFishShape(ctx, x, y, bodyWidth, bodyHeight, design.base.shape);
    ctx.clip();

    switch (pattern.type) {
      case 'spotted': {
        // まだら模様
        const spotColor = pattern.colors?.[0] || '#ffffff';
        ctx.fillStyle = spotColor;
        
        const numSpots = Math.floor(15 * scale);
        for (let i = 0; i < numSpots; i++) {
          const spotX = x + (random() - 0.5) * bodyWidth * 1.4;
          const spotY = y + (random() - 0.5) * bodyHeight * 1.4;
          const spotSize = (random() * 8 + 4) * scale;
          
          // 体の形状内かチェック
          const normalizedY = (spotY - y) / bodyHeight;
          const fishShapeFactor = getFishShapeFactorAtY(design.base.shape, normalizedY);
          const normalizedX = (spotX - x) / bodyWidth;
          
          if (Math.abs(normalizedX) <= fishShapeFactor * 0.8 && Math.abs(normalizedY) <= 0.8) {
            ctx.beginPath();
            ctx.ellipse(spotX, spotY, spotSize, spotSize * 0.8, random() * Math.PI, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
      }

      case 'striped': {
        // 縞模様 - 魚の形状に沿った縞模様
        const stripeColor = pattern.colors?.[1] || '#ffffff';
        const baseColor = pattern.colors?.[0] || design.customizations.bodyColor;
        const direction = pattern.direction || 'horizontal';
        const stripeWidth = Math.max(4, 6 * scale);
        const spacing = Math.max(8, 12 * scale);

        // 魚の形状に合わせて縞模様を描画
        const numStripes = Math.floor((direction === 'horizontal' ? bodyHeight : bodyWidth) * 2 / spacing);
        
        for (let i = 0; i < numStripes; i++) {
          ctx.fillStyle = i % 2 === 0 ? baseColor : stripeColor;
          
          if (direction === 'horizontal') {
            // 横縞 - 魚の形状に沿って描画
            const stripeY = y - bodyHeight + (i * spacing);
            const normalizedY = (stripeY - y) / bodyHeight;
            const fishShapeFactor = getFishShapeFactorAtY(design.base.shape, normalizedY);
            const stripeActualWidth = bodyWidth * fishShapeFactor * 1.6;
            
            if (Math.abs(normalizedY) <= 1.0 && fishShapeFactor > 0.1) {
              ctx.fillRect(x - stripeActualWidth/2, stripeY, stripeActualWidth, stripeWidth);
            }
          } else if (direction === 'vertical') {
            // 縦縞 - 魚の体に沿って描画
            const stripeX = x - bodyWidth + (i * spacing);
            const normalizedX = (stripeX - x) / bodyWidth;
            
            if (Math.abs(normalizedX) <= 1.0) {
              // 各Y位置での魚の幅を計算して縞を描画
              for (let j = -bodyHeight; j <= bodyHeight; j += 2) {
                const currentY = y + j;
                const normalizedCurrentY = j / bodyHeight;
                const currentFishShapeFactor = getFishShapeFactorAtY(design.base.shape, normalizedCurrentY);
                
                if (Math.abs(normalizedCurrentY) <= 1.0 && currentFishShapeFactor > 0.1) {
                  const maxX = bodyWidth * currentFishShapeFactor;
                  if (Math.abs(normalizedX * bodyWidth) <= maxX) {
                    ctx.fillRect(stripeX, currentY, stripeWidth, 2);
                  }
                }
              }
            }
          } else if (direction === 'diagonal') {
            // 斜め縞 - 45度傾斜
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(Math.PI / 4);
            
            const diagonalStripeY = -bodyHeight * 1.5 + (i * spacing);
            const rotatedWidth = Math.sqrt(bodyWidth * bodyWidth + bodyHeight * bodyHeight) * 1.5;
            
            ctx.fillRect(-rotatedWidth/2, diagonalStripeY, rotatedWidth, stripeWidth);
            ctx.restore();
          }
        }
        break;
      }

      case 'polka': {
        // 水玉模様
        const dotColor = pattern.colors?.[0] || '#ffffff';
        ctx.fillStyle = dotColor;
        
        const dotSize = 4 * scale;
        const gridSize = 20 * scale;
        
        for (let i = -bodyWidth; i < bodyWidth; i += gridSize) {
          for (let j = -bodyHeight; j < bodyHeight; j += gridSize) {
            const dotX = x + i + (j % (gridSize * 2) === 0 ? gridSize / 2 : 0);
            const dotY = y + j;
            
            // 体の形状内かチェック
            const normalizedY = (dotY - y) / bodyHeight;
            const fishShapeFactor = getFishShapeFactorAtY(design.base.shape, normalizedY);
            const normalizedX = (dotX - x) / bodyWidth;
            
            if (Math.abs(normalizedX) <= fishShapeFactor * 0.6 && Math.abs(normalizedY) <= 0.6) {
              ctx.beginPath();
              ctx.arc(dotX, dotY, dotSize, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
        break;
      }

      case 'calico': {
        // キャリコ（三色）模様
        const colors = pattern.colors || ['#ff6b6b', '#ffffff', '#2c3e50'];
        
        // 各色のパッチを描画
        colors.forEach((color, index) => {
          ctx.fillStyle = color;
          const numPatches = Math.floor((8 - index * 2) * scale);
          
          for (let i = 0; i < numPatches; i++) {
            const patchX = x + (random() - 0.5) * bodyWidth * 1.2;
            const patchY = y + (random() - 0.5) * bodyHeight * 1.2;
            const patchWidth = (random() * 20 + 15) * scale;
            const patchHeight = (random() * 15 + 10) * scale;
            
            // 体の形状内かチェック
            const normalizedY = (patchY - y) / bodyHeight;
            const fishShapeFactor = getFishShapeFactorAtY(design.base.shape, normalizedY);
            const normalizedX = (patchX - x) / bodyWidth;
            
            if (Math.abs(normalizedX) <= fishShapeFactor * 0.7 && Math.abs(normalizedY) <= 0.7) {
              ctx.save();
              ctx.translate(patchX, patchY);
              ctx.rotate(random() * Math.PI);
              ctx.beginPath();
              ctx.ellipse(0, 0, patchWidth, patchHeight, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }
          }
        });
        break;
      }

      case 'gradient': {
        // グラデーション模様 - より鮮明で分かりやすい対比
        const baseColor = design.customizations.bodyColor;
        const colors = pattern.colors || [baseColor, adjustBrightness(baseColor, -60)];
        
        // 角度をランダム化（シード基準）
        const angle = random() * Math.PI * 2;
        const gradientLength = Math.max(bodyWidth, bodyHeight);
        const startX = x + Math.cos(angle) * gradientLength * 0.7;
        const startY = y + Math.sin(angle) * gradientLength * 0.7;
        const endX = x - Math.cos(angle) * gradientLength * 0.7;
        const endY = y - Math.sin(angle) * gradientLength * 0.7;
        
        const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
        
        // 複数の色段階を作成
        if (colors.length >= 2) {
          gradient.addColorStop(0, colors[0]);
          gradient.addColorStop(0.3, colors[0]);
          gradient.addColorStop(0.7, colors[1]);
          gradient.addColorStop(1, colors[1]);
        } else {
          colors.forEach((color, index) => {
            gradient.addColorStop(index / (colors.length - 1), color);
          });
        }
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        drawFishShape(ctx, x, y, bodyWidth, bodyHeight, design.base.shape);
        ctx.fill();
        break;
      }
    }

    ctx.restore();
  }, [getBodyDimensions, drawFishShape, getFishShapeFactorAtY, seededRandom, adjustBrightness]);

  // アクセサリーを描画する関数
  const drawAccessories = useCallback((ctx: CanvasRenderingContext2D, design: FishDesign, x: number, y: number, size: number) => {
    const accessories = design.accessories || [];
    const visibleAccessories = accessories.filter(acc => acc.visible);
    const bodyDimensions = getBodyDimensions(design.base.shape, size);

    visibleAccessories.forEach(accessory => {
      ctx.save();
      
      // 魚の頭部位置を正確に計算（右向きの魚の頭は右側）
      const headX = x + bodyDimensions.width * 0.3;
      const headY = y - bodyDimensions.height * 0.1; // 頭部中心
      
      // アクセサリーの位置計算（魚の解剖学的構造に基づく）
      let accessoryX, accessoryY;
      
      if (['crown', 'hat', 'ribbon'].includes(accessory.category)) {
        // 頭部上方アクセサリー
        accessoryX = headX + accessory.position.x * bodyDimensions.width * 0.2;
        accessoryY = headY + accessory.position.y * bodyDimensions.height;
      } else if (accessory.category === 'glasses') {
        // 目の位置のアクセサリー（既存の目の位置を参照）
        const eyeX = headX + design.customizations.eyePosition.x * bodyDimensions.width * 0.3;
        const eyeY = y + design.customizations.eyePosition.y * bodyDimensions.height;
        accessoryX = eyeX + accessory.position.x * bodyDimensions.width * 0.1;
        accessoryY = eyeY + accessory.position.y * bodyDimensions.height * 0.1;
      } else {
        // 胸部アクセサリー（bow）
        const chestX = x + bodyDimensions.width * 0.1;
        const chestY = y + bodyDimensions.height * 0.2;
        accessoryX = chestX + accessory.position.x * bodyDimensions.width * 0.3;
        accessoryY = chestY + accessory.position.y * bodyDimensions.height * 0.5;
      }
      
      const accessorySize = accessory.size * size * 0.15;

      // 回転を適用
      if (accessory.rotation) {
        ctx.translate(accessoryX, accessoryY);
        ctx.rotate((accessory.rotation * Math.PI) / 180);
        ctx.translate(-accessoryX, -accessoryY);
      }

      ctx.fillStyle = accessory.color || '#ffd700';
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 1;

      switch (accessory.category) {
        case 'crown': {
          // 王冠を描画
          ctx.beginPath();
          const crownWidth = accessorySize * 1.5;
          const crownHeight = accessorySize;
          
          // 王冠のベース
          ctx.rect(accessoryX - crownWidth/2, accessoryY, crownWidth, crownHeight * 0.3);
          
          // 王冠のトゲ部分
          const numSpikes = 5;
          for (let i = 0; i < numSpikes; i++) {
            const spikeX = accessoryX - crownWidth/2 + (crownWidth / numSpikes) * (i + 0.5);
            const spikeHeight = crownHeight * (i % 2 === 1 ? 0.8 : 0.6);
            ctx.moveTo(spikeX - crownWidth/(numSpikes*3), accessoryY);
            ctx.lineTo(spikeX, accessoryY - spikeHeight);
            ctx.lineTo(spikeX + crownWidth/(numSpikes*3), accessoryY);
          }
          
          ctx.fill();
          ctx.stroke();
          
          // 宝石（ジュエル王冠の場合）
          if (accessory.id.includes('jeweled')) {
            ctx.fillStyle = '#ff1493';
            for (let i = 0; i < 3; i++) {
              const gemX = accessoryX - crownWidth/3 + (crownWidth/3) * i;
              ctx.beginPath();
              ctx.arc(gemX, accessoryY + crownHeight * 0.15, accessorySize * 0.1, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          break;
        }

        case 'hat': {
          // 帽子を描画
          if (accessory.id.includes('top')) {
            // シルクハット
            const hatWidth = accessorySize * 1.2;
            const hatHeight = accessorySize * 1.5;
            
            ctx.beginPath();
            // 帽子の筒部分
            ctx.rect(accessoryX - hatWidth/3, accessoryY - hatHeight, hatWidth/1.5, hatHeight);
            ctx.fill();
            ctx.stroke();
            
            // つば
            ctx.beginPath();
            ctx.ellipse(accessoryX, accessoryY, hatWidth, hatWidth * 0.3, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          } else {
            // キャップ
            const capSize = accessorySize * 1.1;
            
            ctx.beginPath();
            ctx.arc(accessoryX, accessoryY, capSize, Math.PI, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // つば
            ctx.beginPath();
            ctx.ellipse(accessoryX + capSize * 0.7, accessoryY, capSize * 0.8, capSize * 0.3, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
          break;
        }

        case 'glasses': {
          // メガネを描画（横顔用 - 片レンズのみ表示）
          const lensSize = accessorySize * 0.9;
          const frameThickness = 3;
          
          ctx.strokeStyle = accessory.color || '#34495e';
          ctx.lineWidth = frameThickness;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          
          // 横顔なので見える側のレンズのみ描画（右側のレンズ）
          ctx.beginPath();
          ctx.arc(accessoryX, accessoryY, lensSize, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          
          // テンプル（つる）- 耳に向かって伸びる部分
          ctx.beginPath();
          ctx.moveTo(accessoryX + lensSize, accessoryY);
          ctx.lineTo(accessoryX + lensSize * 1.8, accessoryY - lensSize * 0.1);
          ctx.stroke();
          
          // ノーズパッド部分（鼻に接触する部分）
          ctx.beginPath();
          ctx.moveTo(accessoryX - lensSize * 0.8, accessoryY + lensSize * 0.2);
          ctx.lineTo(accessoryX - lensSize * 1.1, accessoryY + lensSize * 0.4);
          ctx.stroke();
          
          // フレームの厚み表現（立体感）
          ctx.strokeStyle = adjustBrightness(accessory.color || '#34495e', -30);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(accessoryX + 1, accessoryY + 1, lensSize, Math.PI * 0.3, Math.PI * 1.2);
          ctx.stroke();
          
          // サングラスの場合は暗くする
          if (accessory.id.includes('sunglasses')) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.beginPath();
            ctx.arc(accessoryX, accessoryY, lensSize - 2, 0, Math.PI * 2);
            ctx.fill();
            
            // サングラスの反射効果
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.arc(accessoryX - lensSize * 0.3, accessoryY - lensSize * 0.3, lensSize * 0.2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // 通常のメガネの場合、レンズの反射を追加
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.arc(accessoryX - lensSize * 0.4, accessoryY - lensSize * 0.4, lensSize * 0.15, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }

        case 'ribbon': {
          // リボンを描画
          const ribbonSize = accessorySize;
          
          if (accessory.id.includes('bow')) {
            // リボン結び
            ctx.beginPath();
            // 左の羽
            ctx.ellipse(accessoryX - ribbonSize/2, accessoryY, ribbonSize/2, ribbonSize, Math.PI/6, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // 右の羽
            ctx.beginPath();
            ctx.ellipse(accessoryX + ribbonSize/2, accessoryY, ribbonSize/2, ribbonSize, -Math.PI/6, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // 中央の結び目
            ctx.fillStyle = adjustBrightness(accessory.color || '#ff69b4', -30);
            ctx.beginPath();
            ctx.rect(accessoryX - ribbonSize/4, accessoryY - ribbonSize/3, ribbonSize/2, ribbonSize/1.5);
            ctx.fill();
            ctx.stroke();
          } else {
            // ヘッドバンド
            const bandWidth = ribbonSize * 0.3;
            ctx.beginPath();
            ctx.arc(accessoryX, accessoryY, ribbonSize, Math.PI * 0.8, Math.PI * 2.2);
            ctx.lineWidth = bandWidth;
            ctx.stroke();
          }
          break;
        }

        case 'bow': {
          // 蝶ネクタイを描画
          const bowSize = accessorySize;
          
          ctx.beginPath();
          // 左の羽
          ctx.moveTo(accessoryX - bowSize, accessoryY);
          ctx.quadraticCurveTo(accessoryX - bowSize/2, accessoryY - bowSize/2, accessoryX - bowSize/4, accessoryY);
          ctx.quadraticCurveTo(accessoryX - bowSize/2, accessoryY + bowSize/2, accessoryX - bowSize, accessoryY);
          
          // 右の羽
          ctx.moveTo(accessoryX + bowSize, accessoryY);
          ctx.quadraticCurveTo(accessoryX + bowSize/2, accessoryY - bowSize/2, accessoryX + bowSize/4, accessoryY);
          ctx.quadraticCurveTo(accessoryX + bowSize/2, accessoryY + bowSize/2, accessoryX + bowSize, accessoryY);
          
          ctx.fill();
          ctx.stroke();
          
          // 中央の結び目
          ctx.fillStyle = adjustBrightness(accessory.color || '#8b4513', -30);
          ctx.beginPath();
          ctx.rect(accessoryX - bowSize/6, accessoryY - bowSize/3, bowSize/3, bowSize/1.5);
          ctx.fill();
          ctx.stroke();
          break;
        }

      }
      
      ctx.restore();
    });
  }, [adjustBrightness, getBodyDimensions]);

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
            background: 'linear-gradient(to bottom, rgba(64, 224, 208, 0.6), rgba(30, 144, 255, 0.5))'
            // background: 'linear-gradient(to bottom, rgba(135, 206, 235, 0.2), rgba(173, 216, 230, 0.3))'
          }}
        />
      </div>
      
      <div className="swimming-animation">
        <div className="bubble bubble-1"></div>
        <div className="bubble bubble-2"></div>
        <div className="bubble bubble-3"></div>
        <div className="bubble bubble-4"></div>
        <div className="bubble bubble-5"></div>
        <div className="bubble bubble-6"></div>
      </div>
    </div>
  );
});

FishPreview.displayName = 'FishPreview';

export default FishPreview;