import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import '../styles/SearchBar.css';

const SearchBar = ({ onSearch, hasResults }) => {
  const [playerID, setPlayerID] = useState('');
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = () => {
    setError('');

    if (!playerID.trim()) {
      setError('Please enter a Player ID');
      return;
    }

    onSearch(playerID);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={`search-container ${hasResults ? 'compact' : 'centered'}`}>
      {!hasResults && (
        <div className="search-header">
          <h1 className="search-title">VC_SL Player Stats</h1>
          <p className="search-subtitle">Search for player statistics and battle history</p>
        </div>
      )}
      
      <div className={`search-bar-wrapper ${isFocused ? 'focused' : ''}`}>
        <div className="search-input-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Enter Player ID"
            value={playerID}
            onChange={(e) => {
              setPlayerID(e.target.value);
              setError('');
            }}
            onKeyDown={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="search-input-modern"
          />
          <button 
            onClick={handleSearch} 
            className="search-button-modern"
            aria-label="Search"
          >
            Search
          </button>
        </div>
        
        {error && (
          <div className="error-message-modern">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;