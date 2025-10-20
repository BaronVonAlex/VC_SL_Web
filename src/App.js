import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import SearchPage from './components/SearchPage';
import Leaderboard from './components/Leaderboard';
import PlayerComparison from './components/PlayerComparison';
import './App.css';

const Navigation = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="main-nav">
      <div className="nav-container">
        <Link to="/" className={`nav-link ${isActive('/')}`}>
          Player Search
        </Link>
        <Link to="/leaderboard" className={`nav-link ${isActive('/leaderboard')}`}>
          Leaderboard
        </Link>
        <Link to="/comparison" className={`nav-link ${isActive('/comparison')}`}>
          Compare Players
        </Link>
      </div>
    </nav>
  );
};

const App = () => {
  return (
    <Router>
      <div className="App">
        <Navigation />
        
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/comparison" element={<PlayerComparison />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;