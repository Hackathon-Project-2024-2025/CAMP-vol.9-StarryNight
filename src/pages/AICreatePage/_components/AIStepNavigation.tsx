import type { AIDesignStep } from '../../../types/ai.types';
import './AIStepNavigation.css';

interface AIStepNavigationProps {
  currentStep: AIDesignStep;
  onStepChange: (step: AIDesignStep) => void;
  canGoNext?: boolean;
  canGoPrev?: boolean;
}

interface AIStepInfo {
  key: AIDesignStep;
  title: string;
  icon: string;
  description: string;
}

const AI_STEPS: AIStepInfo[] = [
  {
    key: 'model',
    title: 'AIモデル',
    icon: '🤖',
    description: 'ChatGPT/Gemini選択'
  },
  {
    key: 'basic',
    title: '基本設定',
    icon: '🐟',
    description: '体型・色・性格を設定'
  },
  {
    key: 'details',
    title: '詳細設定',
    icon: '✨',
    description: 'ヒレ・目・模様を選択'
  },
  {
    key: 'accessory',
    title: 'アクセサリー',
    icon: '👑',
    description: '装飾品を追加'
  },
  {
    key: 'generate',
    title: 'AI生成',
    icon: '🎨',
    description: 'カスタム要望で生成'
  }
];

export default function AIStepNavigation({ 
  currentStep, 
  onStepChange, 
  canGoNext = true, 
  canGoPrev = true 
}: AIStepNavigationProps) {
  
  const getCurrentStepIndex = () => {
    return AI_STEPS.findIndex(step => step.key === currentStep);
  };

  const handleStepClick = (step: AIDesignStep) => {
    onStepChange(step);
  };

  const handlePrevious = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0 && canGoPrev) {
      onStepChange(AI_STEPS[currentIndex - 1].key);
    }
  };

  const handleNext = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < AI_STEPS.length - 1 && canGoNext) {
      onStepChange(AI_STEPS[currentIndex + 1].key);
    }
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="ai-step-navigation">
      {/* ステップインジケーター */}
      <div className="ai-step-indicator">
        {AI_STEPS.map((step, index) => (
          <div
            key={step.key}
            className={`ai-step-item ${currentStep === step.key ? 'active' : ''} ${
              index < currentStepIndex ? 'completed' : ''
            }`}
            onClick={() => handleStepClick(step.key)}
          >
            <div className="ai-step-icon">{step.icon}</div>
            <div className="ai-step-info">
              <div className="ai-step-title">{step.title}</div>
              <div className="ai-step-description">{step.description}</div>
            </div>
            
            {index < AI_STEPS.length - 1 && (
              <div className={`ai-step-connector ${index < currentStepIndex ? 'completed' : ''}`} />
            )}
          </div>
        ))}
      </div>

      {/* ナビゲーションコントロール */}
      <div className="ai-step-controls">
        <button
          className="ai-step-button ai-step-button-prev"
          onClick={handlePrevious}
          disabled={currentStepIndex === 0 || !canGoPrev}
        >
          ← 前へ
        </button>
        
        <div className="ai-step-counter">
          {currentStepIndex + 1} / {AI_STEPS.length}
        </div>
        
        <button
          className="ai-step-button ai-step-button-next"
          onClick={handleNext}
          disabled={currentStepIndex === AI_STEPS.length - 1 || !canGoNext}
        >
          次へ →
        </button>
      </div>
    </div>
  );
}