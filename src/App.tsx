import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import CreatePage from './pages/CreatePage/CreatePage';
import AICreatePage from './pages/AICreatePage/AICreatePage';
import PanelPage from './pages/PanelPage/PanelPage';
import './styles/global.css';

function App() {
  return (
    <div className="app">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/ai-create" element={<AICreatePage />} />
          <Route path="/panel" element={<PanelPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;