import Layout from '../../components/Layout/Layout';
import './PanelPage.css';

export default function PanelPage() {
  return (
    <Layout>
      <div className="panel-page">
        <header className="page-header">
          <h1 className="page-title">パネルページ</h1>
          <p className="page-description">パネル機能のページです</p>
        </header>
        
        <main className="page-content">
          <div className="container">
            <div className="panel-layout">
              <aside className="panel-sidebar">
                <h2>パネル一覧</h2>
                <div className="panel-items">
                  <div className="panel-item panel-item-1">パネル 1</div>
                  <div className="panel-item panel-item-2">パネル 2</div>
                  <div className="panel-item panel-item-3">パネル 3</div>
                  <div className="panel-item panel-item-4">パネル 4</div>
                </div>
              </aside>
              
              <main className="panel-workspace">
                <h2>ワークスペース</h2>
                <div className="workspace-area">
                  <p>パネルをドラッグ&ドロップしてレイアウトを作成</p>
                </div>
              </main>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}