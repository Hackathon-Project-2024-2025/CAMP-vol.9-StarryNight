import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import AIFishCanvas from '../../components/AIFishCanvas/AIFishCanvas';
import type { AIFishCanvasRef } from '../../components/AIFishCanvas/AIFishCanvas';
import { generateWithChatGPT } from '../../services/ai/chatgptService';
import { generateWithGemini } from '../../services/ai/geminiService';
import { buildCreativeFishPrompt, validateCreativeAIResponse } from '../../services/ai/creativeFishPrompts';
import { convertSelectionsToGenerationParams } from '../../services/ai/aiSelectionsConverter';
import { convertAIResponseToFishDesign, createFallbackFishDesign } from '../../services/ai/aiResponseConverter';
import { debugLog, logGenerationProcess, validateAndDebugFishDesign, generateErrorReport } from '../../services/ai/aiDebugUtils';
import { convertAIFishToCompatibleDesign, validateCompatibleFishDesign } from '../../services/ai/aiFishCompatibilityConverter';
import { saveFishToAquarium } from '../../services/storage/localStorage';
import type { 
  AISelections, 
  AIGenerationResult, 
  AIGenerationStatus,
  AIDesignStep
} from '../../types/ai.types';
import type { AIFishDesign } from '../../types/aiFish.types';

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

// デフォルトのAI魚デザイン（生成前の状態）
const createDefaultAIFishDesign = (): AIFishDesign | undefined => {
  // 生成前は undefined を返す（AIFishCanvas側で適切に処理）
  return undefined;
};


export default function AICreatePage() {
  const [currentStep, setCurrentStep] = useState<AIDesignStep>('model');
  const [aiSelections, setAiSelections] = useState<AISelections>(createDefaultAISelections());
  const [aiFishDesign, setAiFishDesign] = useState<AIFishDesign | undefined>(createDefaultAIFishDesign());
  const [generationStatus, setGenerationStatus] = useState<AIGenerationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [fishName, setFishName] = useState<string>('AI生成金魚');
  const [customText, setCustomText] = useState<string>('');
  const [isMovingToAquarium, setIsMovingToAquarium] = useState<boolean>(false);
  const aiFishCanvasRef = useRef<AIFishCanvasRef>(null);
  const navigate = useNavigate();

  const handleStepChange = (step: AIDesignStep) => {
    setCurrentStep(step);
  };

  const handleSelectionsChange = (newSelections: Partial<AISelections>) => {
    setAiSelections(prev => ({ ...prev, ...newSelections }));
  };

  const handleCustomTextChange = (text: string) => {
    setCustomText(text);
    setAiSelections(prev => ({ ...prev, customText: text }));
  };

  const handleGenerate = async () => {
    setGenerationStatus('generating');
    setErrorMessage('');

    try {
      const startTime = Date.now();
      
      // デバッグ: 生成プロセス開始
      logGenerationProcess('START', aiSelections);
      
      // AISelections → AIGenerationParams への変換
      const generationParams = convertSelectionsToGenerationParams(aiSelections);
      logGenerationProcess('CONVERT', aiSelections, generationParams);
      
      // 創造的プロンプトの構築
      const { system, user } = buildCreativeFishPrompt(generationParams);
      logGenerationProcess('PROMPT', aiSelections, generationParams);
      
      debugLog('PROMPT', 'Generated creative prompt', { system: system.substring(0, 200) + '...', user: user.substring(0, 200) + '...' });
      
      let result: AIGenerationResult;
      
      if (aiSelections.model === 'gemini') {
        result = await generateWithGemini(system, user, {
          model: aiSelections.model,
          temperature: 0.8,
          maxTokens: 3000 // 複雑な描画データのため増量
        });
      } else {
        result = await generateWithChatGPT(system, user, {
          model: aiSelections.model,
          temperature: 0.8,
          maxTokens: 3000
        });
      }

      if (result.success && result.data) {
        if (validateCreativeAIResponse(result.data)) {
          // AI応答をAIFishDesignに変換
          const aiDesign = convertAIResponseToFishDesign(
            result.data, 
            aiSelections.model === 'gemini' ? 'gemini-2.5-pro' : 'gpt-4'
          );
          
          // 生成時間を設定
          aiDesign.generationTime = Date.now() - startTime;
          aiDesign.generationParams = generationParams;
          
          // デザイン検証
          const validation = validateAndDebugFishDesign(aiDesign);
          if (!validation.isValid) {
            debugLog('VALIDATION', 'Fish design validation failed', validation.errors);
          }
          
          setAiFishDesign(aiDesign);
          setFishName(aiDesign.name);
          setGenerationStatus('success');
          
          // 成功ログ
          logGenerationProcess('SUCCESS', aiSelections, generationParams, aiDesign);
          debugLog('SUCCESS', `AI Fish generated successfully: ${aiDesign.name} (${aiDesign.generationTime}ms)`);
        } else {
          throw new Error('AI応答の形式が不正です');
        }
      } else {
        throw new Error(result.error || 'AI生成に失敗しました');
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
      logGenerationProcess('ERROR', aiSelections, undefined, undefined, err);
      debugLog('ERROR', `Generation failed: ${err.message}`, { errorReport });
      
      // エラー時はフォールバック魚を表示
      const fallbackDesign = createFallbackFishDesign(err.message);
      setAiFishDesign(fallbackDesign);
      setFishName(fallbackDesign.name);
      
      setErrorMessage(err.message);
      setGenerationStatus('error');
    }
  };

  const handleSave = () => {
    if (aiFishCanvasRef.current && aiFishDesign) {
      const filename = fishName.replace(/\s+/g, '-').toLowerCase() || 'ai-generated-fish';
      debugLog('EXPORT', `Exporting AI fish as image: ${filename}`);
      aiFishCanvasRef.current.exportAsImage(filename, { format: 'png' });
    } else {
      debugLog('EXPORT', 'Cannot export - no canvas or fish design available');
    }
  };

  const handleReset = () => {
    debugLog('UI', 'Resetting AI fish creation form');
    setCurrentStep('model');
    setAiSelections(createDefaultAISelections());
    setAiFishDesign(createDefaultAIFishDesign());
    setFishName('AI生成金魚');
    setCustomText('');
    setGenerationStatus('idle');
    setErrorMessage('');
  };

  const handleNameChange = (newName: string) => {
    setFishName(newName);
    if (generationStatus === 'success' && aiFishDesign) {
      setAiFishDesign(prev => prev ? ({ ...prev, name: newName }) : prev);
    }
  };

  const handleMoveToAquarium = async () => {
    if (!aiFishDesign) {
      debugLog('AQUARIUM', 'Cannot move to aquarium - no fish design available');
      return;
    }

    try {
      setIsMovingToAquarium(true);
      debugLog('AQUARIUM', `Moving AI fish to aquarium: ${aiFishDesign.name}`);
      
      // AI魚をFishDesign形式に変換（完全な互換性変換）
      const compatibleFishDesign = convertAIFishToCompatibleDesign(aiFishDesign, fishName);
      
      // 変換結果の検証
      const validation = validateCompatibleFishDesign(compatibleFishDesign);
      if (!validation.isValid) {
        debugLog('AQUARIUM', 'Compatibility conversion failed', validation.errors);
        throw new Error(`互換性変換エラー: ${validation.errors.join(', ')}`);
      }
      
      if (validation.warnings.length > 0) {
        debugLog('AQUARIUM', 'Compatibility conversion warnings', validation.warnings);
      }
      
      // 金魚を水槽に保存
      saveFishToAquarium(compatibleFishDesign);
      debugLog('AQUARIUM', 'Successfully saved AI fish to aquarium storage');
      
      // 水槽ページに移動
      setTimeout(() => {
        debugLog('NAVIGATION', 'Navigating to aquarium panel');
        navigate('/panel');
      }, 500);
      
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown aquarium error');
      debugLog('AQUARIUM', `Failed to move fish to aquarium: ${err.message}`);
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
            generationStatus={generationStatus}
            errorMessage={errorMessage}
          />
        );
      default:
        return null;
    }
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
              <AIFishCanvas
                ref={aiFishCanvasRef}
                fishDesign={aiFishDesign}
                width={420}
                height={320}
                backgroundColor="#f0f8ff"
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
                  <span className="ai-button-icon">💾</span>
                  <span className="ai-button-text">保存</span>
                </button>
                
                <button
                  className="ai-action-button ai-reset-button"
                  onClick={handleReset}
                  title="すべてリセット"
                >
                  <span className="ai-button-icon">🔄</span>
                  <span className="ai-button-text">リセット</span>
                </button>
                
                <button
                  className="ai-action-button ai-aquarium-button"
                  onClick={handleMoveToAquarium}
                  disabled={generationStatus !== 'success' || isMovingToAquarium}
                  title="金魚を水槽に移動"
                >
                  <span className="ai-button-icon">🐠</span>
                  <span className="ai-button-text">
                    {isMovingToAquarium ? '移動中...' : '水槽へ移動'}
                  </span>
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