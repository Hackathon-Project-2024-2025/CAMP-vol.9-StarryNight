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

  // 魚の形状を描画するヘルパー関数（簡略版）
  const drawFishShape = useCallback((
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    const headX = x + width * 0.3;
    const tailX = x - width * 0.3;
    
    ctx.moveTo(tailX, y);
    ctx.quadraticCurveTo(x - width * 0.1, y - height * 0.8, x + width * 0.1, y - height * 0.7);
    ctx.quadraticCurveTo(headX, y - height * 0.5, headX + width * 0.1, y);
    ctx.quadraticCurveTo(headX, y + height * 0.5, x + width * 0.1, y + height * 0.7);
    ctx.quadraticCurveTo(x - width * 0.1, y + height * 0.8, tailX, y);
    ctx.closePath();
  }, []);

  // 魚の描画関数をFishPreviewからコピー（簡略版）
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
    
    const size = 40; // 水槽での基本サイズ
    const bodyWidth = size * 0.8;
    const bodyHeight = size * 0.6;
    
    // 体を描画
    const gradient = ctx.createLinearGradient(-bodyWidth/2, -bodyHeight/2, bodyWidth/2, bodyHeight/2);
    gradient.addColorStop(0, design.customizations.bodyColor);
    gradient.addColorStop(1, adjustBrightness(design.customizations.bodyColor, -20));
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    drawFishShape(ctx, 0, 0, bodyWidth, bodyHeight);
    ctx.fill();
    
    // 体の輪郭
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // 目を描画
    const eyeSize = size * 0.12;
    const eyeX = bodyWidth * 0.2;
    const eyeY = -bodyHeight * 0.2;
    
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = design.customizations.eyeColor;
    ctx.beginPath();
    ctx.arc(eyeX + eyeSize * 0.1, eyeY, eyeSize * 0.6, 0, Math.PI * 2);
    ctx.fill();
    
    // ハイライト
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(eyeX + eyeSize * 0.2, eyeY - eyeSize * 0.2, eyeSize * 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // 尾ビレ
    ctx.fillStyle = design.customizations.finColor;
    ctx.beginPath();
    ctx.moveTo(-bodyWidth/2, 0);
    ctx.lineTo(-bodyWidth * 0.9, -bodyHeight * 0.4);
    ctx.lineTo(-bodyWidth * 1.1, 0);
    ctx.lineTo(-bodyWidth * 0.9, bodyHeight * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();
  }, [adjustBrightness, drawFishShape]);

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