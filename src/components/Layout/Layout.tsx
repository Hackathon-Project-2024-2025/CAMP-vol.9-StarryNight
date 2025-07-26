import { useState } from 'react';
import Header from './_components/Header';
import Footer from './_components/Footer';
import type { BaseComponentProps } from '../../types/common.types';
import './Layout.css';

interface LayoutProps extends BaseComponentProps {
  children?: React.ReactNode;
}

export default function Layout({ children, className }: LayoutProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute('data-theme', !isDarkMode ? 'dark' : 'light');
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