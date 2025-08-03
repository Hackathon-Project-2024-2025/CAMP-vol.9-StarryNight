import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* <div className="footer-section">
            <h3 className="footer-title">フッターエリア</h3>
            <p className="footer-description">
              フッターコンテンツ
            </p>
          </div> */}
          <div className="footer-section">
            {/* <h4 className="footer-subtitle">リンク</h4> */}
            <ul className="nav-list">
            <li className="nav-item">
              <Link to="/" className="nav-link">ホーム</Link>
            </li>
            <li className="nav-item">
              <Link to="/create" className="nav-link">作成</Link>
            </li>
            <li className="nav-item">
              <Link to="/ai-create" className="nav-link">AI作成</Link>
            </li>
            <li className="nav-item">
              <Link to="/panel" className="nav-link">パネル</Link>
            </li>
          </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {currentYear} Uo/Code. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}