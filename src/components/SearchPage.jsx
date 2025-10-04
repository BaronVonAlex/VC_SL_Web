import React, { useState } from 'react';
import SearchBar from './SearchBar';
import PlayerCard from './PlayerCard';
import { fetchPlayerDetails } from '../services/api';
import '../styles/SearchPage.css';

const SearchPage = () => {
  const [playerData, setPlayerData] = useState(null);
  const [historicalStats, setHistoricalStats] = useState(null);
  const [usernameHistory, setUsernameHistory] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (playerID, year) => {
    setError('');
    setLoading(true);
    try {
      const { playerData, avatarUrl, historicalStats, usernameHistory } = await fetchPlayerDetails(
        playerID, 
        year || new Date().getFullYear()
      );
      
      setPlayerData({ ...playerData, avatarUrl });
      setHistoricalStats(historicalStats);
      setUsernameHistory(usernameHistory);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to fetch player data. Please check the Player ID and try again.');
      setPlayerData(null);
      setHistoricalStats(null);
      setUsernameHistory(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <SearchBar onSearch={handleSearch} />
        
        {loading && (
          <div style={{ 
            color: '#8b5cf6', 
            fontSize: '1.2rem', 
            marginTop: '2rem',
            fontWeight: '600'
          }}>
            Loading player data...
          </div>
        )}
        
        {error && (
          <div style={{ 
            color: '#ef4444', 
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginTop: '1rem',
            border: '1px solid #ef4444'
          }}>
            {error}
          </div>
        )}
        
        {!loading && playerData && (
          <PlayerCard
            playerData={playerData}
            historicalStats={historicalStats}
            usernameHistory={usernameHistory}
          />
        )}
      </header>
    </div>
  );
};

export default SearchPage;