import { useState, useRef } from 'react';
import Layout from '../../components/Layout/Layout';
import FishPreview from '../CreatePage/_components/FishPreview';
import type { FishPreviewRef } from '../CreatePage/_components/FishPreview';
import { generateWithChatGPT } from '../../services/ai/chatgptService';
import { generateWithGemini } from '../../services/ai/geminiService';
import { buildAIPrompt, validateAIResponse } from '../../services/ai/aiPromptBuilder';
import type { 
  AISelections, 
  AIGenerationResult, 
  AIGenerationStatus,
  AIDesignStep
} from '../../types/ai.types';
import type { FishDesign, FishBase, SelectedParts, FishCustomizations } from '../../types/common.types';

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

// デフォルトの魚デザイン（ベース）
const createDefaultFishDesign = (): FishDesign => {
  const defaultBase: FishBase = {
    id: 'ai-base-round',
    name: 'AI基本型',
    shape: 'round',
    defaultColor: '#ff6b6b',
    size: { width: 100, height: 60 },
    description: 'AI生成用の基本体型'
  };

  const defaultParts: SelectedParts = {
    dorsalFin: {
      id: 'ai-dorsal-basic',
      name: 'AI背ビレ',
      category: 'dorsalFin',
      thumbnail: '',
      description: 'AI生成背ビレ',
      renderData: { shape: 'triangular', size: 1.0 }
    },
    pectoralFins: {
      id: 'ai-pectoral-basic',
      name: 'AI胸ビレ',
      category: 'pectoralFins',
      thumbnail: '',
      description: 'AI生成胸ビレ',
      renderData: { shape: 'oval', size: 1.0 }
    },
    tailFin: {
      id: 'ai-tail-fan',
      name: 'AI尾ビレ',
      category: 'tailFin',
      thumbnail: '',
      description: 'AI生成尾ビレ',
      renderData: { shape: 'fan', size: 1.0 }
    },
    eyes: {
      id: 'ai-eyes-round',
      name: 'AI目',
      category: 'eyes',
      thumbnail: '',
      description: 'AI生成の目',
      renderData: { shape: 'round', size: 1.0 }
    },
    mouth: {
      id: 'ai-mouth-small',
      name: 'AI口',
      category: 'mouth',
      thumbnail: '',
      description: 'AI生成の口',
      renderData: { shape: 'small', size: 1.0 }
    },
    scales: {
      id: 'ai-scales-basic',
      name: 'AI鱗',
      category: 'scales',
      thumbnail: '',
      description: 'AI生成の鱗',
      renderData: { shape: 'basic', size: 1.0 }
    }
  };

  const defaultCustomizations: FishCustomizations = {
    bodyColor: '#ff6b6b',
    finColor: '#ff8e8e',
    eyeColor: '#2c2c2c',
    size: 1.0,
    finSize: 1.0,
    eyeSize: 1.0,
    eyePosition: { x: 0, y: 0 },
    mouthPosition: { x: 0, y: 0 },
    dorsalFinPosition: { x: 0, y: 0 },
    tailFinPosition: { x: 0, y: 0 },
    pectoralFinPosition: { x: 0, y: 0 }
  };

  return {
    id: `ai-fish-${Date.now()}`,
    name: 'AI生成金魚',
    base: defaultBase,
    parts: defaultParts,
    customizations: defaultCustomizations,
    bodyPattern: undefined,
    accessories: [],
    createdAt: new Date()
  };
};

// AI応答をFishDesignに変換
const convertAIResponseToFishDesign = (aiResponse: unknown): FishDesign => {
  const baseDesign = createDefaultFishDesign();
  const response = aiResponse as Record<string, unknown>;
  
  return {
    ...baseDesign,
    id: `ai-fish-${Date.now()}`,
    name: (response.name as string) || 'AI生成金魚',
    customizations: {
      ...baseDesign.customizations,
      bodyColor: (response.bodyColor as string) || baseDesign.customizations.bodyColor,
      finColor: (response.finColor as string) || baseDesign.customizations.finColor,
      eyeColor: (response.eyeColor as string) || baseDesign.customizations.eyeColor,
      size: Math.max(0.5, Math.min(2.0, (response.size as number) || 1.0)),
      finSize: Math.max(0.5, Math.min(2.0, (response.finSize as number) || 1.0)),
      eyeSize: Math.max(0.5, Math.min(2.0, (response.eyeSize as number) || 1.0))
    },
    bodyPattern: response.bodyPattern ? {
      id: `pattern-${Date.now()}`,
      name: ((response.bodyPattern as Record<string, unknown>).type as string) || 'AI生成パターン',
      type: (((response.bodyPattern as Record<string, unknown>).type as string) as 'solid' | 'spotted' | 'striped' | 'polka' | 'calico' | 'gradient') || 'solid',
      description: 'AI生成による体の模様',
      colors: ((response.bodyPattern as Record<string, unknown>).colors as string[]) || [response.bodyColor as string],
      intensity: Math.max(0.1, Math.min(1.0, ((response.bodyPattern as Record<string, unknown>).intensity as number) || 0.6)),
      scale: Math.max(0.5, Math.min(2.0, ((response.bodyPattern as Record<string, unknown>).scale as number) || 1.0)),
      seed: Math.floor(Math.random() * 100000)
    } : undefined,
    accessories: ((response.accessories as Array<Record<string, unknown>>) || []).map((acc, index) => ({
      id: (acc.id as string) || `ai-accessory-${index}`,
      name: (acc.category as string) || 'AI装飾',
      category: ((acc.category as string) as 'crown' | 'hat' | 'glasses' | 'ribbon' | 'bow' | 'jewelry') || 'hat',
      description: 'AI生成アクセサリー',
      position: {
        x: Math.max(-1, Math.min(1, ((acc.position as Record<string, unknown>)?.x as number) || 0)),
        y: Math.max(-1, Math.min(1, ((acc.position as Record<string, unknown>)?.y as number) || 0))
      },
      size: Math.max(0.5, Math.min(2.0, (acc.size as number) || 1.0)),
      rotation: 0,
      color: (acc.color as string) || '#ffd700',
      visible: (acc.visible as boolean) !== false
    })),
    createdAt: new Date()
  };
};

export default function AICreatePage() {
  const [currentStep, setCurrentStep] = useState<AIDesignStep>('model');
  const [aiSelections, setAiSelections] = useState<AISelections>(createDefaultAISelections());
  const [fishDesign, setFishDesign] = useState<FishDesign>(createDefaultFishDesign());
  const [generationStatus, setGenerationStatus] = useState<AIGenerationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [fishName, setFishName] = useState<string>('AI生成金魚');
  const [customText, setCustomText] = useState<string>('');
  const fishPreviewRef = useRef<FishPreviewRef>(null);

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
      let result: AIGenerationResult;
      
      if (aiSelections.model === 'gemini') {
        // Gemini JSON生成モード（Canvas描画用）
        const { system, user } = buildAIPrompt(aiSelections);
        
        result = await generateWithGemini(system, user, {
          model: aiSelections.model,
          temperature: 0.8,
          maxTokens: 2048
        });

        if (result.success && result.data) {
          if (validateAIResponse(result.data)) {
            const newDesign = convertAIResponseToFishDesign(result.data);
            setFishDesign(newDesign);
            setGenerationStatus('success');
          } else {
            throw new Error('AI応答の形式が不正です');
          }
        } else {
          throw new Error(result.error || 'AI生成に失敗しました');
        }
      } else {
        // ChatGPT JSON生成モード
        const { system, user } = buildAIPrompt(aiSelections);
        
        result = await generateWithChatGPT(system, user, {
          model: aiSelections.model,
          temperature: 0.8,
          maxTokens: 2048
        });

        if (result.success && result.data) {
          if (validateAIResponse(result.data)) {
            const newDesign = convertAIResponseToFishDesign(result.data);
            setFishDesign(newDesign);
            setGenerationStatus('success');
          } else {
            throw new Error('AI応答の形式が不正です');
          }
        } else {
          throw new Error(result.error || 'AI生成に失敗しました');
        }
      }
    } catch (error) {
      console.error('AI generation error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'AI生成中にエラーが発生しました');
      setGenerationStatus('error');
    }
  };

  const handleSave = () => {
    if (fishPreviewRef.current) {
      fishPreviewRef.current.exportAsImage(fishName.replace(/\s+/g, '-').toLowerCase() || 'ai-generated-fish');
    }
  };

  const handleReset = () => {
    setCurrentStep('model');
    setAiSelections(createDefaultAISelections());
    setFishDesign(createDefaultFishDesign());
    setFishName('AI生成金魚');
    setCustomText('');
    setGenerationStatus('idle');
    setErrorMessage('');
  };

  const handleNameChange = (newName: string) => {
    setFishName(newName);
    if (generationStatus === 'success') {
      setFishDesign(prev => ({ ...prev, name: newName }));
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
          <h1 className="ai-page-title">
            <span className="ai-title-icon">🤖</span>
            AI金魚クリエイター
          </h1>
          <p className="ai-page-description">
            5つのステップでAIが美しい金魚を生成します
          </p>
        </header>

        <main className="ai-fish-designer">
          <div className="ai-fish-preview-section">
            <div className="ai-fish-preview-area">
              <FishPreview
                ref={fishPreviewRef}
                fishDesign={fishDesign}
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