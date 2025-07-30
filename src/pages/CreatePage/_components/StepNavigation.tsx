import type { DesignStep } from '../../../types/common.types';
import './StepNavigation.css';

interface StepNavigationProps {
  currentStep: DesignStep;
  onStepChange: (step: DesignStep) => void;
}

interface StepInfo {
  key: DesignStep;
  title: string;
  icon: string;
  description: string;
}

const steps: StepInfo[] = [
  {
    key: 'base',
    title: 'ベース選択',
    icon: '🐟',
    description: '魚の基本体型を選択'
  },
  {
    key: 'parts',
    title: 'パーツ選択',
    icon: '✨',
    description: 'ヒレや目などのパーツを選択'
  },
  {
    key: 'pattern',
    title: '模様追加',
    icon: '🌈',
    description: '体の模様パターンを選択'
  },
  {
    key: 'accessory',
    title: 'アクセサリー',
    icon: '👑',
    description: 'アクセサリーまたはランダム生成'
  },
  {
    key: 'customize',
    title: '仕上げ',
    icon: '🎨',
    description: '色やサイズを調整'
  }
];

export default function StepNavigation({ currentStep, onStepChange }: StepNavigationProps) {
  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.key === currentStep);
  };

  const handleStepClick = (step: DesignStep) => {
    onStepChange(step);
  };

  const handlePrevious = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      onStepChange(steps[currentIndex - 1].key);
    }
  };

  const handleNext = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < steps.length - 1) {
      onStepChange(steps[currentIndex + 1].key);
    }
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="step-navigation">
      {/* ステップインジケーター */}
      <div className="step-indicator">
        {steps.map((step, index) => (
          <div
            key={step.key}
            className={`step-item ${currentStep === step.key ? 'active' : ''} ${
              index < currentStepIndex ? 'completed' : ''
            }`}
            onClick={() => handleStepClick(step.key)}
          >
            <div className="step-icon">{step.icon}</div>
            <div className="step-info">
              <div className="step-title">{step.title}</div>
              <div className="step-description">{step.description}</div>
            </div>
            
            {index < steps.length - 1 && (
              <div className={`step-connector ${index < currentStepIndex ? 'completed' : ''}`} />
            )}
          </div>
        ))}
      </div>

      {/* ナビゲーションボタン */}
      <div className="step-controls">
        <button
          className="step-button step-button-prev"
          onClick={handlePrevious}
          disabled={currentStepIndex === 0}
        >
          ← 前へ
        </button>
        
        <div className="step-counter">
          {currentStepIndex + 1} / {steps.length}
        </div>
        
        <button
          className="step-button step-button-next"
          onClick={handleNext}
          disabled={currentStepIndex === steps.length - 1}
        >
          次へ →
        </button>
      </div>
    </div>
  );
}