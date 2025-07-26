export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">フッターエリア</h3>
            <p className="footer-description">
              フッターコンテンツ
            </p>
          </div>
          <div className="footer-section">
            <h4 className="footer-subtitle">リンク</h4>
            <p>リンク一覧</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {currentYear} Starry Night. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}