import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrophy, FaMedal, FaFilter, FaChartLine, FaChevronDown, FaChevronUp, FaPlus, FaMinus } from 'react-icons/fa';
import { fetchLeaderboard } from '../services/api';
import '../styles/Leaderboard.css';

const CURRENT_YEAR = new Date().getFullYear();

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

const Leaderboard = () => {
  const navigate = useNavigate();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const [filters, setFilters] = useState({
    period: 2, // AllTime
    category: 0, // Combined
    month: new Date().getMonth() + 1,
    year: CURRENT_YEAR,
    limit: 100,
    minimumMonths: 2
  });

  const years = useMemo(() => {
    const arr = [];
    for (let y = CURRENT_YEAR; y >= 2013; y--) arr.push(y);
    return arr;
  }, []);

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

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const incrementValue = useCallback((key, min = 1, max = Infinity) => {
    setFilters(prev => ({ ...prev, [key]: Math.min(prev[key] + 1, max) }));
  }, []);

  const decrementValue = useCallback((key, min = 1) => {
    setFilters(prev => ({ ...prev, [key]: Math.max(prev[key] - 1, min) }));
  }, []);

  const handleNumberChange = useCallback((key) => (e) => {
    const val = e.target.value;
    if (val === '' || val === '-') {
      handleFilterChange(key, '');
      return;
    }
    const numVal = parseInt(val, 10);
    if (!isNaN(numVal)) handleFilterChange(key, numVal);
  }, [handleFilterChange]);

  const handleNumberBlur = useCallback((key, min = -Infinity, max = Infinity, fallback = min) => (e) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < min) {
      handleFilterChange(key, fallback);
    } else if (val > max) {
      handleFilterChange(key, max);
    }
  }, [handleFilterChange]);

  const handlePlayerClick = (playerId) => {
    navigate('/', { state: { searchPlayerId: playerId } });
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <FaTrophy className="rank-icon gold" />;
    if (rank === 2) return <FaMedal className="rank-icon silver" />;
    if (rank === 3) return <FaMedal className="rank-icon bronze" />;
    return <span className="rank-number">#{rank}</span>;
  };

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
                  onChange={(e) => handleFilterChange('period', parseInt(e.target.value, 10))}
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
                  onChange={(e) => handleFilterChange('category', parseInt(e.target.value, 10))}
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
                    onChange={(e) => handleFilterChange('month', parseInt(e.target.value, 10))}
                  >
                    {months.map((m, idx) => (
                      <option key={idx} value={idx + 1}>{m}</option>
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
                      max={CURRENT_YEAR}
                      value={filters.year}
                      onChange={handleNumberChange('year')}
                      onBlur={handleNumberBlur('year', 2013, CURRENT_YEAR, 2013)}
                      className="number-input"
                    />
                    <button
                      className="increment-btn"
                      onClick={() => incrementValue('year', 2013, CURRENT_YEAR)}
                      disabled={filters.year >= CURRENT_YEAR}
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
                    onChange={handleNumberChange('limit')}
                    onBlur={handleNumberBlur('limit', 1, 1000, 1)}
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
                    onChange={handleNumberChange('minimumMonths')}
                    onBlur={handleNumberBlur('minimumMonths', 1, Infinity, 1)}
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
            <div className="spinner" />
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

            {leaderboardData.map((player) => (
              <div
                key={player.userId}
                className="table-row"
                onClick={() => handlePlayerClick(player.userId)}
              >
                <div className="rank-cell">{getRankIcon(player.rank)}</div>

                <div className="player-name">
                  {player.username || `Player ${player.userId}`}
                </div>

                <div className="winrate-cell">
                  <div className="winrate-badge">{player.winrate?.toFixed(2)}%</div>
                </div>

                <div className="months-cell">{player.monthsPlayed}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;