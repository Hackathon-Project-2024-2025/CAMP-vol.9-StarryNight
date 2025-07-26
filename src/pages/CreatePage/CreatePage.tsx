import { useState } from 'react';
import Layout from '../../components/Layout/Layout';
import FishPreview from './_components/FishPreview';
import DesignControls from './_components/DesignControls';
import ActionButtons from './_components/ActionButtons';
import type { FishDesign, FishBase, SelectedParts, FishCustomizations, DesignStep } from '../../types/common.types';
import './CreatePage.css';

// デフォルトの魚デザイン
const createDefaultFishDesign = (): FishDesign => {
  const defaultBase: FishBase = {
    id: 'base-round',
    name: '丸型',
    shape: 'round',
    defaultColor: '#ff6b6b',
    size: { width: 100, height: 60 },
    description: '丸みを帯びた可愛らしい体型'
  };

  const defaultParts: SelectedParts = {
    dorsalFin: {
      id: 'dorsal-basic',
      name: '基本背ビレ',
      category: 'dorsalFin',
      thumbnail: '',
      description: '標準的な背ビレ',
      renderData: { shape: 'triangular', size: 1.0 }
    },
    pectoralFins: {
      id: 'pectoral-basic',
      name: '基本胸ビレ',
      category: 'pectoralFins',
      thumbnail: '',
      description: '標準的な胸ビレ',
      renderData: { shape: 'oval', size: 1.0 }
    },
    tailFin: {
      id: 'tail-fan',
      name: '扇型尾ビレ',
      category: 'tailFin',
      thumbnail: '',
      description: '扇のような形の尾ビレ',
      renderData: { shape: 'fan', size: 1.0 }
    },
    eyes: {
      id: 'eyes-round',
      name: '丸い目',
      category: 'eyes',
      thumbnail: '',
      description: '丸くて可愛い目',
      renderData: { shape: 'circle', size: 1.0 }
    },
    mouth: {
      id: 'mouth-small',
      name: '小さい口',
      category: 'mouth',
      thumbnail: '',
      description: '小さくて上品な口',
      renderData: { shape: 'small', size: 1.0 }
    },
    scales: {
      id: 'scales-basic',
      name: '基本ウロコ',
      category: 'scales',
      thumbnail: '',
      description: '標準的なウロコ模様',
      renderData: { shape: 'basic', size: 1.0 }
    }
  };

  const defaultCustomizations: FishCustomizations = {
    bodyColor: '#ff6b6b',
    finColor: '#ff9999',
    eyeColor: '#000000',
    size: 1.0,
    finSize: 1.0,
    eyeSize: 1.0,
    eyePosition: { x: 0.3, y: 0.3 },
    mouthPosition: { x: 0.15, y: 0.5 }
  };

  return {
    id: `fish-${Date.now()}`,
    name: 'マイ金魚',
    base: defaultBase,
    parts: defaultParts,
    customizations: defaultCustomizations,
    createdAt: new Date()
  };
};

export default function CreatePage() {
  const [fishDesign, setFishDesign] = useState<FishDesign>(createDefaultFishDesign());
  const [currentStep, setCurrentStep] = useState<DesignStep>('base');

  const handleFishDesignChange = (newDesign: FishDesign) => {
    setFishDesign(newDesign);
  };

  const handleStepChange = (step: DesignStep) => {
    setCurrentStep(step);
  };

  const handleSave = () => {
    // TODO: 魚デザインを保存する処理
    console.log('魚デザインを保存:', fishDesign);
    alert('魚デザインを保存しました！');
  };

  const handleReset = () => {
    setFishDesign(createDefaultFishDesign());
    setCurrentStep('base');
  };

  return (
    <Layout>
      <div className="create-page">
        <header className="page-header">
          <h1 className="page-title">🐠 魚デザイナー</h1>
          <p className="page-description">あなただけのオリジナル金魚を作りましょう</p>
        </header>
        
        <main className="fish-designer">
          <div className="fish-preview-section">
            <FishPreview 
              fishDesign={fishDesign}
              className="main-preview"
            />
          </div>
          
          <div className="design-controls-section">
            <DesignControls
              currentStep={currentStep}
              onStepChange={handleStepChange}
              fishDesign={fishDesign}
              onDesignChange={handleFishDesignChange}
            />
          </div>
          
          <div className="action-buttons-section">
            <ActionButtons
              onSave={handleSave}
              onReset={handleReset}
              fishName={fishDesign.name}
              onNameChange={(name) => setFishDesign(prev => ({ ...prev, name }))}
            />
          </div>
        </main>
      </div>
    </Layout>
  );
}
