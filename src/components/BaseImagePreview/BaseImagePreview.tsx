// ベース画像プレビューコンポーネント
// i2i生成用のCanvas描画金魚をプレビュー表示

import { useEffect, useState, useCallback } from 'react';
import type { AISelections } from '../../types/ai.types';
import type { FishDesign } from '../../types/common.types';
import type { BaseImageData, CanvasRenderResult } from '../../types/i2i.types';
import { convertAISelectionsToFishDesign } from '../../services/ai/aiToCreateConverter';
import useFishCanvas from '../../hooks/useFishCanvas';
import './BaseImagePreview.css';

interface BaseImagePreviewProps {
  aiSelections: AISelections;
  onBaseImageGenerated?: (baseImage: BaseImageData) => void;
  onError?: (error: string) => void;
  className?: string;
}

export default function BaseImagePreview({
  aiSelections,
  onBaseImageGenerated,
  onError,
  className = ''
}: BaseImagePreviewProps) {
  const [fishDesign, setFishDesign] = useState<FishDesign | null>(null);
  const [baseImage, setBaseImage] = useState<BaseImageData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [conversionError, setConversionError] = useState<string | null>(null);
  
  const { generateCanvasImage } = useFishCanvas();

  // ベース画像再生成のマニュアル関数
  const regenerateBaseImage = useCallback(async () => {
    if (!fishDesign) return;

    setIsGenerating(true);
    try {
      const result: CanvasRenderResult = await generateCanvasImage(fishDesign, {
        width: 800,
        height: 600,
        backgroundColor: 'transparent', // 透過背景
        scale: 1.0,
        centered: true
      });

      if (result.success && result.imageData) {
        const newBaseImage: BaseImageData = {
          id: `base-${Date.now()}`,
          imageData: result.imageData,
          width: result.dimensions.width,
          height: result.dimensions.height,
          fishDesign,
          createdAt: new Date()
        };

        setBaseImage(newBaseImage);
        onBaseImageGenerated?.(newBaseImage);
      } else {
        throw new Error(result.error || 'Canvas画像生成に失敗しました');
      }
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'ベース画像生成中にエラーが発生しました';
      setConversionError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [fishDesign, generateCanvasImage, onBaseImageGenerated, onError]);

  // AI設定変更時の自動変換
  useEffect(() => {
    try {
      setConversionError(null);
      const converted = convertAISelectionsToFishDesign(aiSelections);
      setFishDesign(converted);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'FishDesign変換中にエラーが発生しました';
      setConversionError(errorMessage);
      onError?.(errorMessage);
    }
  }, [aiSelections]); // onErrorを依存関係から除外してループを防ぐ

  // FishDesign変更時の自動ベース画像生成
  useEffect(() => {
    if (!fishDesign || isGenerating) return;

    const generateImage = async () => {
      setIsGenerating(true);
      try {
        const result = await generateCanvasImage(fishDesign, {
          width: 800,
          height: 600,
          backgroundColor: 'transparent',
          scale: 1.0,
          centered: true
        });

        if (result.success && result.imageData) {
          const newBaseImage: BaseImageData = {
            id: `base-${Date.now()}`,
            imageData: result.imageData,
            width: result.dimensions.width,
            height: result.dimensions.height,
            fishDesign,
            createdAt: new Date()
          };

          setBaseImage(newBaseImage);
          onBaseImageGenerated?.(newBaseImage);
        } else {
          throw new Error(result.error || 'Canvas画像生成に失敗しました');
        }
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'ベース画像生成中にエラーが発生しました';
        setConversionError(errorMessage);
        onError?.(errorMessage);
      } finally {
        setIsGenerating(false);
      }
    };

    generateImage();
  }, [fishDesign, isGenerating]); // generateCanvasImageを依存関係から除外してループを防ぐ

  // AI設定の表示用データ
  const getDisplaySettings = () => {
    return [
      { label: '体型', value: getBodyTypeDisplay(aiSelections.bodyType) },
      { label: '基本色', value: getColorDisplay(aiSelections.baseColor) },
      { label: 'サイズ', value: getSizeDisplay(aiSelections.size) },
      { label: '性格', value: getPersonalityDisplay(aiSelections.personality) },
      { label: 'ヒレ', value: getFinDisplay(aiSelections.fins) },
      { label: '目', value: getEyeDisplay(aiSelections.eyes) },
      { label: '模様', value: getPatternDisplay(aiSelections.pattern) }
    ].filter(setting => setting.value !== '未設定');
  };

  return (
    <div className={`base-image-preview ${className}`}>
      <div className="preview-header">
        <h4 className="preview-title">
          <span className="preview-icon">🎨</span>
          ベース画像プレビュー
        </h4>
        <p className="preview-description">
          AI設定から生成されたCanvas金魚がi2i変換のベースとして使用されます
        </p>
      </div>

      <div className="preview-content">
        {/* AI設定サマリー */}
        <div className="ai-settings-summary">
          <h5 className="summary-title">現在のAI設定</h5>
          <div className="settings-grid">
            {getDisplaySettings().map((setting, index) => (
              <div key={index} className="setting-item">
                <span className="setting-label">{setting.label}:</span>
                <span className="setting-value">{setting.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ベース画像表示 */}
        <div className="base-image-container">
          {conversionError ? (
            <div className="error-state">
              <div className="error-icon">⚠️</div>
              <div className="error-message">{conversionError}</div>
              <button 
                className="retry-button"
                onClick={convertToFishDesign}
              >
                再試行
              </button>
            </div>
          ) : isGenerating ? (
            <div className="generating-state">
              <div className="loading-spinner"></div>
              <div className="loading-message">ベース画像を生成中...</div>
            </div>
          ) : baseImage ? (
            <div className="image-display">
              <div className="image-wrapper">
                <img 
                  src={baseImage.imageData} 
                  alt="ベース金魚画像" 
                  className="base-image"
                />
                <div className="image-overlay">
                  <div className="image-info">
                    <span className="image-dimensions">
                      {baseImage.width}×{baseImage.height}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="image-details">
                <div className="fish-name">
                  <span className="name-icon">🐠</span>
                  {fishDesign?.name || 'AI生成金魚'}
                </div>
                <div className="generation-time">
                  生成時刻: {baseImage.createdAt.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🎯</div>
              <div className="empty-message">AI設定からベース画像を生成します</div>
            </div>
          )}
        </div>

        {/* i2i変換の説明 */}
        <div className="i2i-explanation">
          <h5 className="explanation-title">
            <span className="explanation-icon">🔄</span>
            Image-to-Image変換について
          </h5>
          <div className="explanation-content">
            <p>
              このベース画像を使用してAIが以下の処理を行います：
            </p>
            <ul className="explanation-list">
              <li>
                <span className="list-icon">✨</span>
                ベース画像の構造を保持しつつAI設定に基づく変換
              </li>
              <li>
                <span className="list-icon">🎨</span>
                背景透過の確実な維持
              </li>
              <li>
                <span className="list-icon">🔍</span>
                詳細な特徴の反映とクオリティ向上
              </li>
              <li>
                <span className="list-icon">⚡</span>
                通常生成より高い設定反映精度
              </li>
            </ul>
          </div>
        </div>

        {/* 操作ボタン */}
        <div className="preview-actions">
          <button 
            className="regenerate-button"
            onClick={regenerateBaseImage}
            disabled={!fishDesign || isGenerating}
          >
            <span className="button-icon">🔄</span>
            ベース画像を再生成
          </button>
          
          {baseImage && (
            <button 
              className="download-button"
              onClick={() => downloadBaseImage(baseImage)}
            >
              <span className="button-icon">💾</span>
              ベース画像をダウンロード
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// 表示用変換関数群
function getBodyTypeDisplay(bodyType: string): string {
  const displays = {
    round: '丸型（ふっくら）',
    streamlined: '流線型（スピード重視）',
    flat: '平型（横に平たい）',
    elongated: '細長型（ウナギ系）'
  };
  return displays[bodyType as keyof typeof displays] || '未設定';
}

function getColorDisplay(color: string): string {
  const displays = {
    red: '赤（情熱的）',
    blue: '青（クール）',
    yellow: '黄（明るい）',
    white: '白（上品）',
    black: '黒（神秘的）',
    colorful: 'カラフル（虹色）'
  };
  return displays[color as keyof typeof displays] || '未設定';
}

function getSizeDisplay(size: string): string {
  const displays = {
    small: '小さめ（可愛らしい）',
    medium: '中くらい（バランス）',
    large: '大きめ（迫力）'
  };
  return displays[size as keyof typeof displays] || '未設定';
}

function getPersonalityDisplay(personality: string): string {
  const displays = {
    calm: '穏やか（リラックス）',
    active: '活発（エネルギッシュ）',
    elegant: '優雅（洗練）',
    unique: 'ユニーク（個性的）'
  };
  return displays[personality as keyof typeof displays] || '未設定';
}

function getFinDisplay(fins: string): string {
  const displays = {
    standard: '標準（バランス）',
    large: '大きめ（迫力）',
    decorative: '装飾的（華やか）',
    simple: 'シンプル（控えめ）'
  };
  return displays[fins as keyof typeof displays] || '未設定';
}

function getEyeDisplay(eyes: string): string {
  const displays = {
    normal: '普通（標準）',
    large: '大きめ（表情豊か）',
    small: '小さめ（奥ゆかしい）',
    distinctive: '特徴的（印象的）'
  };
  return displays[eyes as keyof typeof displays] || '未設定';
}

function getPatternDisplay(pattern: string): string {
  const displays = {
    none: 'なし',
    spotted: 'まだら模様',
    striped: '縞模様',
    polka: '水玉模様',
    gradient: 'グラデーション'
  };
  return displays[pattern as keyof typeof displays] || '未設定';
}

// ベース画像ダウンロード機能
function downloadBaseImage(baseImage: BaseImageData): void {
  try {
    const link = document.createElement('a');
    link.href = baseImage.imageData;
    
    const timestamp = new Date().toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}Z$/, '')
      .replace('T', '_');
    
    const fishName = baseImage.fishDesign.name
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '_');
    
    link.download = `base_${fishName}_${timestamp}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('ベース画像のダウンロードに失敗しました:', error);
  }
}