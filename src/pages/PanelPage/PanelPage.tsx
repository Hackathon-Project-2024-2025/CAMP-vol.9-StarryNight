import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import Aquarium from './_components/Aquarium';
import FishList from './_components/FishList';
import { getAquariumFish } from '../../services/storage/localStorage';
import type { FishDesign } from '../../types/common.types';
import './PanelPage.css';

export default function PanelPage() {
  const [fishList, setFishList] = useState<FishDesign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // 金魚データを読み込み
  const loadFishList = () => {
    try {
      const fish = getAquariumFish();
      setFishList(fish);
    } catch (error) {
      console.error('Failed to load fish list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 金魚削除時の処理
  const handleFishRemove = (fishId: string) => {
    setFishList(prev => prev.filter(fish => fish.id !== fishId));
  };

  // CreatePageに移動
  const goToCreatePage = () => {
    navigate('/create');
  };

  // コンポーネント初期化時と画面に戻った時に金魚を再読み込み
  useEffect(() => {
    loadFishList();
    
    // ページに戻った時の自動更新
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadFishList();
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
              <span className="button-icon">➕</span>
              <span className="button-text">新しい金魚を作る</span>
            </button>
          </div>
        </header>
        
        <main className="page-content">
          <div className="aquarium-layout">
            <aside className="fish-list-sidebar">
              <FishList 
                fishList={fishList}
                onFishRemove={handleFishRemove}
              />
            </aside>
            
            <main className="aquarium-main">
              <Aquarium 
                fishList={fishList}
                className="main-aquarium"
              />
            </main>
          </div>
        </main>
      </div>
    </Layout>
  );
}