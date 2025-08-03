import { Link } from 'react-router-dom';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function Header({ isDarkMode, onToggleDarkMode }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo">
          <Link to="/" className="logo-text">Uo/Code</Link>
        </div>
        <nav className="header-nav">
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
          <button 
            className="dark-mode-toggle" 
            onClick={onToggleDarkMode}
            aria-label="ダークモード切り替え"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </nav>
      </div>
    </header>
  );
}