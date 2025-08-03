import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import AIImageDisplay from '../../components/AIImageDisplay/AIImageDisplay';
import type { AIImageDisplayRef } from '../../components/AIImageDisplay/AIImageDisplay';
import { generateWithChatGPT } from '../../services/ai/chatgptService';
import { generateWithGemini } from '../../services/ai/geminiService';
import { convertSelectionsToGenerationParams } from '../../services/ai/aiSelectionsConverter';
import { debugLog, logGenerationProcess, generateErrorReport } from '../../services/ai/aiDebugUtils';
import { saveFishImageToAquarium } from '../../services/storage/localStorage';
import { compressBase64Image, compressBase64ImageWithTransparency, formatBytes, calculateBase64Size } from '../../services/storage/imageCompression';
import { removeBackground, analyzeTransparency } from '../../services/image/backgroundRemovalService';
import type { 
  AISelections, 
  AIGenerationResult, 
  AIGenerationStatus,
  AIDesignStep,
  GenerationMode
} from '../../types/ai.types';
import type { BaseImageData, I2IGenerationParams } from '../../types/i2i.types';
import { generateI2I } from '../../services/ai/i2iService';

// 新しいステップコンポーネント
import AIStepNavigation from './_components/AIStepNavigation';
import Step1ModelSelection from './_components/Step1ModelSelection';
import Step2BasicFeatures from './_components/Step2BasicFeatures';
import Step3DetailSettings from './_components/Step3DetailSettings';
import Step4Accessories from './_components/Step4Accessories';
import Step5Generate from './_components/Step5Generate';

import './AICreatePage.css';

// デフォルトのAI選択値
const createDefaultAISelections = (): AISelections => ({
  model: 'chatgpt',
  bodyType: 'round',
  baseColor: 'red',
  size: 'medium',
  personality: 'calm',
  fins: 'standard',
  eyes: 'normal',
  pattern: 'none',
  headAccessory: 'none',
  faceAccessory: 'none',
  neckAccessory: 'none',
  customText: ''
});

export default function AICreatePage() {
  const [currentStep, setCurrentStep] = useState<AIDesignStep>('model');
  const [aiSelections, setAiSelections] = useState<AISelections>(createDefaultAISelections());
  const [generatedImageData, setGeneratedImageData] = useState<string>(''); // Base64画像データ
  const [generationStatus, setGenerationStatus] = useState<AIGenerationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [fishName, setFishName] = useState<string>('AI生成金魚');
  const [customText, setCustomText] = useState<string>('');
  const [isMovingToAquarium, setIsMovingToAquarium] = useState<boolean>(false);
  const [, setBaseImageData] = useState<BaseImageData | null>(null);
  const aiImageDisplayRef = useRef<AIImageDisplayRef>(null);
  const navigate = useNavigate();

  const handleStepChange = (step: AIDesignStep) => {
    setCurrentStep(step);
  };

  const handleSelectionsChange = (newSelections: Partial<AISelections>) => {
    setAiSelections(prev => ({ ...prev, ...newSelections }));
  };

  const handleGenerationModeChange = (mode: GenerationMode) => {
    setAiSelections(prev => ({ ...prev, generationMode: mode }));
    // i2iモードでない場合はベース画像をクリア
    if (mode !== 'i2i') {
      setBaseImageData(null);
    }
  };

  const handleCustomTextChange = (text: string) => {
    setCustomText(text);
    setAiSelections(prev => ({ ...prev, customText: text }));
  };

  // i2i生成ハンドラー
  const handleI2IGenerate = async (baseImage: BaseImageData) => {
    setGenerationStatus('generating');
    setErrorMessage('');
    setBaseImageData(baseImage);

    try {
      const startTime = Date.now();
      
      // デバッグ: i2i生成プロセス開始
      console.log('Starting i2i generation with base image:', baseImage.id);
      
      // i2i生成パラメータの構築
      const i2iParams: I2IGenerationParams = {
        baseImage,
        aiSelections,
        prompt: customText || 'Transform this goldfish based on the selected settings',
        strength: 0.7,
        preserveStyle: true
      };

      const result = await generateI2I(i2iParams, aiSelections.model);
      
      if (result.success && result.data?.imageData) {
        setGeneratedImageData(result.data.imageData);
        setGenerationStatus('success');
        setFishName(`AI変換金魚_${Date.now()}`);
        
        console.log('i2i generation completed successfully:', {
          duration: Date.now() - startTime,
          model: result.data.model
        });
      } else {
        throw new Error(result.error || 'i2i生成に失敗しました');
      }
      
    } catch (error) {
      console.error('i2i generation failed:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'i2i生成中に不明なエラーが発生しました';
      
      setErrorMessage(errorMessage);
      setGenerationStatus('error');
    }
  };

  const handleGenerate = async () => {
    setGenerationStatus('generating');
    setErrorMessage('');
    
    // スコープの外でgenerationParamsを定義
    const generationParams = convertSelectionsToGenerationParams(aiSelections);

    try {
      const startTime = Date.now();
      
      // デバッグ: 生成プロセス開始
      logGenerationProcess('START', aiSelections);
      
      // AISelections → AIGenerationParams の確認（既に作成済み）
      logGenerationProcess('CONVERT', aiSelections, generationParams);
      
      // ★★★ 修正：buildCreativeFishPromptを削除し、直接generationParamsを渡す ★★★
      debugLog('PROMPT', 'Using image generation parameters directly', { generationParams });
      
      let result: AIGenerationResult;
      
      if (aiSelections.model === 'gemini') {
        result = await generateWithGemini(generationParams, {
          model: aiSelections.model,
          temperature: 0.8,
          maxTokens: 3000 // 複雑な描画データのため増量（実際は画像生成では不要）
        });
      } else {
        result = await generateWithChatGPT(generationParams, {
          model: aiSelections.model,
          temperature: 0.8,
          maxTokens: 3000 // 複雑な描画データのため増量（実際は画像生成では不要）
        });
      }

      if (result.success && result.data && typeof result.data === 'string') {
        // 画像データ（Base64）を直接設定
        setGeneratedImageData(result.data);
        setGenerationStatus('success');
        
        // 成功ログ
        const generationTime = Date.now() - startTime;
        logGenerationProcess('SUCCESS', aiSelections, generationParams, undefined);
        debugLog('SUCCESS', `AI image generated successfully: ${fishName} (${generationTime}ms)`);
      } else {
        throw new Error(result.error || 'AI画像生成に失敗しました');
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      
      // エラー報告の生成
      const errorReport = generateErrorReport(err, {
        selections: aiSelections,
        aiModel: aiSelections.model,
        step: 'GENERATION'
      });
      
      // デバッグログ
      logGenerationProcess('ERROR', aiSelections, generationParams, undefined, err);
      debugLog('ERROR', `Generation failed: ${err.message}`, { errorReport });
      
      // エラー時は画像データをクリア
      setGeneratedImageData('');
      
      setErrorMessage(err.message);
      setGenerationStatus('error');
    }
  };

  const handleSave = () => {
    if (aiImageDisplayRef.current && generatedImageData) {
      const filename = fishName.replace(/\s+/g, '-').toLowerCase() || 'ai-generated-fish';
      debugLog('EXPORT', `Exporting AI image: ${filename}`);
      aiImageDisplayRef.current.downloadImage(`${filename}.png`);
    } else {
      debugLog('EXPORT', 'Cannot export - no image data available');
    }
  };

  const handleReset = () => {
    debugLog('UI', 'Resetting AI fish creation form');
    setCurrentStep('model');
    setAiSelections(createDefaultAISelections());
    setGeneratedImageData('');
    setFishName('AI生成金魚');
    setCustomText('');
    setGenerationStatus('idle');
    setErrorMessage('');
  };

  const handleNameChange = (newName: string) => {
    setFishName(newName);
  };

  const handleMoveToAquarium = async () => {
    if (!generatedImageData) {
      debugLog('AQUARIUM', 'Cannot move to aquarium - no image data available');
      return;
    }

    try {
      setIsMovingToAquarium(true);
      debugLog('AQUARIUM', `Moving AI generated image to aquarium: ${fishName}`);
      
      // 元画像サイズをログ出力
      const originalSize = calculateBase64Size(generatedImageData);
      debugLog('COMPRESSION', `Original image size: ${formatBytes(originalSize)}`);
      
      // 背景透過処理を実行
      debugLog('BACKGROUND_REMOVAL', 'Analyzing transparency and removing background...');
      const transparencyAnalysis = await analyzeTransparency(generatedImageData);
      debugLog('BACKGROUND_REMOVAL', `Transparency analysis: ${Math.round(transparencyAnalysis.transparencyRatio * 100)}% transparent`);
      
      let processedImageData = generatedImageData;
      if (transparencyAnalysis.transparencyRatio < 0.5) {
        // 透過度が50%未満の場合は背景除去処理を実行
        debugLog('BACKGROUND_REMOVAL', 'Low transparency detected, applying background removal...');
        const backgroundRemovalResult = await removeBackground(generatedImageData, {
          colorTolerance: 35,
          edgeSmoothing: 3,
          transparencyStrength: 1.0,
          autoDetectBackground: true
        });
        
        if (backgroundRemovalResult.success && backgroundRemovalResult.imageData) {
          processedImageData = backgroundRemovalResult.imageData;
          debugLog('BACKGROUND_REMOVAL', `Background removal completed: ${backgroundRemovalResult.removedPixels}/${backgroundRemovalResult.processedPixels} pixels removed`);
        } else {
          debugLog('BACKGROUND_REMOVAL', `Background removal failed: ${backgroundRemovalResult.error}, using original image`);
        }
      } else {
        debugLog('BACKGROUND_REMOVAL', 'Sufficient transparency detected, skipping background removal');
      }
      
      // 透過保持圧縮（水槽表示用に最適化）
      debugLog('COMPRESSION', 'Compressing image with transparency preservation...');
      const compressedImageData = await compressBase64ImageWithTransparency(
        processedImageData,
        400, // maxWidth: 400px (水槽表示に適したサイズ)
        300  // maxHeight: 300px
      );
      
      const compressedSize = calculateBase64Size(compressedImageData);
      const processedSize = calculateBase64Size(processedImageData);
      const compressionRatio = Math.round((compressedSize / processedSize) * 100);
      debugLog('COMPRESSION', `Compressed image size: ${formatBytes(compressedSize)} (${compressionRatio}% of processed)`);
      
      // 圧縮済み画像データを水槽に保存
      saveFishImageToAquarium({
        id: `ai-fish-${Date.now()}`, // 一意のID生成
        name: fishName,
        imageData: compressedImageData, // 圧縮済みBase64画像データ
        type: 'ai-generated', // AI生成フラグ
        aiModel: aiSelections.model,
        generatedAt: new Date().toISOString(), // ISO文字列として保存
        selections: aiSelections // 生成時の設定も保存
      });
      
      debugLog('AQUARIUM', 'Successfully saved compressed AI image to aquarium storage');
      
      // 水槽ページに移動
      setTimeout(() => {
        debugLog('NAVIGATION', 'Navigating to aquarium panel');
        navigate('/panel');
      }, 500);
      
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown aquarium error');
      
      // QuotaExceededErrorの場合は分かりやすいメッセージ
      if (err.name === 'QuotaExceededError' || err.message.includes('quota')) {
        debugLog('AQUARIUM', 'Storage quota exceeded. Please delete some old fish images.');
        setErrorMessage('容量不足のため保存できません。古い金魚画像を削除してください。');
      } else if (err.message.includes('compression')) {
        debugLog('AQUARIUM', `Image compression failed: ${err.message}`);
        setErrorMessage('画像圧縮中にエラーが発生しました。再試行してください。');
      } else {
        debugLog('AQUARIUM', `Failed to move image to aquarium: ${err.message}`);
        setErrorMessage('水槽への移動中にエラーが発生しました。');
      }
      
      setIsMovingToAquarium(false);
    }
  };

  // ステップナビゲーションの制御
  const canGoNext = () => {
    switch (currentStep) {
      case 'model': return !!aiSelections.model;
      case 'basic': return !!aiSelections.bodyType && !!aiSelections.baseColor;
      case 'details': return !!aiSelections.fins && !!aiSelections.eyes;
      case 'accessory': return true; // アクセサリーは任意
      case 'generate': return false; // 最終ステップ
      default: return false;
    }
  };

  const canGoPrev = () => {
    return currentStep !== 'model';
  };

  // 現在のステップに応じたコンテンツをレンダリング
  const renderStepContent = () => {
    switch (currentStep) {
      case 'model':
        return (
          <Step1ModelSelection
            selectedModel={aiSelections.model}
            onModelChange={(model) => handleSelectionsChange({ model })}
            generationMode={aiSelections.generationMode}
            onGenerationModeChange={handleGenerationModeChange}
          />
        );
      case 'basic':
        return (
          <Step2BasicFeatures
            selections={aiSelections}
            onSelectionsChange={handleSelectionsChange}
          />
        );
      case 'details':
        return (
          <Step3DetailSettings
            selections={aiSelections}
            onSelectionsChange={handleSelectionsChange}
          />
        );
      case 'accessory':
        return (
          <Step4Accessories
            selections={aiSelections}
            onSelectionsChange={handleSelectionsChange}
          />
        );
      case 'generate':
        return (
          <Step5Generate
            selections={aiSelections}
            customText={customText}
            onCustomTextChange={handleCustomTextChange}
            onGenerate={handleGenerate}
            onI2IGenerate={handleI2IGenerate}
            generationStatus={generationStatus}
            errorMessage={errorMessage}
          />
        );
      default:
        return null;
    }
  };

  const handleShareToX = () => {
    const tweetText = encodeURIComponent(`🎣 ぼくの作った魚「${fishName}」を見てみて！ #自作魚`);
    const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
    window.open(tweetUrl, "_blank");
  };

  return (
    <Layout>
      <div className="ai-create-page">
        <header className="ai-page-header">
          {/* <h1 className="ai-page-title">
            <span className="ai-title-icon">🤖</span>
            AI金魚クリエイター
          </h1> */}
          <p className="ai-page-description">
            5つのステップでAIが美しい金魚を生成します
          </p>
        </header>

        <main className="ai-fish-designer">
          <div className="ai-fish-preview-section">
            <div className="ai-fish-preview-area">
              <AIImageDisplay
                ref={aiImageDisplayRef}
                imageData={generatedImageData}
                width={420}
                height={320}
                alt={fishName}
                className={`ai-main-preview ${generationStatus}`}
              />
            </div>
            
            <div className="ai-fish-control-card">
              <div className="ai-fish-info">
                <h3 className="ai-fish-name-display">{fishName}</h3>
                <p className="ai-generation-status-text">
                  {generationStatus === 'idle' && '設定完了後に生成できます'}
                  {generationStatus === 'generating' && 'AI生成中..🤖'}
                  {generationStatus === 'success' && '生成完了！✨'}
                  {generationStatus === 'error' && '生成エラー❌'}
                </p>
              </div>
              
              <div className="ai-name-edit-section">
                <label className="ai-name-label">金魚の名前:</label>
                <input
                  type="text"
                  value={fishName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="ai-name-input"
                  placeholder="金魚の名前"
                  maxLength={20}
                />
              </div>
              
              <div className="ai-action-buttons">
                <button
                  className="ai-action-button ai-save-button"
                  onClick={handleSave}
                  disabled={generationStatus !== 'success'}
                  title="金魚を画像として保存"
                >
                  <span className="ai-button-text">保存</span>
                </button>
                
                <button
                  className="ai-action-button ai-reset-button"
                  onClick={handleReset}
                  title="すべてリセット"
                >
                  <span className="ai-button-text">リセット</span>
                </button>
                
                <button
                  className="ai-action-button ai-aquarium-button"
                  onClick={handleMoveToAquarium}
                  disabled={generationStatus !== 'success' || isMovingToAquarium}
                  title="金魚を水槽に移動"
                >
                  <span className="ai-button-text">
                    {isMovingToAquarium ? '移動中...' : '水槽へ移動'}
                  </span>
                </button>

                <button
                  className="action-button action-button-twitter"
                  onClick={handleShareToX}
                  title="Xに投稿"
                >
                  <span className="button-text">Xに投稿</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="ai-design-controls-section">
            <div className="ai-controls-header">
              <h2 className="ai-controls-title">🤖 AI設定</h2>
              <p className="ai-controls-description">
                ステップに従ってAIが美しい金魚を生成します
              </p>
            </div>

            <AIStepNavigation
              currentStep={currentStep}
              onStepChange={handleStepChange}
              canGoNext={canGoNext()}
              canGoPrev={canGoPrev()}
            />

            <div className="ai-step-content">
              {renderStepContent()}
            </div>
          </div>
          
        </main>
      </div>
    </Layout>
  );
}