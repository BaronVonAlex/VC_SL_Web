import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import SearchPage from './components/SearchPage';
import Leaderboard from './components/Leaderboard';
import './App.css';

const App = () => {
  return (
    <Router>
      <div className="App">
        <nav className="main-nav">
          <div className="nav-container">
            <Link to="/" className="nav-link">
              Player Search
            </Link>
            <Link to="/leaderboard" className="nav-link">
              Leaderboard
            </Link>
          </div>
        </nav>
        
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;