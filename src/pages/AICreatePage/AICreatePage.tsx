import { useState, useRef } from 'react';
import Layout from '../../components/Layout/Layout';
import FishPreview from '../CreatePage/_components/FishPreview';
import AIModelSelector from './_components/AIModelSelector';
import AIFeatureSelector from './_components/AIFeatureSelector';
import AITextInput from './_components/AITextInput';
import AIGenerateButton from './_components/AIGenerateButton';
import AIStatusIndicator from './_components/AIStatusIndicator';
import AIActionButtons from './_components/AIActionButtons';
import type { FishDesign } from '../../types/common.types';
import type { FishPreviewRef } from '../CreatePage/_components/FishPreview';
import type { AISelections, AIGenerationStatus } from '../../types/ai.types';
import { buildAIPrompt, validateAIResponse, type AIResponse } from '../../services/ai/aiPromptBuilder';
import { generateWithGemini } from '../../services/ai/geminiService';
import { generateWithChatGPT } from '../../services/ai/chatgptService';
import './AICreatePage.css';

// デフォルトのAI選択設定
const createDefaultAISelections = (): AISelections => ({
  model: 'gemini',
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

// デフォルトの魚デザインを生成（プレビュー用初期値）
const createDefaultFishDesign = (): FishDesign => ({
  id: `ai-fish-${Date.now()}`,
  name: 'AI生成金魚',
  base: {
    id: 'base-round',
    name: '丸型',
    shape: 'round',
    defaultColor: '#ff6b6b',
    size: { width: 100, height: 60 },
    description: 'AI生成による丸型金魚'
  },
  parts: {
    dorsalFin: {
      id: 'dorsal-basic',
      name: '基本背ビレ',
      category: 'dorsalFin',
      thumbnail: '',
      description: 'AI生成背ビレ',
      renderData: { shape: 'triangular', size: 1.0 }
    },
    pectoralFins: {
      id: 'pectoral-basic',
      name: '基本胸ビレ',
      category: 'pectoralFins',
      thumbnail: '',
      description: 'AI生成胸ビレ',
      renderData: { shape: 'oval', size: 1.0 }
    },
    tailFin: {
      id: 'tail-fan',
      name: '扇型尾ビレ',
      category: 'tailFin',
      thumbnail: '',
      description: 'AI生成尾ビレ',
      renderData: { shape: 'fan', size: 1.0 }
    },
    eyes: {
      id: 'eyes-round',
      name: '丸い目',
      category: 'eyes',
      thumbnail: '',
      description: 'AI生成の目',
      renderData: { shape: 'circle', size: 1.0 }
    },
    mouth: {
      id: 'mouth-small',
      name: '小さい口',
      category: 'mouth',
      thumbnail: '',
      description: 'AI生成の口',
      renderData: { shape: 'small', size: 1.0 }
    },
    scales: {
      id: 'scales-basic',
      name: '基本ウロコ',
      category: 'scales',
      thumbnail: '',
      description: 'AI生成ウロコ',
      renderData: { shape: 'basic', size: 1.0 }
    }
  },
  customizations: {
    bodyColor: '#ff6b6b',
    finColor: '#ff9999',
    eyeColor: '#000000',
    size: 1.0,
    finSize: 1.0,
    eyeSize: 1.0,
    eyePosition: { x: -0.1, y: -0.25 },
    mouthPosition: { x: 0.0, y: 0.3 },
    dorsalFinPosition: { x: 0.0, y: 0.0 },
    tailFinPosition: { x: 0.0, y: 0.0 },
    pectoralFinPosition: { x: 0.0, y: 0.0 }
  },
  bodyPattern: undefined,
  accessories: [],
  createdAt: new Date()
});

// AI応答をFishDesignオブジェクトに変換するヘルパー関数
const convertAIResponseToFishDesign = (aiResponse: AIResponse): FishDesign => {
  const baseDesign = createDefaultFishDesign();
  
  return {
    ...baseDesign,
    id: `ai-fish-${Date.now()}`,
    name: aiResponse.name || 'AI生成金魚',
    customizations: {
      ...baseDesign.customizations,
      bodyColor: aiResponse.bodyColor || baseDesign.customizations.bodyColor,
      finColor: aiResponse.finColor || baseDesign.customizations.finColor,
      eyeColor: aiResponse.eyeColor || baseDesign.customizations.eyeColor,
      size: Math.max(0.5, Math.min(2.0, aiResponse.size || 1.0)),
      finSize: Math.max(0.5, Math.min(2.0, aiResponse.finSize || 1.0)),
      eyeSize: Math.max(0.5, Math.min(2.0, aiResponse.eyeSize || 1.0))
    },
    bodyPattern: aiResponse.bodyPattern ? {
      id: `pattern-${Date.now()}`,
      name: aiResponse.bodyPattern.type || 'AI生成パターン',
      type: (aiResponse.bodyPattern.type as 'solid' | 'spotted' | 'striped' | 'polka' | 'calico' | 'gradient') || 'solid',
      description: 'AI生成による体の模様',
      colors: aiResponse.bodyPattern.colors || [aiResponse.bodyColor],
      intensity: Math.max(0.1, Math.min(1.0, aiResponse.bodyPattern.intensity || 0.6)),
      scale: Math.max(0.5, Math.min(2.0, aiResponse.bodyPattern.scale || 1.0)),
      seed: Math.floor(Math.random() * 100000)
    } : undefined,
    accessories: aiResponse.accessories?.map((acc, index) => ({
      id: acc.id || `ai-accessory-${index}`,
      name: acc.category || 'AI装飾',
      category: (acc.category as 'crown' | 'hat' | 'glasses' | 'ribbon' | 'bow' | 'jewelry') || 'hat',
      description: 'AI生成アクセサリー',
      position: {
        x: Math.max(-1, Math.min(1, acc.position?.x || 0)),
        y: Math.max(-1, Math.min(1, acc.position?.y || 0))
      },
      size: Math.max(0.5, Math.min(2.0, acc.size || 1.0)),
      rotation: 0,
      color: acc.color || '#ffd700',
      visible: acc.visible !== false
    })) || [],
    createdAt: new Date()
  };
};

export default function AICreatePage() {
  const [aiSelections, setAiSelections] = useState<AISelections>(createDefaultAISelections());
  const [fishDesign, setFishDesign] = useState<FishDesign>(createDefaultFishDesign());
  const [generationStatus, setGenerationStatus] = useState<AIGenerationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const fishPreviewRef = useRef<FishPreviewRef>(null);

  const handleSelectionsChange = (newSelections: Partial<AISelections>) => {
    setAiSelections(prev => ({ ...prev, ...newSelections }));
  };

  const handleGenerate = async () => {
    setGenerationStatus('generating');
    setErrorMessage('');
    
    try {
      // AIプロンプトの構築
      const { system, user } = buildAIPrompt(aiSelections);
      
      // AIモデルに応じた生成サービスの選択
      const generateFunction = aiSelections.model === 'gemini' ? generateWithGemini : generateWithChatGPT;
      
      // AI生成の実行
      const result = await generateFunction(system, user, {
        model: aiSelections.model,
        temperature: 0.8,
        maxTokens: 2048
      });
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'AI生成に失敗しました');
      }
      
      // AI応答の検証
      if (!validateAIResponse(result.data)) {
        throw new Error('AI応答の形式が正しくありません');
      }
      
      const aiResponse = result.data as AIResponse;
      
      // AI応答をFishDesignオブジェクトに変換
      const newDesign = convertAIResponseToFishDesign(aiResponse);
      
      setFishDesign(newDesign);
      setGenerationStatus('success');
      
    } catch (error) {
      console.error('AI generation error:', error);
      const errorMsg = error instanceof Error ? error.message : 'AI生成中に不明なエラーが発生しました。';
      setErrorMessage(errorMsg);
      setGenerationStatus('error');
    }
  };

  const handleSave = () => {
    if (fishPreviewRef.current) {
      fishPreviewRef.current.exportAsImage();
    }
  };

  const handleReset = () => {
    setAiSelections(createDefaultAISelections());
    setFishDesign(createDefaultFishDesign());
    setGenerationStatus('idle');
    setErrorMessage('');
  };

  const handleNameChange = (name: string) => {
    setFishDesign(prev => ({ ...prev, name }));
  };

  return (
    <Layout>
      <div className="ai-create-page">
        <header className="page-header">
          <h1 className="page-title">🤖 AI金魚デザイナー</h1>
          <p className="page-description">
            AIの力であなただけのオリジナル金魚を作りましょう
          </p>
        </header>
        
        <main className="ai-fish-designer">
          <div className="ai-controls-section">
            <div className="ai-controls-container">
              <AIModelSelector
                selectedModel={aiSelections.model}
                onModelChange={(model) => handleSelectionsChange({ model })}
              />
              
              <AIFeatureSelector
                selections={aiSelections}
                onSelectionsChange={handleSelectionsChange}
              />
              
              <AITextInput
                value={aiSelections.customText || ''}
                onChange={(customText) => handleSelectionsChange({ customText })}
              />
              
              <AIGenerateButton
                onGenerate={handleGenerate}
                isGenerating={generationStatus === 'generating'}
                disabled={generationStatus === 'generating'}
              />
              
              <AIStatusIndicator
                status={generationStatus}
                errorMessage={errorMessage}
              />
            </div>
          </div>
          
          <div className="ai-preview-section">
            <FishPreview 
              ref={fishPreviewRef}
              fishDesign={fishDesign}
              className="ai-fish-preview"
            />
          </div>
          
          <div className="ai-action-section">
            <AIActionButtons
              onSave={handleSave}
              onReset={handleReset}
              fishName={fishDesign.name}
              onNameChange={handleNameChange}
              disabled={generationStatus === 'generating'}
            />
          </div>
        </main>
      </div>
    </Layout>
  );
}