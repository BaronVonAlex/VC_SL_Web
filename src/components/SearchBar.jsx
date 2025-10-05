import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

const SearchBar = ({ onSearch }) => {
  const [playerID, setPlayerID] = useState('');
  const [error, setError] = useState('');

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
    <div style={{ marginBottom: '1rem' }}>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Enter Player ID"
          value={playerID}
          onChange={(e) => {
            setPlayerID(e.target.value);
            setError('');
          }}
          onKeyDown={handleKeyPress}
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">
          <FaSearch /> Search
        </button>
      </div>
      {error && (
        <div style={{ textAlign: "center" }}>
          <div style={{
            display: 'inline-block',
            color: '#ffffffff',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            marginTop: '0.5rem',
            border: '1px solid #ffffffff',
            fontSize: '0.9rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;