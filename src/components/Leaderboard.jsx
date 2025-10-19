import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrophy, FaMedal, FaFilter, FaChartLine } from 'react-icons/fa';
import { fetchLeaderboard } from '../services/api';
import '../styles/Leaderboard.css';

const Leaderboard = () => {
  const navigate = useNavigate();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [filters, setFilters] = useState({
    period: 2, // AllTime
    category: 0, // Combined
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    limit: 100,
    minimumMonths: 2 // This if for minumum months played filter
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

  const handlePlayerClick = (playerId) => {
    // Navigate to search page and trigger search via state
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
          <div className="filters-header">
            <FaFilter />
            <h3>Filters</h3>
          </div>

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
                <select
                  value={filters.year}
                  onChange={(e) => handleFilterChange('year', parseInt(e.target.value))}
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="filter-group">
              <label>Top Players</label>
              <input
                type="number"
                min="1"
                max="1000"
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', parseInt(e.target.value) || 100)}
              />
            </div>

            <div className="filter-group">
              <label>Min Months</label>
              <input
                type="number"
                min="1"
                value={filters.minimumMonths}
                onChange={(e) => handleFilterChange('minimumMonths', parseInt(e.target.value) || 1)}
              />
            </div>
          </div>
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