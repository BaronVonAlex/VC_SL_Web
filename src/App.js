import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import SearchPage from './components/SearchPage';
import Leaderboard from './components/Leaderboard';
import PlayerComparison from './components/PlayerComparison';
import Favorites from './components/Favorites';
import { FavoritesProvider } from './components/FavoriteContext.jsx';
import { FaSearch, FaTrophy, FaExchangeAlt, FaStar } from 'react-icons/fa';
import './App.css';

const Navigation = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navLinks = [
    { path: '/', label: 'Player Search', icon: <FaSearch /> },
    { path: '/leaderboard', label: 'Leaderboard', icon: <FaTrophy /> },
    { path: '/comparison', label: 'Compare Players', icon: <FaExchangeAlt /> },
    { path: '/favorites', label: 'Favorites', icon: <FaStar /> }
  ];

  return (
    <>
      <nav className="main-nav">
        <div className="nav-container">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${isActive(link.path)}`}
            >
              {link.label}
            </Link>
          ))}

          <div className="burger-menu-container">
            <button
              className={`burger-button ${mobileMenuOpen ? 'active' : ''}`}
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              <span className="burger-line"></span>
              <span className="burger-line"></span>
              <span className="burger-line"></span>
            </button>
          </div>
        </div>
      </nav>

      <div
        className={`mobile-nav-overlay ${mobileMenuOpen ? 'open' : ''}`}
        onClick={closeMobileMenu}
      ></div>

      <div className={`mobile-nav-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-links">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`mobile-nav-link ${isActive(link.path)}`}
              onClick={closeMobileMenu}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </div>
        
        <div className="mobile-nav-divider"></div>
        
        <div className="mobile-nav-footer">
          Vega Conflict Player Stats
        </div>
      </div>
    </>
  );
};

const App = () => {
  return (
    <FavoritesProvider>
      <Router>
        <div className="App">
          <Navigation />
          
          <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/comparison" element={<PlayerComparison />} />
            <Route path="/favorites" element={<Favorites />} />
          </Routes>
        </div>
      </Router>
    </FavoritesProvider>
  );
};

export default App;