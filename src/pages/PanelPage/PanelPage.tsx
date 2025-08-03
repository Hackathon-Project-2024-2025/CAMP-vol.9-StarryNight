import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import Aquarium from './_components/Aquarium';
import FishList from './_components/FishList';
import { getAllAquariumData } from '../../services/storage/localStorage';
import type { FishDesign } from '../../types/common.types';
import type { AIFishImage } from '../../services/storage/localStorage';
import './PanelPage.css';

export default function PanelPage() {
  const [fishList, setFishList] = useState<FishDesign[]>([]);
  const [aiFishImages, setAiFishImages] = useState<AIFishImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // 水槽データを読み込み（JSON魚と画像魚の両方）
  const loadAquariumData = () => {
    try {
      const { jsonFish, aiFishImages } = getAllAquariumData();
      setFishList(jsonFish);
      setAiFishImages(aiFishImages);
    } catch (error) {
      console.error('Failed to load aquarium data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // JSON金魚削除時の処理
  const handleFishRemove = (fishId: string) => {
    setFishList(prev => prev.filter(fish => fish.id !== fishId));
  };

  // AI画像金魚削除時の処理
  const handleAIFishRemove = (imageId: string) => {
    setAiFishImages(prev => prev.filter(img => img.id !== imageId));
  };

  // CreatePageに移動
  const goToCreatePage = () => {
    navigate('/create');
  };

  // AI CreatePageに移動  
  const goToAICreatePage = () => {
    navigate('/ai-create');
  };

  // コンポーネント初期化時と画面に戻った時に水槽データを再読み込み
  useEffect(() => {
    loadAquariumData();
    
    // ページに戻った時の自動更新
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadAquariumData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <div className="panel-page">
          <div className="loading-container">
            <div className="loading-spinner">🐠</div>
            <p className="loading-text">水槽を準備中...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="panel-page">
        <header className="page-header">
          {/* <h1 className="page-title">🐠 みんなの金魚水槽</h1> */}
          <p className="page-description">
            作成した金魚たちが泳ぐ共有水槽です
          </p>
          <div className="header-actions">
            <button 
              className="create-fish-button"
              onClick={goToCreatePage}
            >
              <span className="button-icon">🎨</span>
              <span className="button-text">手作り金魚</span>
            </button>
            <button 
              className="create-fish-button ai-create-button"
              onClick={goToAICreatePage}
            >
              <span className="button-icon">🤖</span>
              <span className="button-text">AI金魚生成</span>
            </button>
          </div>
        </header>
        
        <main className="page-content">
          <div className="aquarium-layout">
            <aside className="fish-list-sidebar">
              <FishList 
                fishList={fishList}
                aiFishImages={aiFishImages}
                onFishRemove={handleFishRemove}
                onAIFishRemove={handleAIFishRemove}
              />
            </aside>
            
            <main className="aquarium-main">
              <Aquarium 
                fishList={fishList}
                aiFishImages={aiFishImages}
                className="main-aquarium"
              />
            </main>
          </div>
        </main>
      </div>
    </Layout>
  );
}