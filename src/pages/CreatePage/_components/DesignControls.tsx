import StepNavigation from './StepNavigation';
import BaseSelector from './BaseSelector';
import PartsSelector from './PartsSelector';
import CustomizationPanel from './CustomizationPanel';
import type { FishDesign, DesignStep, FishBase, FishPart } from '../../../types/common.types';
import './DesignControls.css';

interface DesignControlsProps {
  currentStep: DesignStep;
  onStepChange: (step: DesignStep) => void;
  fishDesign: FishDesign;
  onDesignChange: (design: FishDesign) => void;
}

export default function DesignControls({ 
  currentStep, 
  onStepChange, 
  fishDesign, 
  onDesignChange 
}: DesignControlsProps) {
  
  const handleBaseChange = (newBase: FishBase) => {
    const updatedDesign = {
      ...fishDesign,
      base: newBase,
      customizations: {
        ...fishDesign.customizations,
        bodyColor: newBase.defaultColor
      }
    };
    onDesignChange(updatedDesign);
  };

  const handlePartsChange = (category: string, newPart: FishPart) => {
    const updatedDesign = {
      ...fishDesign,
      parts: {
        ...fishDesign.parts,
        [category]: newPart
      }
    };
    onDesignChange(updatedDesign);
  };

  const handleCustomizationChange = (property: string, value: string | number | { x: number; y: number }) => {
    const updatedDesign = {
      ...fishDesign,
      customizations: {
        ...fishDesign.customizations,
        [property]: value
      }
    };
    onDesignChange(updatedDesign);
  };

  const renderCurrentStepContent = () => {
    switch (currentStep) {
      case 'base':
        return (
          <BaseSelector
            selectedBase={fishDesign.base}
            onBaseSelect={handleBaseChange}
          />
        );
      case 'parts':
        return (
          <PartsSelector
            selectedParts={fishDesign.parts}
            onPartSelect={handlePartsChange}
            fishDesign={fishDesign}
            onCustomize={handleCustomizationChange}
          />
        );
      case 'customize':
        return (
          <CustomizationPanel
            fishDesign={fishDesign}
            onCustomize={handleCustomizationChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="design-controls">
      <div className="controls-header">
        <h2 className="controls-title">🎨 デザイン設定</h2>
        <p className="controls-description">
          ステップに従って魚をカスタマイズしましょう
        </p>
      </div>

      <StepNavigation
        currentStep={currentStep}
        onStepChange={onStepChange}
      />

      <div className="step-content">
        {renderCurrentStepContent()}
      </div>
    </div>
  );
}