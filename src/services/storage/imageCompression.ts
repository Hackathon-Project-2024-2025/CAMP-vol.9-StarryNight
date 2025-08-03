// Base64画像データの圧縮とリサイズユーティリティ

/**
 * Base64画像データを圧縮・リサイズする
 * @param base64Data - Base64エンコードされた画像データ
 * @param maxWidth - 最大幅（デフォルト: 400）
 * @param maxHeight - 最大高さ（デフォルト: 300）
 * @param quality - JPEG圧縮品質 0.0-1.0（デフォルト: 0.8）
 * @returns 圧縮されたBase64データ
 */
export async function compressBase64Image(
  base64Data: string,
  maxWidth: number = 400,
  maxHeight: number = 300,
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Canvas要素を作成
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Canvas context not available');
      }

      // Base64データをクリーニング（二重プレフィックスを防ぐ）
      const cleanBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
      
      // Image要素を作成して元画像を読み込み
      const img = new Image();
      
      img.onload = () => {
        try {
          // 元画像のアスペクト比を維持してリサイズ寸法計算
          const { width: newWidth, height: newHeight } = calculateResizeDimensions(
            img.width,
            img.height,
            maxWidth,
            maxHeight
          );

          // Canvasサイズを設定
          canvas.width = newWidth;
          canvas.height = newHeight;

          // 高品質な画像リサイズ設定
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // 透過背景を保持（PNG形式で出力するため背景塗りつぶしなし）
          // ctx.fillStyle = '#ffffff';
          // ctx.fillRect(0, 0, newWidth, newHeight);

          // 画像を描画（リサイズ）
          ctx.drawImage(img, 0, 0, newWidth, newHeight);

          // PNG形式でBase64データとして出力（透過保持）
          const compressedBase64 = canvas.toDataURL('image/png');
          
          // data:image/png;base64, の部分を削除して純粋なBase64データを返す
          const base64Only = compressedBase64.split(',')[1];
          
          console.log(`🗜️ 画像圧縮完了: ${img.width}x${img.height} → ${newWidth}x${newHeight}`);
          console.log(`📊 圧縮率: ${Math.round((base64Only.length / cleanBase64.length) * 100)}%`);
          
          resolve(base64Only);
        } catch (error) {
          reject(new Error(`Image compression failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for compression'));
      };

      img.src = `data:image/png;base64,${cleanBase64}`;
      
    } catch (error) {
      reject(new Error(`Compression setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  });
}

/**
 * アスペクト比を維持してリサイズ寸法を計算
 */
function calculateResizeDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let newWidth = originalWidth;
  let newHeight = originalHeight;

  // 最大幅を超える場合は幅に合わせてリサイズ
  if (newWidth > maxWidth) {
    newHeight = (newHeight * maxWidth) / newWidth;
    newWidth = maxWidth;
  }

  // 最大高さを超える場合は高さに合わせてリサイズ
  if (newHeight > maxHeight) {
    newWidth = (newWidth * maxHeight) / newHeight;
    newHeight = maxHeight;
  }

  return {
    width: Math.round(newWidth),
    height: Math.round(newHeight)
  };
}

/**
 * Base64データのサイズを計算（バイト単位）
 */
export function calculateBase64Size(base64Data: string): number {
  // Base64は4文字で3バイトを表現
  // パディング文字（=）も考慮
  const padding = (base64Data.match(/=/g) || []).length;
  return Math.round((base64Data.length * 3) / 4 - padding);
}

/**
 * 透過保持圧縮（水槽用）
 * PNG形式で透過を保持しつつサイズを最適化
 * @param base64Data - Base64エンコードされた画像データ
 * @param maxWidth - 最大幅（デフォルト: 400）
 * @param maxHeight - 最大高さ（デフォルト: 300）
 * @returns 透過保持されたBase64データ
 */
export async function compressBase64ImageWithTransparency(
  base64Data: string,
  maxWidth: number = 400,
  maxHeight: number = 300
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Base64データをクリーニング（二重プレフィックスを防ぐ）
      const cleanBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
      
      // Canvas要素を作成
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Canvas context not available');
      }

      // Image要素を作成して元画像を読み込み
      const img = new Image();
      
      img.onload = () => {
        try {
          // 元画像のアスペクト比を維持してリサイズ寸法計算
          const { width: newWidth, height: newHeight } = calculateResizeDimensions(
            img.width,
            img.height,
            maxWidth,
            maxHeight
          );

          // Canvasサイズを設定
          canvas.width = newWidth;
          canvas.height = newHeight;

          // 高品質な画像リサイズ設定
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // 透過背景を保持（PNG形式で透過保持）
          // 背景塗りつぶしは行わない

          // 画像を描画（リサイズ）
          ctx.drawImage(img, 0, 0, newWidth, newHeight);

          // PNG形式でBase64データとして出力（透過保持）
          const compressedBase64 = canvas.toDataURL('image/png');
          
          // data:image/png;base64, の部分を削除して純粋なBase64データを返す
          const base64Only = compressedBase64.split(',')[1];
          
          console.log(`🗜️ 透過保持圧縮完了: ${img.width}x${img.height} → ${newWidth}x${newHeight}`);
          console.log(`📊 圧縮率: ${Math.round((base64Only.length / cleanBase64.length) * 100)}%`);
          
          resolve(base64Only);
        } catch (error) {
          reject(new Error(`Transparency compression failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for transparency compression'));
      };

      img.src = `data:image/png;base64,${cleanBase64}`;
      
    } catch (error) {
      reject(new Error(`Transparency compression setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  });
}

/**
 * バイト数を人間に読みやすい形式に変換
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 複数の画像データの合計サイズを計算
 */
export function calculateTotalImageSize(base64DataArray: string[]): number {
  return base64DataArray.reduce((total, data) => {
    return total + calculateBase64Size(data);
  }, 0);
}

/**
 * localStorage容量制限のチェック
 * @param additionalSize - 追加予定のデータサイズ（バイト）
 * @returns 容量に余裕があるかどうか
 */
export function checkLocalStorageCapacity(additionalSize: number = 0): {
  hasCapacity: boolean;
  currentUsage: number;
  estimatedLimit: number;
  availableSpace: number;
} {
  // localStorage使用量を計算
  let currentUsage = 0;
  for (const key in localStorage) {
    if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
      currentUsage += localStorage[key].length;
    }
  }
  
  // 一般的なlocalStorage制限は5-10MB、安全マージンを考慮して4MBとする
  const estimatedLimit = 4 * 1024 * 1024; // 4MB
  const availableSpace = estimatedLimit - currentUsage;
  const hasCapacity = availableSpace > additionalSize;
  
  return {
    hasCapacity,
    currentUsage,
    estimatedLimit,
    availableSpace
  };
}