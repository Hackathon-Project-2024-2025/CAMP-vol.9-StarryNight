import { useState, useEffect } from 'react';
import Header from './_components/Header';
import Footer from './_components/Footer';
import { getDarkMode, setDarkMode } from '../../services/storage/localStorage';
import type { BaseComponentProps } from '../../types/common.types';
import './Layout.css';

interface LayoutProps extends BaseComponentProps {
  children?: React.ReactNode;
}

export default function Layout({ children, className }: LayoutProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 初期ロード時に localStorage からテーマを復元
  useEffect(() => {
    const savedDarkMode = getDarkMode();
    setIsDarkMode(savedDarkMode);
    document.documentElement.setAttribute('data-theme', savedDarkMode ? 'dark' : 'light');
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    setDarkMode(newDarkMode); // localStorage に保存
    document.documentElement.setAttribute('data-theme', newDarkMode ? 'dark' : 'light');
  };

  return (
    <div className={`layout ${className || ''} ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <Header isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />
      <main className="layout-main">
        {children}
      </main>
      <Footer />
    </div>
  );
}