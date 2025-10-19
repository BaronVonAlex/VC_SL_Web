import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SearchPage from './components/SearchPage';
import Leaderboard from './components/Leaderboard';
import './App.css';

const App = () => {
  const handlePlayerClick = (playerId) => {
    // this shit is broken kekw
    window.location.href = `/?playerId=${playerId}`;
  };

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
          <Route 
            path="/leaderboard" 
            element={<Leaderboard onPlayerClick={handlePlayerClick} />} 
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;