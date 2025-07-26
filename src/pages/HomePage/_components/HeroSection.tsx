import './HeroSection.css';

export default function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">ヒーローセクション</h1>
        <p className="hero-description">
          ここにヒーローコンテンツが入ります
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary">プライマリボタン</button>
          <button className="btn btn-secondary">セカンダリボタン</button>
        </div>
      </div>
    </section>
  );
}