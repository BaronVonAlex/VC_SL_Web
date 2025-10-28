import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FaHome, FaSearch } from 'react-icons/fa';
import SearchBar from './SearchBar';
import PlayerCard from './PlayerCard';
import { fetchPlayerDetails } from '../services/api';
import { getWinrateForUser } from '../services/api';

const SearchPage = () => {
  const location = useLocation();
  const [playerData, setPlayerData] = useState(null);
  const [historicalStats, setHistoricalStats] = useState(null);
  const [usernameHistory, setUsernameHistory] = useState(null);
  const [currentPlayerID, setCurrentPlayerID] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  useEffect(() => {
    if (location.state?.searchPlayerId) {
      const playerId = location.state.searchPlayerId;
      handleSearch(playerId);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSearch = async (playerID) => {
    setError('');
    setLoading(true);
    setCurrentPlayerID(playerID);

    try {
      const currentYear = new Date().getFullYear();
      setSelectedYear(currentYear);

      const { playerData, avatarUrl, historicalStats, usernameHistory } = await fetchPlayerDetails(
        playerID,
        currentYear
      );

      setPlayerData({ ...playerData, avatarUrl });
      setHistoricalStats(historicalStats);
      setUsernameHistory(usernameHistory);
      setShowResults(true);
      setShowMobileSearch(false);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to fetch player data. Please check the Player ID and try again.');
      setPlayerData(null);
      setHistoricalStats(null);
      setUsernameHistory(null);
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPlayerData(null);
    setHistoricalStats(null);
    setUsernameHistory(null);
    setCurrentPlayerID(null);
    setError('');
    setShowResults(false);
    setShowMobileSearch(false);
  };

  const handleYearChange = async (year) => {
    if (!currentPlayerID) return;

    setSelectedYear(year);

    try {
      const stats = await getWinrateForUser(currentPlayerID, year);
      setHistoricalStats(stats);
    } catch (err) {
      console.error('Error fetching historical data:', err);
      setHistoricalStats([]);
    }
  };

  const toggleMobileSearch = () => {
    setShowMobileSearch(!showMobileSearch);
  };

useEffect(() => {
  const floating = document.querySelector('.mobile-floating-actions');
  const nav = document.querySelector('.nav-container');
  if (!floating || !nav) return;

  const navHeight = nav.offsetHeight;

  const handleScroll = () => {
    const scrollY = window.scrollY;

    const newTop = Math.max(20, 70 - scrollY / 1);
    floating.style.top = `${newTop}px`;

    if (scrollY < navHeight) {
      floating.style.zIndex = '100';
    } else {
      floating.style.zIndex = '900';
    }
  };

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, [showResults]);

  return (
    <div className={`App ${showResults ? 'has-results' : ''}`}>
      <header className="App-header">
        <SearchBar
          onSearch={handleSearch}
          hasResults={showResults && !showMobileSearch}
          onReset={handleReset}
        />

        {showResults && (
          <div className="mobile-floating-actions">
            <button
              onClick={handleReset}
              className="floating-action-btn floating-home-btn"
              aria-label="Return to home"
            >
              <FaHome />
            </button>
            <button
              onClick={toggleMobileSearch}
              className="floating-action-btn floating-search-btn"
              aria-label="New search"
            >
              <FaSearch />
            </button>
          </div>
        )}

        {showMobileSearch && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              zIndex: 1100,
              padding: '2rem',
              overflowY: 'auto',
            }}
          >
            <SearchBar
              onSearch={handleSearch}
              hasResults={false}
              onReset={() => setShowMobileSearch(false)}
            />
          </div>
        )}

        {loading && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '3rem',
              padding: '2rem',
              backgroundColor: 'rgba(139, 92, 246, 0.15)',
              borderRadius: '1rem',
              border: '2px solid rgba(139, 92, 246, 0.4)',
              backdropFilter: 'blur(10px)',
              maxWidth: '400px',
              margin: '3rem auto',
            }}
          >
            <div
              style={{
                width: '50px',
                height: '50px',
                border: '4px solid rgba(139, 92, 246, 0.3)',
                borderTop: '4px solid #8b5cf6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '1rem',
              }}
            ></div>
            <div
              style={{
                color: '#ffffff',
                fontSize: '1.2rem',
                fontWeight: '600',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              }}
            >
              Loading player data...
            </div>
          </div>
        )}

        {error && (
          <div
            style={{
              color: '#ffffff',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              padding: '1rem 1.5rem',
              borderRadius: '0.75rem',
              marginTop: '1rem',
              border: '2px solid rgba(239, 68, 68, 0.5)',
              backdropFilter: 'blur(10px)',
              maxWidth: '500px',
              margin: '1rem auto',
              textAlign: 'center',
              fontWeight: '500',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
            }}
          >
            {error}
          </div>
        )}

        {!loading && playerData && (
          <PlayerCard
            playerData={playerData}
            historicalStats={historicalStats}
            usernameHistory={usernameHistory}
            onYearChange={handleYearChange}
            currentYear={selectedYear}
          />
        )}
      </header>
    </div>
  );
};

export default SearchPage;
