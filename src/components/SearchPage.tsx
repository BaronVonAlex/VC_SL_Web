import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FaHome, FaSearch } from 'react-icons/fa';
import SearchBar from './SearchBar';
import PlayerCard from './PlayerCard';
import { fetchPlayerDetails, getWinrateForUser } from '../services/api';
import { PlayerCardSkeleton } from './Skeleton';
import type { PlayerDetails, WinrateEntry } from '../types';

const SearchPage = () => {
  const location = useLocation();
  const [currentPlayerID, setCurrentPlayerID] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  useEffect(() => {
    if (location.state?.searchPlayerId) {
      setCurrentPlayerID(String(location.state.searchPlayerId));
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const { data: playerDetails, isLoading, isError, error } = useQuery<PlayerDetails>({
    queryKey: ['playerDetails', currentPlayerID],
    queryFn: ({ signal }) => fetchPlayerDetails(currentPlayerID!, undefined, signal),
    enabled: !!currentPlayerID,
  });

  const { data: historicalStats = [] } = useQuery<WinrateEntry[]>({
    queryKey: ['winrate', currentPlayerID, selectedYear],
    queryFn: ({ signal }) => getWinrateForUser(currentPlayerID!, selectedYear, signal),
    enabled: !!currentPlayerID,
  });

  const handleSearch = (playerID: string) => {
    setCurrentPlayerID(playerID);
    setSelectedYear(new Date().getFullYear());
    setShowMobileSearch(false);
  };

  const handleReset = () => {
    setCurrentPlayerID(null);
    setShowMobileSearch(false);
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  const toggleMobileSearch = () => {
    setShowMobileSearch(prev => !prev);
  };

  const showResults = !!currentPlayerID && !!playerDetails && !isLoading;
  const errorMessage = isError
    ? (error instanceof Error ? error.message : 'Failed to fetch player data. Please check the Player ID and try again.')
    : null;

  useEffect(() => {
    const floating = document.querySelector('.mobile-floating-actions') as HTMLElement | null;
    const nav = document.querySelector('.nav-container') as HTMLElement | null;
    if (!floating || !nav) return;

    const navHeight = nav.offsetHeight;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const newTop = Math.max(20, 70 - scrollY / 1);
      floating.style.top = `${newTop}px`;
      floating.style.zIndex = scrollY < navHeight ? '100' : '900';
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showResults]);

  const playerCardData = playerDetails
    ? { ...playerDetails.playerData, avatarUrl: playerDetails.avatarUrl }
    : null;

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
          <div className="mobile-search-overlay">
            <SearchBar
              onSearch={handleSearch}
              hasResults={false}
              onReset={() => setShowMobileSearch(false)}
            />
          </div>
        )}

        {isLoading && <PlayerCardSkeleton />}

        {errorMessage && (
          <div className="search-error">{errorMessage}</div>
        )}

        {!isLoading && playerCardData && (
          <PlayerCard
            playerData={playerCardData}
            historicalStats={historicalStats}
            usernameHistory={playerDetails?.usernameHistory ?? []}
            onYearChange={handleYearChange}
            currentYear={selectedYear}
          />
        )}
      </header>
    </div>
  );
};

export default SearchPage;
