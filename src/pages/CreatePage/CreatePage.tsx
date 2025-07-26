import Layout from '../../components/Layout/Layout';
import './CreatePage.css';

export default function CreatePage() {
  return (
    <Layout>
      <div className="create-page">
        <header className="page-header">
          <h1 className="page-title">作成ページ</h1>
          <p className="page-description">作成機能のページです</p>
        </header>
        
        <main className="page-content">
          <div className="container">
            <div className="create-sections">
              <section className="create-section create-section-1">
                <h2>セクション 1</h2>
                <p>アップロード機能エリア</p>
              </section>
              
              <section className="create-section create-section-2">
                <h2>セクション 2</h2>
                <p>編集機能エリア</p>
              </section>
              
              <section className="create-section create-section-3">
                <h2>セクション 3</h2>
                <p>プレビューエリア</p>
              </section>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}