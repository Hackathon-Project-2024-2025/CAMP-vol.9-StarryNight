import { useEffect, useRef, useCallback } from 'react';
import type { FishDesign } from '../../../types/common.types';
import './FishPreview.css';

interface FishPreviewProps {
  fishDesign: FishDesign;
  className?: string;
}

export default function FishPreview({ fishDesign, className = '' }: FishPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    ctx.fillStyle = design.customizations.bodyColor;
    ctx.beginPath();

    switch (design.base.shape) {
      case 'round':
        ctx.ellipse(x, y, size * 0.8, size * 0.6, 0, 0, Math.PI * 2);
        break;
      case 'streamlined':
        ctx.ellipse(x, y, size * 1.2, size * 0.5, 0, 0, Math.PI * 2);
        break;
      case 'flat':
        ctx.ellipse(x, y, size * 1.0, size * 0.3, 0, 0, Math.PI * 2);
        break;
      case 'elongated':
        ctx.ellipse(x, y, size * 1.5, size * 0.4, 0, 0, Math.PI * 2);
        break;
    }
    
    ctx.fill();
    
    // 体の輪郭
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, []);

  const drawFins = useCallback((ctx: CanvasRenderingContext2D, design: FishDesign, x: number, y: number, size: number) => {
    ctx.fillStyle = design.customizations.finColor;
    const finSize = design.customizations.finSize * size * 0.4;

    // 背ビレ
    ctx.beginPath();
    ctx.moveTo(x - size * 0.3, y - size * 0.6);
    ctx.lineTo(x + size * 0.3, y - size * 0.6);
    ctx.lineTo(x, y - size * 0.9);
    ctx.closePath();
    ctx.fill();

    // 胸ビレ（左右）
    ctx.beginPath();
    ctx.ellipse(x - size * 0.7, y, finSize * 0.6, finSize * 0.3, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.ellipse(x + size * 0.7, y, finSize * 0.6, finSize * 0.3, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    // 尾ビレ
    ctx.beginPath();
    switch (design.parts.tailFin.renderData.shape) {
      case 'fan':
        ctx.moveTo(x + size * 0.8, y);
        ctx.lineTo(x + size * 1.3, y - finSize * 0.5);
        ctx.lineTo(x + size * 1.5, y);
        ctx.lineTo(x + size * 1.3, y + finSize * 0.5);
        ctx.closePath();
        break;
      default:
        ctx.ellipse(x + size * 1.2, y, finSize * 0.8, finSize * 0.6, 0, 0, Math.PI * 2);
    }
    ctx.fill();
  }, []);

  const drawEyes = useCallback((ctx: CanvasRenderingContext2D, design: FishDesign, x: number, y: number, size: number) => {
    const eyeSize = design.customizations.eyeSize * size * 0.15;
    const eyeX = x + design.customizations.eyePosition.x * size;
    const eyeY = y + design.customizations.eyePosition.y * size - size * 0.2;

    // 目（左右）
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(eyeX - size * 0.15, eyeY, eyeSize, eyeSize, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.ellipse(eyeX + size * 0.15, eyeY, eyeSize, eyeSize, 0, 0, Math.PI * 2);
    ctx.fill();

    // 瞳
    ctx.fillStyle = design.customizations.eyeColor;
    ctx.beginPath();
    ctx.ellipse(eyeX - size * 0.15, eyeY, eyeSize * 0.6, eyeSize * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.ellipse(eyeX + size * 0.15, eyeY, eyeSize * 0.6, eyeSize * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // ハイライト
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(eyeX - size * 0.15 + eyeSize * 0.2, eyeY - eyeSize * 0.2, eyeSize * 0.2, eyeSize * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.ellipse(eyeX + size * 0.15 + eyeSize * 0.2, eyeY - eyeSize * 0.2, eyeSize * 0.2, eyeSize * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  const drawMouth = useCallback((ctx: CanvasRenderingContext2D, design: FishDesign, x: number, y: number, size: number) => {
    const mouthX = x + design.customizations.mouthPosition.x * size - size * 0.6;
    const mouthY = y + design.customizations.mouthPosition.y * size;

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    switch (design.parts.mouth.renderData.shape) {
      case 'small':
        ctx.beginPath();
        ctx.arc(mouthX, mouthY, size * 0.05, 0, Math.PI);
        ctx.stroke();
        break;
      default:
        ctx.beginPath();
        ctx.arc(mouthX, mouthY, size * 0.08, 0, Math.PI);
        ctx.stroke();
    }
  }, []);

  const drawScales = useCallback((ctx: CanvasRenderingContext2D, _design: FishDesign, x: number, y: number, size: number) => {
    // 簡単なウロコ模様
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;

    for (let i = -3; i <= 3; i++) {
      for (let j = -2; j <= 2; j++) {
        const scaleX = x + i * size * 0.15;
        const scaleY = y + j * size * 0.2;
        
        if (Math.pow((scaleX - x) / (size * 0.8), 2) + Math.pow((scaleY - y) / (size * 0.6), 2) <= 1) {
          ctx.beginPath();
          ctx.arc(scaleX, scaleY, size * 0.08, 0, Math.PI);
          ctx.stroke();
        }
      }
    }
  }, []);

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
}