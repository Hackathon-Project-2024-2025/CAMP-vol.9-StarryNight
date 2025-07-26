import Layout from '../../components/Layout/Layout';
import HeroSection from './_components/HeroSection';
import MainContent from './_components/MainContent';
import './HomePage.css';

export default function HomePage() {
  return (
    <Layout>
      <div className="home-page">
        <HeroSection />
        <MainContent />
      </div>
    </Layout>
  );
}