import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

const SearchBar = ({ onSearch }) => {
  const [playerID, setPlayerID] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState('');

  const currentYear = new Date().getFullYear();

  const handleSearch = () => {
    setError('');

    if (!playerID.trim()) {
      setError('Please enter a Player ID');
      return;
    }

    if (year) {
      const yearNum = parseInt(year);
      
      if (isNaN(yearNum)) {
        setError('Please enter a valid year');
        return;
      }

      if (yearNum < 2013 || yearNum > currentYear) {
        setError(`Year must be between 2013 and ${currentYear}`);
        return;
      }

      if (yearNum > currentYear) {
        setError(`Note: Searching future year ${yearNum}. No data will be available.`);

        setTimeout(() => {
          onSearch(playerID, yearNum);
        }, 1000);
        return;
      }

      onSearch(playerID, yearNum);
    } else {
      onSearch(playerID, currentYear);
    }
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
        <input
          type="number"
          placeholder={`Year (Default: ${currentYear})`}
          value={year}
          onChange={(e) => {
            setYear(e.target.value);
            setError('');
          }}
          onKeyDown={handleKeyPress}
          className="year-input"
          min="2013"
          max={`${currentYear}`}
        />
        <button onClick={handleSearch} className="search-button">
          <FaSearch /> Search
        </button>
      </div>
      {error && (
        <div style={{ textAlign: "center" }}>
          <div style={{
            display: 'inline-block',
            color: error.includes('Note:') ? '#eab308' : '#ffffffff',
            backgroundColor: error.includes('Note:') ? 'rgba(234, 179, 8, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            marginTop: '0.5rem',
            border: `1px solid ${error.includes('Note:') ? '#eab308' : '#ffffffff'}`,
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