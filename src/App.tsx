import { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { FavoritesProvider } from './components/FavoriteContext.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { FaSearch, FaTrophy, FaExchangeAlt, FaStar } from 'react-icons/fa';
import './App.css';

// Eager-load the primary page — it's always needed on first visit
import SearchPage from './components/SearchPage';

// Lazy-load secondary pages — only fetched when navigated to
const Leaderboard = lazy(() => import('./components/Leaderboard'));
const PlayerComparison = lazy(() => import('./components/PlayerComparison'));
const Favorites = lazy(() => import('./components/Favorites'));

const PageLoader = () => (
  <div className="page-loader">
    <div className="page-loader-spinner" />
  </div>
);

const Navigation = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path ? 'active' : '';
  const closeMobileMenu = () => setMobileMenuOpen(false);
  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);

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
              aria-expanded={mobileMenuOpen}
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
      />

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

          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<SearchPage />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/comparison" element={<PlayerComparison />} />
                <Route path="/favorites" element={<Favorites />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </div>
      </Router>
    </FavoritesProvider>
  );
};

export default App;
