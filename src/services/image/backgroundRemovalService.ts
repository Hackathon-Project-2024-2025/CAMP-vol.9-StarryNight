// 背景透過処理サービス
// AI生成画像の背景を透過にする処理を提供

/**
 * 背景透過処理の設定
 */
export interface BackgroundRemovalOptions {
  // 背景として認識する色の閾値（0-255）
  colorTolerance?: number;
  // エッジの滑らかさ（0-10）
  edgeSmoothing?: number;
  // 透過処理の強度（0.0-1.0）
  transparencyStrength?: number;
  // 背景色の自動検出を使用するか
  autoDetectBackground?: boolean;
  // 手動で指定する背景色（RGB形式）
  manualBackgroundColor?: { r: number; g: number; b: number };
}

/**
 * 背景透過処理の結果
 */
export interface BackgroundRemovalResult {
  success: boolean;
  imageData?: string; // 透過処理済みのBase64画像データ
  error?: string;
  processedPixels?: number;
  removedPixels?: number;
  processingTime?: number;
}

/**
 * Base64画像データの背景を透過にする
 * @param base64Data - 元画像のBase64データ
 * @param options - 透過処理オプション
 * @returns 透過処理結果
 */
export async function removeBackground(
  base64Data: string,
  options: BackgroundRemovalOptions = {}
): Promise<BackgroundRemovalResult> {
  const startTime = Date.now();
  
  try {
    // デフォルト設定
    const config = {
      colorTolerance: options.colorTolerance ?? 30,
      edgeSmoothing: options.edgeSmoothing ?? 2,
      transparencyStrength: options.transparencyStrength ?? 1.0,
      autoDetectBackground: options.autoDetectBackground ?? true,
      manualBackgroundColor: options.manualBackgroundColor ?? { r: 255, g: 255, b: 255 }
    };

    // Base64データをクリーニング
    const cleanBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
    
    // Canvas要素を作成して画像を読み込み
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Canvas context not available');
    }

    // 画像を読み込み
    const img = await loadImageFromBase64(`data:image/png;base64,${cleanBase64}`);
    
    canvas.width = img.width;
    canvas.height = img.height;
    
    // 画像をCanvasに描画
    ctx.drawImage(img, 0, 0);
    
    // 画像データを取得
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // 背景色を検出または使用
    const backgroundColor = config.autoDetectBackground 
      ? detectBackgroundColor(data, canvas.width, canvas.height)
      : config.manualBackgroundColor;
    
    console.log('🎨 Background removal processing:', {
      dimensions: `${canvas.width}x${canvas.height}`,
      backgroundColor,
      config
    });
    
    // 背景透過処理を実行
    const result = processTransparency(
      data, 
      canvas.width, 
      canvas.height, 
      backgroundColor, 
      config
    );
    
    // 処理済み画像データを設定
    ctx.putImageData(imageData, 0, 0);
    
    // 透過背景PNG形式でBase64エクスポート（最高品質で透過保持）
    const processedBase64 = canvas.toDataURL('image/png', 1.0);
    
    const processingTime = Date.now() - startTime;
    
    console.log('✅ Background removal completed:', {
      processingTime: `${processingTime}ms`,
      processedPixels: result.processedPixels,
      removedPixels: result.removedPixels,
      removalRate: `${Math.round((result.removedPixels / result.processedPixels) * 100)}%`
    });
    
    return {
      success: true,
      imageData: processedBase64,
      processedPixels: result.processedPixels,
      removedPixels: result.removedPixels,
      processingTime
    };
    
  } catch (error) {
    console.error('❌ Background removal failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      processingTime: Date.now() - startTime
    };
  }
}

/**
 * Base64データから画像を読み込む
 */
function loadImageFromBase64(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}

/**
 * 画像の背景色を自動検出
 * 四隅のピクセルの色を分析して最も多い色を背景色とする
 */
function detectBackgroundColor(
  data: Uint8ClampedArray, 
  width: number, 
  height: number
): { r: number; g: number; b: number } {
  const corners = [
    { x: 0, y: 0 },                    // 左上
    { x: width - 1, y: 0 },            // 右上
    { x: 0, y: height - 1 },           // 左下
    { x: width - 1, y: height - 1 }    // 右下
  ];
  
  const colorCounts = new Map<string, { color: { r: number; g: number; b: number }; count: number }>();
  
  // 四隅とエッジの色を収集
  for (const corner of corners) {
    const index = (corner.y * width + corner.x) * 4;
    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];
    const colorKey = `${r},${g},${b}`;
    
    if (colorCounts.has(colorKey)) {
      colorCounts.get(colorKey)!.count++;
    } else {
      colorCounts.set(colorKey, { color: { r, g, b }, count: 1 });
    }
  }
  
  // エッジピクセルも追加サンプリング
  const edgeSamples = 20;
  for (let i = 0; i < edgeSamples; i++) {
    // 上端
    const topIndex = (0 * width + Math.floor((width / edgeSamples) * i)) * 4;
    // 下端
    const bottomIndex = ((height - 1) * width + Math.floor((width / edgeSamples) * i)) * 4;
    // 左端
    const leftIndex = (Math.floor((height / edgeSamples) * i) * width + 0) * 4;
    // 右端
    const rightIndex = (Math.floor((height / edgeSamples) * i) * width + (width - 1)) * 4;
    
    const indices = [topIndex, bottomIndex, leftIndex, rightIndex];
    
    for (const index of indices) {
      if (index >= 0 && index < data.length - 2) {
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const colorKey = `${r},${g},${b}`;
        
        if (colorCounts.has(colorKey)) {
          colorCounts.get(colorKey)!.count++;
        } else {
          colorCounts.set(colorKey, { color: { r, g, b }, count: 1 });
        }
      }
    }
  }
  
  // 最も多い色を背景色として返す
  let mostCommonColor = { r: 255, g: 255, b: 255 };
  let maxCount = 0;
  
  for (const { color, count } of colorCounts.values()) {
    if (count > maxCount) {
      maxCount = count;
      mostCommonColor = color;
    }
  }
  
  console.log('🔍 Detected background color:', mostCommonColor, `(${maxCount} samples)`);
  return mostCommonColor;
}

/**
 * 透過処理を実行
 */
function processTransparency(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  backgroundColor: { r: number; g: number; b: number },
  config: Required<BackgroundRemovalOptions>
): { processedPixels: number; removedPixels: number } {
  let processedPixels = 0;
  let removedPixels = 0;
  
  const { colorTolerance, edgeSmoothing, transparencyStrength } = config;
  
  // 各ピクセルを処理
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      
      processedPixels++;
      
      // 背景色との色距離を計算
      const colorDistance = Math.sqrt(
        Math.pow(r - backgroundColor.r, 2) +
        Math.pow(g - backgroundColor.g, 2) +
        Math.pow(b - backgroundColor.b, 2)
      );
      
      // 閾値以下なら背景として透過
      if (colorDistance <= colorTolerance) {
        // 完全透過
        data[index + 3] = 0;
        removedPixels++;
      } else if (colorDistance <= colorTolerance + edgeSmoothing * 10) {
        // エッジのスムージング（部分透過）
        const fadeRatio = (colorDistance - colorTolerance) / (edgeSmoothing * 10);
        const alpha = Math.floor(255 * fadeRatio * transparencyStrength);
        data[index + 3] = Math.min(255, Math.max(0, alpha));
      }
      // それ以外は元のアルファ値を維持
    }
  }
  
  return { processedPixels, removedPixels };
}

/**
 * 色の距離を計算（CIE Delta E 簡易版）
 */
function calculateColorDistance(
  color1: { r: number; g: number; b: number },
  color2: { r: number; g: number; b: number }
): number {
  // RGB色空間での直接距離（簡易版）
  return Math.sqrt(
    Math.pow(color1.r - color2.r, 2) +
    Math.pow(color1.g - color2.g, 2) +
    Math.pow(color1.b - color2.b, 2)
  );
}

/**
 * 画像の透過度を分析
 */
export function analyzeTransparency(base64Data: string): Promise<{
  hasTransparency: boolean;
  transparentPixels: number;
  totalPixels: number;
  transparencyRatio: number;
}> {
  return new Promise((resolve, reject) => {
    try {
      const cleanBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Canvas context not available');
      }

      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        let transparentPixels = 0;
        const totalPixels = canvas.width * canvas.height;
        
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] < 255) { // アルファ値が255未満
            transparentPixels++;
          }
        }
        
        const transparencyRatio = transparentPixels / totalPixels;
        
        resolve({
          hasTransparency: transparentPixels > 0,
          transparentPixels,
          totalPixels,
          transparencyRatio
        });
      };
      
      img.onerror = () => reject(new Error('Failed to load image for analysis'));
      img.src = `data:image/png;base64,${cleanBase64}`;
      
    } catch (error) {
      reject(error);
    }
  });
}

export default {
  removeBackground,
  analyzeTransparency,
  calculateColorDistance
};