import { useEffect, useRef, useCallback, useState } from 'react';
import type { FishDesign } from '../../../types/common.types';
import { SwimmingFish } from './SwimmingFish';
import './Aquarium.css';

interface AquariumProps {
  fishList: FishDesign[];
  className?: string;
}

interface Bubble {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

export default function Aquarium({ fishList, className = '' }: AquariumProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const swimmingFishRef = useRef<SwimmingFish[]>([]);
  const bubblesRef = useRef<Bubble[]>([]);
  const [isAnimating, setIsAnimating] = useState(true);

  // 色の明度調整ヘルパー関数
  const adjustBrightness = useCallback((color: string, amount: number) => {
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  }, []);


  // 魚の形状に応じたY位置での幅係数を取得
  const getFishShapeFactorAtY = useCallback((shape: string, normalizedY: number) => {
    const absY = Math.abs(normalizedY);
    
    switch (shape) {
      case 'round':
        return Math.sqrt(Math.max(0, 1 - absY * absY)) * 0.75;
      case 'streamlined':
        return Math.sqrt(Math.max(0, 1 - absY * absY * 2.0)) * 0.8;
      case 'flat':
        return Math.sqrt(Math.max(0, 1 - absY * absY * 0.3)) * 0.7;
      case 'elongated':
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

  // 自然な魚の形状を描画するヘルパー関数（水槽用に簡略化）
  const drawFishShapeDetailed = useCallback((
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
    
    const random = seededRandom(pattern.seed || 12345);

    ctx.save();
    ctx.globalAlpha = intensity;

    // 体の形状にクリッピングパスを設定
    ctx.beginPath();
    drawFishShapeDetailed(ctx, x, y, bodyWidth, bodyHeight, design.base.shape);
    ctx.clip();

    switch (pattern.type) {
      case 'spotted': {
        const spotColor = pattern.colors?.[0] || '#ffffff';
        ctx.fillStyle = spotColor;
        
        const numSpots = Math.floor(15 * scale);
        for (let i = 0; i < numSpots; i++) {
          const spotX = x + (random() - 0.5) * bodyWidth * 1.4;
          const spotY = y + (random() - 0.5) * bodyHeight * 1.4;
          const spotSize = (random() * 8 + 4) * scale;
          
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
        const stripeColor = pattern.colors?.[1] || '#ffffff';
        const baseColor = pattern.colors?.[0] || design.customizations.bodyColor;
        const direction = pattern.direction || 'horizontal';
        const stripeWidth = Math.max(4, 6 * scale);
        const spacing = Math.max(8, 12 * scale);

        const numStripes = Math.floor((direction === 'horizontal' ? bodyHeight : bodyWidth) * 2 / spacing);
        
        for (let i = 0; i < numStripes; i++) {
          ctx.fillStyle = i % 2 === 0 ? baseColor : stripeColor;
          
          if (direction === 'horizontal') {
            const stripeY = y - bodyHeight + (i * spacing);
            const normalizedY = (stripeY - y) / bodyHeight;
            const fishShapeFactor = getFishShapeFactorAtY(design.base.shape, normalizedY);
            const stripeActualWidth = bodyWidth * fishShapeFactor * 1.6;
            
            if (Math.abs(normalizedY) <= 1.0 && fishShapeFactor > 0.1) {
              ctx.fillRect(x - stripeActualWidth/2, stripeY, stripeActualWidth, stripeWidth);
            }
          } else if (direction === 'vertical') {
            const stripeX = x - bodyWidth + (i * spacing);
            const normalizedX = (stripeX - x) / bodyWidth;
            
            if (Math.abs(normalizedX) <= 1.0) {
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
          }
        }
        break;
      }
    }

    ctx.restore();
  }, [getBodyDimensions, getFishShapeFactorAtY, drawFishShapeDetailed, seededRandom]);

  // アクセサリーを描画する関数
  const drawAccessories = useCallback((ctx: CanvasRenderingContext2D, design: FishDesign, x: number, y: number, size: number) => {
    if (!design.accessories || design.accessories.length === 0) return;

    const bodyDimensions = getBodyDimensions(design.base.shape, size);
    
    design.accessories.forEach(accessory => {
      if (!accessory.visible) return;
      
      ctx.save();
      
      const accessorySize = size * 0.2;
      let accessoryX = x;
      let accessoryY = y - bodyDimensions.height * 0.7;
      
      ctx.fillStyle = accessory.color || '#ffd700';
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 2;
      
      switch (accessory.category) {
        case 'crown': {
          const crownSize = accessorySize * 1.2;
          
          // 王冠のベース
          ctx.beginPath();
          ctx.rect(accessoryX - crownSize/2, accessoryY, crownSize, crownSize * 0.3);
          ctx.fill();
          ctx.stroke();
          
          // 王冠のトゲ
          for (let i = 0; i < 5; i++) {
            const spikeX = accessoryX - crownSize/2 + (i * crownSize/4);
            const spikeHeight = i === 2 ? crownSize * 0.6 : crownSize * 0.4;
            
            ctx.beginPath();
            ctx.moveTo(spikeX, accessoryY);
            ctx.lineTo(spikeX + crownSize/8, accessoryY - spikeHeight);
            ctx.lineTo(spikeX + crownSize/4, accessoryY);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          }
          break;
        }

        case 'glasses': {
          const lensSize = accessorySize * 0.9;
          
          ctx.strokeStyle = accessory.color || '#34495e';
          ctx.lineWidth = 3;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          
          accessoryX = x + bodyDimensions.width * 0.2;
          accessoryY = y - bodyDimensions.height * 0.2;
          
          // 横顔なので片レンズのみ
          ctx.beginPath();
          ctx.arc(accessoryX, accessoryY, lensSize, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          
          // テンプル
          ctx.beginPath();
          ctx.moveTo(accessoryX + lensSize, accessoryY);
          ctx.lineTo(accessoryX + lensSize * 1.8, accessoryY - lensSize * 0.1);
          ctx.stroke();
          break;
        }

        case 'hat': {
          const hatSize = accessorySize * 1.1;
          
          // 帽子の筒部分
          ctx.beginPath();
          ctx.rect(accessoryX - hatSize/3, accessoryY - hatSize, hatSize/1.5, hatSize);
          ctx.fill();
          ctx.stroke();
          
          // つば
          ctx.beginPath();
          ctx.ellipse(accessoryX, accessoryY, hatSize, hatSize * 0.3, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          break;
        }

        case 'ribbon': {
          const ribbonSize = accessorySize;
          
          // リボン結び
          ctx.beginPath();
          ctx.ellipse(accessoryX - ribbonSize/2, accessoryY, ribbonSize/2, ribbonSize, Math.PI/6, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          
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
          break;
        }
      }
      
      ctx.restore();
    });
  }, [getBodyDimensions, adjustBrightness]);

  // ヒレを描画する関数（FishPreviewから移植）
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

  // 目を描画する関数（FishPreviewから移植）
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

  // 口を描画する関数（FishPreviewから移植）
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

  // ウロコを描画する関数（FishPreviewから移植）
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

  // 水槽用の魚描画関数（FishPreviewと完全一致）
  const drawFish = useCallback((
    ctx: CanvasRenderingContext2D,
    design: FishDesign,
    x: number,
    y: number,
    scale: number,
    angle: number
  ) => {
    ctx.save();
    
    // 回転と位置を適用
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(scale, scale);
    
    // FishPreviewと同じサイズ計算ロジックを使用（水槽用にスケール調整）
    const baseSize = design.customizations.size * 70; // 80から70に調整して水槽サイズに適合
    
    // 体を描画（drawBody相当）
    const bodyDimensions = getBodyDimensions(design.base.shape, baseSize);
    const bodyWidth = bodyDimensions.width;
    const bodyHeight = bodyDimensions.height;
    
    // グラデーション効果を追加
    const gradient = ctx.createLinearGradient(-bodyWidth, -bodyHeight/2, bodyWidth, bodyHeight/2);
    const bodyColor = design.customizations.bodyColor;
    gradient.addColorStop(0, bodyColor);
    gradient.addColorStop(0.5, bodyColor);
    gradient.addColorStop(1, adjustBrightness(bodyColor, -20));
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    drawFishShapeDetailed(ctx, 0, 0, bodyWidth, bodyHeight, design.base.shape);
    ctx.fill();
    
    // 体の輪郭
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // 体の模様を描画（体の上に重ねる） - FishPreviewと同じ順序
    if (design.bodyPattern) {
      drawBodyPattern(ctx, design, 0, 0, baseSize);
    }
    
    // ヒレを描画 - FishPreviewと同じ順序
    drawFins(ctx, design, 0, 0, baseSize);
    
    // ウロコ模様を描画 - FishPreviewと同じ順序
    drawScales(ctx, design, 0, 0, baseSize);
    
    // 目を描画 - FishPreviewと同じ順序
    drawEyes(ctx, design, 0, 0, baseSize);
    
    // 口を描画 - FishPreviewと同じ順序
    drawMouth(ctx, design, 0, 0, baseSize);
    
    // アクセサリーを描画（最上層） - FishPreviewと同じ順序
    if (design.accessories && design.accessories.length > 0) {
      drawAccessories(ctx, design, 0, 0, baseSize);
    }
    
    ctx.restore();
  }, [adjustBrightness, getBodyDimensions, drawFishShapeDetailed, drawBodyPattern, drawFins, drawScales, drawEyes, drawMouth, drawAccessories]);

  // 泡を初期化
  const initBubbles = useCallback((width: number, height: number) => {
    const bubbles: Bubble[] = [];
    for (let i = 0; i < 8; i++) {
      bubbles.push({
        x: Math.random() * width,
        y: height + Math.random() * 100,
        size: 3 + Math.random() * 5,
        speed: 0.5 + Math.random() * 1,
        opacity: 0.3 + Math.random() * 0.4
      });
    }
    return bubbles;
  }, []);

  // 泡を更新
  const updateBubbles = useCallback((bubbles: Bubble[], width: number, height: number) => {
    bubbles.forEach((bubble) => {
      bubble.y -= bubble.speed;
      bubble.x += Math.sin(bubble.y * 0.01) * 0.5;
      
      // 泡が上端に達したら下端にリセット
      if (bubble.y < -bubble.size) {
        bubble.y = height + bubble.size;
        bubble.x = Math.random() * width;
      }
    });
  }, []);

  // 泡を描画
  const drawBubbles = useCallback((ctx: CanvasRenderingContext2D, bubbles: Bubble[]) => {
    bubbles.forEach(bubble => {
      ctx.save();
      ctx.globalAlpha = bubble.opacity;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }, []);

  // 水槽の背景を描画
  const drawAquariumBg = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // 水のグラデーション
    const waterGradient = ctx.createLinearGradient(0, 0, 0, height);
    waterGradient.addColorStop(0, 'rgba(135, 206, 235, 0.3)');
    waterGradient.addColorStop(0.3, 'rgba(100, 149, 237, 0.4)');
    waterGradient.addColorStop(0.7, 'rgba(70, 130, 180, 0.5)');
    waterGradient.addColorStop(1, 'rgba(25, 25, 112, 0.6)');
    
    ctx.fillStyle = waterGradient;
    ctx.fillRect(0, 0, width, height);
    
    // 底砂
    ctx.fillStyle = 'rgba(139, 69, 19, 0.3)';
    ctx.fillRect(0, height - 30, width, 30);
    
    // 水草（簡単な線で表現）
    ctx.strokeStyle = 'rgba(34, 139, 34, 0.6)';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    
    // 左側の水草
    for (let i = 0; i < 3; i++) {
      const x = 30 + i * 20;
      ctx.beginPath();
      ctx.moveTo(x, height - 30);
      ctx.quadraticCurveTo(x + 10, height - 80, x - 5, height - 120);
      ctx.stroke();
    }
    
    // 右側の水草
    for (let i = 0; i < 3; i++) {
      const x = width - 90 + i * 20;
      ctx.beginPath();
      ctx.moveTo(x, height - 30);
      ctx.quadraticCurveTo(x - 10, height - 80, x + 5, height - 120);
      ctx.stroke();
    }
  }, []);

  // アニメーションループ
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { width, height } = canvas;
    
    // キャンバスをクリア
    ctx.clearRect(0, 0, width, height);
    
    // 背景を描画
    drawAquariumBg(ctx, width, height);
    
    // 泡を更新・描画
    updateBubbles(bubblesRef.current, width, height);
    drawBubbles(ctx, bubblesRef.current);
    
    // 魚を更新・描画
    swimmingFishRef.current.forEach(swimmingFish => {
      if (swimmingFish.state.isVisible) {
        swimmingFish.update();
        const pos = swimmingFish.getPosition();
        drawFish(ctx, swimmingFish.fishDesign, pos.x, pos.y, pos.scale, pos.angle);
      }
    });
    
    if (isAnimating) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [isAnimating, drawAquariumBg, updateBubbles, drawBubbles, drawFish]);

  // 魚リストが変更された時の処理
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const { width, height } = canvas;
    
    // 新しい魚のSwimmingFishインスタンスを作成
    swimmingFishRef.current = fishList.map(fish => 
      new SwimmingFish(fish, width, height)
    );
    
    // 泡を初期化
    bubblesRef.current = initBubbles(width, height);
  }, [fishList, initBubbles]);

  // キャンバスの初期化とリサイズ処理
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
      
      // 既存の魚の位置を新しいサイズに調整
      swimmingFishRef.current.forEach(fish => {
        fish.resize(rect.width, rect.height);
      });
    };

    updateCanvasSize();
    
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    resizeObserver.observe(canvas);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // アニメーション開始・停止
  useEffect(() => {
    if (isAnimating) {
      animate();
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating, animate]);

  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
  };

  return (
    <div className={`aquarium ${className}`}>
      <div className="aquarium-header">
        <h2 className="aquarium-title">🐠 みんなの金魚水槽</h2>
        <div className="aquarium-controls">
          <button 
            className="control-button"
            onClick={toggleAnimation}
            title={isAnimating ? 'アニメーション停止' : 'アニメーション開始'}
          >
            {isAnimating ? '⏸️' : '▶️'}
          </button>
          <span className="fish-count">{fishList.length}匹が泳いでいます</span>
        </div>
      </div>
      
      <div className="aquarium-container">
        <canvas
          ref={canvasRef}
          className="aquarium-canvas"
        />
        
        {fishList.length === 0 && (
          <div className="empty-aquarium">
            <div className="empty-message">
              <span className="empty-icon">🐠</span>
              <p className="empty-text">
                まだ金魚がいません<br />
                CreatePageで金魚を作って水槽に移動してください！
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}