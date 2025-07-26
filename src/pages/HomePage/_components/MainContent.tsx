import './MainContent.css';

export default function MainContent() {
  return (
    <section className="main-content">
      <div className="container">
        <h2 className="main-content-title">メインコンテンツ</h2>
        <div className="content-grid">
          <div className="content-block content-block-1">
            <h3>コンテンツ 1</h3>
          </div>
          <div className="content-block content-block-2">
            <h3>コンテンツ 2</h3>
          </div>
          <div className="content-block content-block-3">
            <h3>コンテンツ 3</h3>
          </div>
          <div className="content-block content-block-4">
            <h3>コンテンツ 4</h3>
          </div>
        </div>
      </div>
    </section>
  );
}