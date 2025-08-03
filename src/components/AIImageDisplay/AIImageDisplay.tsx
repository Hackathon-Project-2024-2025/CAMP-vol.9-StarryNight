import { useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import './AIImageDisplay.css';

interface AIImageDisplayProps {
  imageData?: string; // Base64エンコードされた画像データ
  width?: number;
  height?: number;
  alt?: string;
  className?: string;
  onImageLoad?: () => void;
  onImageError?: (error: Error) => void;
}

const AIImageDisplay = forwardRef<AIImageDisplayRef, AIImageDisplayProps>(({ 
  imageData, 
  width = 420, 
  height = 320, 
  alt = 'AI生成画像',
  className = '',
  onImageLoad,
  onImageError
}, ref) => {
  const [imageError, setImageError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Base64データをdata URL形式に変換
  const getImageSrc = useCallback(() => {
    if (!imageData) return null;
    
    // 既にdata:で始まっている場合はそのまま使用
    if (imageData.startsWith('data:')) {
      return imageData;
    }
    
    // Base64データの場合はdata URLに変換
    return `data:image/png;base64,${imageData}`;
  }, [imageData]);

  // 画像読み込み完了時の処理
  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
    onImageLoad?.();
  };

  // 画像読み込みエラー時の処理
  const handleImageError = () => {
    setIsLoading(false);
    setImageError(true);
    const error = new Error('Failed to load AI generated image');
    onImageError?.(error);
  };

  // 画像をクリップボードにコピー
  const copyToClipboard = async () => {
    if (!imageData) return;

    try {
      const imageSrc = getImageSrc();
      if (!imageSrc) return;

      // Base64データをBlobに変換
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      
      // クリップボードに画像をコピー
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      
      console.log('Image copied to clipboard');
    } catch (error) {
      console.error('Failed to copy image to clipboard:', error);
    }
  };

  // 画像をダウンロード
  const downloadImage = (filename: string = 'ai-generated-goldfish.png') => {
    if (!imageData) return;

    const imageSrc = getImageSrc();
    if (!imageSrc) return;

    // ダウンロード用のリンクを作成
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // refの実装
  useImperativeHandle(ref, () => ({
    downloadImage,
    copyToClipboard
  }));

  const imageSrc = getImageSrc();

  return (
    <div 
      className={`ai-image-display ${className}`}
      style={{ width, height }}
    >
      {!imageData ? (
        // 画像データがない場合のプレースホルダー
        <div className="ai-image-placeholder">
          <div className="placeholder-icon">🎨</div>
          <div className="placeholder-text">
            AI画像生成を<br />実行してください
          </div>
        </div>
      ) : imageError ? (
        // 画像読み込みエラーの場合
        <div className="ai-image-error">
          <div className="error-icon">❌</div>
          <div className="error-text">
            画像の読み込みに<br />失敗しました
          </div>
        </div>
      ) : (
        // 画像表示
        <div className="ai-image-container">
          {isLoading && (
            <div className="ai-image-loading">
              <div className="loading-spinner"></div>
              <div className="loading-text">画像読み込み中...</div>
            </div>
          )}
          
          <img
            src={imageSrc || ''}
            alt={alt}
            width={width}
            height={height}
            onLoad={handleImageLoad}
            onError={handleImageError}
            className={`ai-generated-image ${isLoading ? 'loading' : ''}`}
          />
          
          {!isLoading && !imageError && (
            <div className="ai-image-controls">
              <button
                type="button"
                className="ai-image-control-btn"
                onClick={copyToClipboard}
                title="クリップボードにコピー"
              >
                📋
              </button>
              <button
                type="button"
                className="ai-image-control-btn"
                onClick={() => downloadImage()}
                title="画像をダウンロード"
              >
                💾
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

AIImageDisplay.displayName = 'AIImageDisplay';

// ref用の型定義とインターフェース
export interface AIImageDisplayRef {
  downloadImage: (filename?: string) => void;
  copyToClipboard: () => Promise<void>;
}

export default AIImageDisplay;