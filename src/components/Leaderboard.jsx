import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrophy, FaMedal, FaFilter, FaChartLine, FaChevronDown, FaChevronUp, FaPlus, FaMinus } from 'react-icons/fa';
import { fetchLeaderboard } from '../services/api';
import '../styles/Leaderboard.css';

const Leaderboard = () => {
  const navigate = useNavigate();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  
  const [filters, setFilters] = useState({
    period: 2, // AllTime
    category: 0, // Combined
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    limit: 100,
    minimumMonths: 2
  });

  const periodOptions = [
    { value: 0, label: 'Monthly' },
    { value: 1, label: 'Yearly' },
    { value: 2, label: 'All Time' }
  ];

  const categoryOptions = [
    { value: 0, label: 'Combined' },
    { value: 1, label: 'Base Attack' },
    { value: 2, label: 'Base Defence' },
    { value: 3, label: 'Fleet' }
  ];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    loadLeaderboard();
  }, [filters]);

  const loadLeaderboard = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await fetchLeaderboard(filters);
      setLeaderboardData(data || []);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard data');
      setLeaderboardData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const incrementValue = (key, min = 1, max = Infinity) => {
    setFilters(prev => ({
      ...prev,
      [key]: Math.min(prev[key] + 1, max)
    }));
  };

  const decrementValue = (key, min = 1) => {
    setFilters(prev => ({
      ...prev,
      [key]: Math.max(prev[key] - 1, min)
    }));
  };

  const handlePlayerClick = (playerId) => {
    navigate('/', { state: { searchPlayerId: playerId } });
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <FaTrophy className="rank-icon gold" />;
    if (rank === 2) return <FaMedal className="rank-icon silver" />;
    if (rank === 3) return <FaMedal className="rank-icon bronze" />;
    return <span className="rank-number">#{rank}</span>;
  };

  const years = [];
  const currentYear = new Date().getFullYear();
  for (let year = currentYear; year >= 2013; year--) {
    years.push(year);
  }

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-card">
        <div className="leaderboard-header">
          <div className="header-title">
            <FaChartLine className="header-icon" />
            <h1>Leaderboard</h1>
          </div>
        </div>

        <div className="filters-section">
          <div 
            className="filters-header" 
            onClick={() => setFiltersExpanded(!filtersExpanded)}
            style={{ cursor: 'pointer', userSelect: 'none' }}
          >
            <FaFilter />
            <h3>Filters</h3>
            {filtersExpanded ? <FaChevronUp className="toggle-icon" /> : <FaChevronDown className="toggle-icon" />}
          </div>

          {filtersExpanded && (
            <div className="filters-grid">
              <div className="filter-group">
                <label>Period</label>
                <select
                  value={filters.period}
                  onChange={(e) => handleFilterChange('period', parseInt(e.target.value))}
                >
                  {periodOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', parseInt(e.target.value))}
                >
                  {categoryOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {filters.period === 0 && (
                <div className="filter-group">
                  <label>Month</label>
                  <select
                    value={filters.month}
                    onChange={(e) => handleFilterChange('month', parseInt(e.target.value))}
                  >
                    {months.map((month, idx) => (
                      <option key={idx} value={idx + 1}>{month}</option>
                    ))}
                  </select>
                </div>
              )}

              {(filters.period === 0 || filters.period === 1) && (
                <div className="filter-group">
                  <label>Year</label>
                  <div className="number-input-wrapper">
                    <button 
                      className="decrement-btn"
                      onClick={() => decrementValue('year', 2013)}
                      disabled={filters.year <= 2013}
                    >
                      <FaMinus />
                    </button>
                    <input
                      type="number"
                      min="2013"
                      max={currentYear}
                      value={filters.year}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || val === '-') {
                          handleFilterChange('year', '');
                          return;
                        }
                        const numVal = parseInt(val);
                        if (!isNaN(numVal)) {
                          handleFilterChange('year', numVal);
                        }
                      }}
                      onBlur={(e) => {
                        const val = parseInt(e.target.value);
                        if (isNaN(val) || val < 2013) {
                          handleFilterChange('year', 2013);
                        } else if (val > currentYear) {
                          handleFilterChange('year', currentYear);
                        }
                      }}
                      className="number-input"
                    />
                    <button 
                      className="increment-btn"
                      onClick={() => incrementValue('year', 2013, currentYear)}
                      disabled={filters.year >= currentYear}
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>
              )}

              <div className="filter-group">
                <label>Top Players</label>
                <div className="number-input-wrapper">
                  <button 
                    className="decrement-btn"
                    onClick={() => decrementValue('limit', 1)}
                    disabled={filters.limit <= 1}
                  >
                    <FaMinus />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={filters.limit}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || val === '-') {
                        handleFilterChange('limit', '');
                        return;
                      }
                      const numVal = parseInt(val);
                      if (!isNaN(numVal)) {
                        handleFilterChange('limit', numVal);
                      }
                    }}
                    onBlur={(e) => {
                      const val = parseInt(e.target.value);
                      if (isNaN(val) || val < 1) {
                        handleFilterChange('limit', 1);
                      } else if (val > 1000) {
                        handleFilterChange('limit', 1000);
                      }
                    }}
                    className="number-input"
                  />
                  <button 
                    className="increment-btn"
                    onClick={() => incrementValue('limit', 1, 1000)}
                    disabled={filters.limit >= 1000}
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>

              <div className="filter-group">
                <label>Min Months</label>
                <div className="number-input-wrapper">
                  <button 
                    className="decrement-btn"
                    onClick={() => decrementValue('minimumMonths', 1)}
                    disabled={filters.minimumMonths <= 1}
                  >
                    <FaMinus />
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={filters.minimumMonths}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || val === '-') {
                        handleFilterChange('minimumMonths', '');
                        return;
                      }
                      const numVal = parseInt(val);
                      if (!isNaN(numVal)) {
                        handleFilterChange('minimumMonths', numVal);
                      }
                    }}
                    onBlur={(e) => {
                      const val = parseInt(e.target.value);
                      if (isNaN(val) || val < 1) {
                        handleFilterChange('minimumMonths', 1);
                      }
                    }}
                    className="number-input"
                  />
                  <button 
                    className="increment-btn"
                    onClick={() => incrementValue('minimumMonths', 1)}
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading leaderboard...</p>
          </div>
        )}

        {error && (
          <div className="error-container">
            {error}
          </div>
        )}

        {!loading && !error && leaderboardData.length === 0 && (
          <div className="empty-state">
            <p>No data available for selected filters</p>
          </div>
        )}

        {!loading && !error && leaderboardData.length > 0 && (
          <div className="leaderboard-table">
            <div className="table-header">
              <div>RANK</div>
              <div>PLAYER</div>
              <div className="text-center">WINRATE</div>
              <div className="text-center">MONTHS</div>
            </div>

            {leaderboardData.map((player, idx) => (
              <div
                key={player.userId}
                className="table-row"
                onClick={() => handlePlayerClick(player.userId)}
              >
                <div className="rank-cell">
                  {getRankIcon(player.rank)}
                </div>

                <div className="player-name">
                  {player.username || `Player ${player.userId}`}
                </div>

                <div className="winrate-cell">
                  <div className="winrate-badge">
                    {player.winrate?.toFixed(2)}%
                  </div>
                </div>

                <div className="months-cell">
                  {player.monthsPlayed}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;