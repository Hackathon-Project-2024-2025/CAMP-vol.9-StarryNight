import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import type { AIFishDesign, AIFishCanvasProps, DrawingPoint } from '../../types/aiFish.types';
import './AIFishCanvas.css';

export interface AIFishCanvasRef {
  exportAsImage: (filename?: string, options?: { format?: 'png' | 'jpg'; quality?: number }) => void;
  clearCanvas: () => void;
  redraw: () => void;
}

const AIFishCanvas = forwardRef<AIFishCanvasRef, AIFishCanvasProps>(({
  fishDesign,
  width = 800,
  height = 600,
  backgroundColor = '#f0f8ff',
  showGrid = false,
  className = ''
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // SVGパス文字列を座標配列に変換
  const parseSVGPath = useCallback((pathString: string): DrawingPoint[] => {
    if (typeof pathString !== 'string') {
      return pathString as DrawingPoint[] || [];
    }

    const points: DrawingPoint[] = [];
    const commands = pathString.match(/[MmLlHhVvCcSsQqTtAaZz][^MmLlHhVvCcSsQqTtAaZz]*/g) || [];
    
    let currentX = 0;
    let currentY = 0;

    commands.forEach(command => {
      const type = command[0];
      const coords = command.slice(1).trim().split(',').map(n => parseFloat(n.trim()));
      
      switch (type.toLowerCase()) {
        case 'm': // Move to
          currentX = type === 'M' ? coords[0] : currentX + coords[0];
          currentY = type === 'M' ? coords[1] : currentY + coords[1];
          points.push({ x: currentX, y: currentY });
          break;
        case 'l': // Line to
          currentX = type === 'L' ? coords[0] : currentX + coords[0];
          currentY = type === 'L' ? coords[1] : currentY + coords[1];
          points.push({ x: currentX, y: currentY });
          break;
        case 'c': // Cubic bezier curve
          for (let i = 0; i < coords.length; i += 6) {
            const x = type === 'C' ? coords[i + 4] : currentX + coords[i + 4];
            const y = type === 'C' ? coords[i + 5] : currentY + coords[i + 5];
            points.push({ x, y });
            currentX = x;
            currentY = y;
          }
          break;
      }
    });

    return points;
  }, []);

  // グラデーション描画のヘルパー
  const createGradient = useCallback((
    ctx: CanvasRenderingContext2D,
    gradientInfo: string | { direction: string; colors?: string[] },
    bounds: { x: number; y: number; width: number; height: number }
  ) => {
    if (typeof gradientInfo === 'string') {
      return gradientInfo;
    }

    let gradient;
    switch (gradientInfo.direction) {
      case 'horizontal':
        gradient = ctx.createLinearGradient(bounds.x, 0, bounds.x + bounds.width, 0);
        break;
      case 'vertical':
        gradient = ctx.createLinearGradient(0, bounds.y, 0, bounds.y + bounds.height);
        break;
      case 'radial':
        gradient = ctx.createRadialGradient(
          bounds.x + bounds.width / 2, bounds.y + bounds.height / 2, 0,
          bounds.x + bounds.width / 2, bounds.y + bounds.height / 2, Math.max(bounds.width, bounds.height) / 2
        );
        break;
      case 'diagonal':
        gradient = ctx.createLinearGradient(bounds.x, bounds.y, bounds.x + bounds.width, bounds.y + bounds.height);
        break;
      default:
        return gradientInfo.colors?.[0] || '#ff6b6b';
    }

    if (gradientInfo.colors && Array.isArray(gradientInfo.colors)) {
      gradientInfo.colors.forEach((color: string, index: number) => {
        gradient!.addColorStop(index / (gradientInfo.colors!.length - 1), color);
      });
    }

    return gradient;
  }, []);


  // スムーズなカーブを描画
  const drawSmoothPath = useCallback((ctx: CanvasRenderingContext2D, points: DrawingPoint[], closed: boolean = true) => {
    if (points.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length - 1; i++) {
      const cp2x = (points[i].x + points[i + 1].x) / 2;
      const cp2y = (points[i].y + points[i + 1].y) / 2;

      ctx.quadraticCurveTo(points[i].x, points[i].y, cp2x, cp2y);
    }

    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);

    if (closed) {
      ctx.closePath();
    }
  }, []);

  // 魚の体を描画
  const drawFishBody = useCallback((ctx: CanvasRenderingContext2D, design: AIFishDesign) => {
    const bodyPoints = Array.isArray(design.shape.bodyPath) ? design.shape.bodyPath : parseSVGPath(design.shape.bodyPath);
    if (bodyPoints.length === 0) return;

    // 体の描画
    drawSmoothPath(ctx, bodyPoints, true);

    // 色の設定
    const bodyColor = design.coloring.baseColor;
    if (typeof bodyColor === 'string') {
      ctx.fillStyle = bodyColor;
    } else {
      const bounds = design.boundingBox;
      ctx.fillStyle = createGradient(ctx, bodyColor, bounds);
    }

    ctx.fill();

    // 輪郭の描画
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [parseSVGPath, drawSmoothPath, createGradient]);

  // ヒレを描画
  const drawFins = useCallback((ctx: CanvasRenderingContext2D, design: AIFishDesign) => {
    const fins = design.shape;
    const finColors = design.coloring.finColors;

    // 各ヒレを描画
    Object.entries(fins).forEach(([finType, finData]) => {
      if (finType.includes('Fin') && finData) {
        const finPoints = Array.isArray(finData) ? finData : parseSVGPath(finData);
        if (finPoints.length > 0) {
          drawSmoothPath(ctx, finPoints, true);
          
          const finColor = finColors[finType as keyof typeof finColors] || design.coloring.baseColor;
          if (typeof finColor === 'string') {
            ctx.fillStyle = finColor;
          } else {
            const bounds = design.boundingBox;
            ctx.fillStyle = createGradient(ctx, finColor, bounds);
          }
          
          ctx.fill();
          ctx.strokeStyle = '#333';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }
    });
  }, [parseSVGPath, drawSmoothPath, createGradient]);

  // 目を描画
  const drawEyes = useCallback((ctx: CanvasRenderingContext2D, design: AIFishDesign) => {
    const { leftEye, rightEye } = design.shape;

    [leftEye, rightEye].forEach(eye => {
      ctx.beginPath();
      
      if (eye.shape === 'oval') {
        ctx.ellipse(eye.center.x, eye.center.y, eye.radius, eye.radius * 0.8, 0, 0, 2 * Math.PI);
      } else if (eye.shape === 'almond') {
        // アーモンド型の近似
        ctx.ellipse(eye.center.x, eye.center.y, eye.radius, eye.radius * 0.6, Math.PI / 6, 0, 2 * Math.PI);
      } else {
        ctx.arc(eye.center.x, eye.center.y, eye.radius, 0, 2 * Math.PI);
      }

      ctx.fillStyle = design.coloring.eyeColor;
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 瞳孔
      ctx.beginPath();
      ctx.arc(eye.center.x, eye.center.y, eye.radius * 0.4, 0, 2 * Math.PI);
      ctx.fillStyle = design.coloring.pupilColor;
      ctx.fill();

      // ハイライト
      ctx.beginPath();
      ctx.arc(eye.center.x - eye.radius * 0.2, eye.center.y - eye.radius * 0.2, eye.radius * 0.15, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    });
  }, []);

  // 口を描画
  const drawMouth = useCallback((ctx: CanvasRenderingContext2D, design: AIFishDesign) => {
    const mouth = design.shape.mouth;
    
    ctx.beginPath();
    if (mouth.shape === 'oval') {
      ctx.ellipse(mouth.center.x, mouth.center.y, mouth.width / 2, mouth.height / 2, 0, 0, 2 * Math.PI);
      ctx.fillStyle = '#8b4513';
      ctx.fill();
    } else if (mouth.shape === 'curve') {
      ctx.arc(mouth.center.x, mouth.center.y, mouth.width / 2, 0, Math.PI);
      ctx.strokeStyle = '#8b4513';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      // line
      ctx.moveTo(mouth.center.x - mouth.width / 2, mouth.center.y);
      ctx.lineTo(mouth.center.x + mouth.width / 2, mouth.center.y);
      ctx.strokeStyle = '#8b4513';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, []);

  // パターンを描画
  const drawPatterns = useCallback((ctx: CanvasRenderingContext2D, design: AIFishDesign) => {
    const patterns = design.coloring.patterns;
    if (!patterns) return;

    patterns.forEach(pattern => {
      ctx.fillStyle = pattern.color;
      ctx.globalAlpha = pattern.opacity;

      pattern.positions.forEach(pos => {
        ctx.beginPath();
        
        switch (pattern.type) {
          case 'spots':
            ctx.arc(pos.x, pos.y, 5 * pattern.scale, 0, 2 * Math.PI);
            break;
          case 'stripes':
            ctx.rect(pos.x, pos.y - 2 * pattern.scale, 20 * pattern.scale, 4 * pattern.scale);
            break;
          case 'swirls':
            ctx.arc(pos.x, pos.y, 8 * pattern.scale, 0, Math.PI);
            break;
          default:
            ctx.arc(pos.x, pos.y, 3 * pattern.scale, 0, 2 * Math.PI);
        }
        
        ctx.fill();
      });

      ctx.globalAlpha = 1.0;
    });
  }, []);

  // シマー効果を描画
  const drawShimmer = useCallback((ctx: CanvasRenderingContext2D, design: AIFishDesign) => {
    const shimmer = design.coloring.shimmer;
    if (!shimmer) return;

    ctx.globalAlpha = shimmer.intensity;
    ctx.fillStyle = shimmer.color;

    // シマー効果のパターンに応じて描画
    const bounds = design.boundingBox;
    for (let i = 0; i < 20; i++) {
      const x = bounds.x + Math.random() * bounds.width;
      const y = bounds.y + Math.random() * bounds.height;
      
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, 2 * Math.PI);
      ctx.fill();
    }

    ctx.globalAlpha = 1.0;
  }, []);

  // グリッドを描画
  const drawGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;

    for (let x = 0; x <= width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y <= height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }, [width, height]);

  // メインの描画関数
  const drawFish = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !fishDesign) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // キャンバスをクリア
    ctx.clearRect(0, 0, width, height);

    // 背景色
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // グリッド表示
    if (showGrid) {
      drawGrid(ctx);
    }

    // アンチエイリアシングを有効化
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 魚の描画（奥から順番に）
    drawFishBody(ctx, fishDesign);
    drawFins(ctx, fishDesign);
    drawPatterns(ctx, fishDesign);
    drawShimmer(ctx, fishDesign);
    drawEyes(ctx, fishDesign);
    drawMouth(ctx, fishDesign);

  }, [fishDesign, width, height, backgroundColor, showGrid, drawGrid, drawFishBody, drawFins, drawPatterns, drawShimmer, drawEyes, drawMouth]);

  // エフェクトで再描画
  useEffect(() => {
    drawFish();
  }, [drawFish]);

  // 外部参照用の関数を公開
  useImperativeHandle(ref, () => ({
    exportAsImage: (filename = 'ai-fish', options = {}) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const { format = 'png', quality = 0.95 } = options;
      const dataURL = format === 'jpg' 
        ? canvas.toDataURL('image/jpeg', quality)
        : canvas.toDataURL('image/png');

      // ダウンロード
      const link = document.createElement('a');
      link.download = `${filename}.${format}`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    clearCanvas: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, width, height);
      }
    },
    redraw: drawFish
  }), [drawFish, width, height]);

  return (
    <div className={`ai-fish-canvas-container ${className}`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="ai-fish-canvas"
      />
      {!fishDesign && (
        <div className="ai-fish-canvas-placeholder">
          <p>AI金魚を生成してください</p>
        </div>
      )}
    </div>
  );
});

AIFishCanvas.displayName = 'AIFishCanvas';

export default AIFishCanvas;