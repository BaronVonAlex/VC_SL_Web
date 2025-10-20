import { useState } from 'react';
import { FaTimes, FaSearch, FaExchangeAlt } from 'react-icons/fa';
import { fetchPlayerDetails } from '../services/api';
import { calculateBattleStats } from '../utils/statsUtil';
import '../styles/PlayerComparison.css';

const PlayerComparison = () => {
  const [players, setPlayers] = useState([]);
  const [playerIds, setPlayerIds] = useState(['', '', '', '']);
  const [loading, setLoading] = useState([false, false, false, false]);
  const [errors, setErrors] = useState(['', '', '', '']);

  const handleSearch = async (index) => {
    const playerId = playerIds[index].trim();
    
    if (!playerId) {
      const newErrors = [...errors];
      newErrors[index] = 'Please enter a Player ID';
      setErrors(newErrors);
      return;
    }

    const newLoading = [...loading];
    newLoading[index] = true;
    setLoading(newLoading);

    const newErrors = [...errors];
    newErrors[index] = '';
    setErrors(newErrors);

    try {
      const currentYear = new Date().getFullYear();
      const { playerData, avatarUrl } = await fetchPlayerDetails(playerId, currentYear);
      
      const newPlayers = [...players];
      newPlayers[index] = { 
        ...playerData, 
        avatarUrl,
        playerId: playerId 
      };
      setPlayers(newPlayers);
    } catch (err) {
      console.error('Error fetching player:', err);
      newErrors[index] = 'Failed to fetch player data';
      setErrors(newErrors);
    } finally {
      newLoading[index] = false;
      setLoading(newLoading);
    }
  };

  const handleRemovePlayer = (index) => {
    const newPlayers = [...players];
    newPlayers[index] = null;
    setPlayers(newPlayers);

    const newPlayerIds = [...playerIds];
    newPlayerIds[index] = '';
    setPlayerIds(newPlayerIds);

    const newErrors = [...errors];
    newErrors[index] = '';
    setErrors(newErrors);
  };

  const handleInputChange = (index, value) => {
    const newPlayerIds = [...playerIds];
    newPlayerIds[index] = value;
    setPlayerIds(newPlayerIds);

    const newErrors = [...errors];
    newErrors[index] = '';
    setErrors(newErrors);
  };

  const handleKeyPress = (e, index) => {
    if (e.key === 'Enter') {
      handleSearch(index);
    }
  };

  const getStatValue = (player, stat) => {
    if (!player) return '-';
    
    switch(stat) {
      case 'level':
        return player.level || '-';
      case 'medals':
        return player.medals?.toLocaleString() || '-';
      case 'planet':
        return player.planet || '-';
      case 'fleetWinrate':
        const fleetStats = calculateBattleStats(
          player.fleetWin || 0,
          player.fleetDraw || 0,
          player.fleetLoss || 0
        );
        return `${fleetStats.winratePercent}%`;
      case 'fleetBattles':
        const fleetBattles = (player.fleetWin || 0) + (player.fleetDraw || 0) + (player.fleetLoss || 0);
        return fleetBattles.toLocaleString();
      case 'baseAttackWinrate':
        const baseAtkStats = calculateBattleStats(
          player.baseAttackWin || 0,
          player.baseAttackDraw || 0,
          player.baseAttackLoss || 0
        );
        return `${baseAtkStats.winratePercent}%`;
      case 'baseAttackBattles':
        const baseAtkBattles = (player.baseAttackWin || 0) + (player.baseAttackDraw || 0) + (player.baseAttackLoss || 0);
        return baseAtkBattles.toLocaleString();
      case 'baseDefenceWinrate':
        const baseDefStats = calculateBattleStats(
          player.baseDefenceWin || 0,
          player.baseDefenceDraw || 0,
          player.baseDefenceLoss || 0
        );
        return `${baseDefStats.winratePercent}%`;
      case 'baseDefenceBattles':
        const baseDefBattles = (player.baseDefenceWin || 0) + (player.baseDefenceDraw || 0) + (player.baseDefenceLoss || 0);
        return baseDefBattles.toLocaleString();
      case 'fleetKD':
        const fleetKD = calculateBattleStats(
          player.fleetWin || 0,
          player.fleetDraw || 0,
          player.fleetLoss || 0
        );
        return fleetKD.kdRatio;
      case 'baseAttackKD':
        const baseAtkKD = calculateBattleStats(
          player.baseAttackWin || 0,
          player.baseAttackDraw || 0,
          player.baseAttackLoss || 0
        );
        return baseAtkKD.kdRatio;
      case 'baseDefenceKD':
        const baseDefKD = calculateBattleStats(
          player.baseDefenceWin || 0,
          player.baseDefenceDraw || 0,
          player.baseDefenceLoss || 0
        );
        return baseDefKD.kdRatio;
      case 'totalBattles':
        const total = (player.fleetWin || 0) + (player.fleetDraw || 0) + (player.fleetLoss || 0) +
                      (player.baseAttackWin || 0) + (player.baseAttackDraw || 0) + (player.baseAttackLoss || 0) +
                      (player.baseDefenceWin || 0) + (player.baseDefenceDraw || 0) + (player.baseDefenceLoss || 0);
        return total.toLocaleString();
      default:
        return '-';
    }
  };

  const getRankedPlayers = (stat) => {
    const validPlayers = players
      .map((p, index) => ({ player: p, index }))
      .filter(item => item.player !== null && item.player !== undefined);

    if (validPlayers.length === 0) return [];

    const playersWithValues = validPlayers.map(item => {
      const value = getStatValue(item.player, stat);
      let numericValue = 0;

      if (stat.includes('Winrate') || stat.includes('KD')) {
        numericValue = parseFloat(value.replace('%', '')) || 0;
      } else if (stat.includes('Battles') || stat === 'totalBattles') {
        numericValue = parseInt(value.replace(/,/g, '')) || 0;
      } else {
        numericValue = parseFloat(value) || 0;
      }

      return { ...item, numericValue };
    });

    playersWithValues.sort((a, b) => b.numericValue - a.numericValue);

    return playersWithValues.map((item, rank) => ({
      index: item.index,
      rank: rank + 1
    }));
  };

  const getPlayerRank = (playerIndex, stat) => {
    if (!players[playerIndex]) return null;
    
    const rankings = getRankedPlayers(stat);
    const playerRanking = rankings.find(r => r.index === playerIndex);
    
    return playerRanking ? playerRanking.rank : null;
  };

  const statCategories = [
    {
      title: 'General Stats',
      stats: [
        { key: 'level', label: 'Level' },
        { key: 'medals', label: 'Medals' },
        { key: 'planet', label: 'Planet' },
        { key: 'totalBattles', label: 'Total Battles' }
      ]
    },
    {
      title: 'Fleet vs Fleet',
      stats: [
        { key: 'fleetWinrate', label: 'Winrate' },
        { key: 'fleetKD', label: 'K/D Ratio' },
        { key: 'fleetBattles', label: 'Total Battles' }
      ]
    },
    {
      title: 'Base Attack',
      stats: [
        { key: 'baseAttackWinrate', label: 'Winrate' },
        { key: 'baseAttackKD', label: 'K/D Ratio' },
        { key: 'baseAttackBattles', label: 'Total Battles' }
      ]
    },
    {
      title: 'Base Defence',
      stats: [
        { key: 'baseDefenceWinrate', label: 'Winrate' },
        { key: 'baseDefenceKD', label: 'K/D Ratio' },
        { key: 'baseDefenceBattles', label: 'Total Battles' }
      ]
    }
  ];

  return (
    <div className="comparison-container">
      <div className="comparison-header">
        <FaExchangeAlt className="header-icon" />
        <h1>Player Comparison</h1>
        <p>Compare up to 4 players side-by-side</p>
      </div>

      <div className="player-inputs-grid">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="player-input-card">
            <div className="input-header">
              <span>Player {index + 1}</span>
              {players[index] && (
                <button
                  onClick={() => handleRemovePlayer(index)}
                  className="remove-button"
                  aria-label="Remove player"
                >
                  <FaTimes />
                </button>
              )}
            </div>

            {!players[index] ? (
              <>
                <div className="search-input-group">
                  <input
                    type="text"
                    placeholder="Enter Player ID"
                    value={playerIds[index]}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    className="player-id-input"
                  />
                  <button
                    onClick={() => handleSearch(index)}
                    disabled={loading[index]}
                    className="search-button"
                  >
                    {loading[index] ? (
                      <div className="mini-spinner"></div>
                    ) : (
                      <FaSearch />
                    )}
                  </button>
                </div>

                {errors[index] && (
                  <div className="error-message">{errors[index]}</div>
                )}
              </>
            ) : (
              <div className="player-preview">
                <img
                  src={players[index].avatarUrl}
                  alt={players[index].alias}
                  className="player-preview-avatar"
                />
                <div className="player-preview-info">
                  <div className="player-preview-name">{players[index].alias}</div>
                  <div className="player-preview-id">ID: {players[index].playerId}</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {players.some(p => p !== null) && (
        <div className="comparison-table-container">
          {statCategories.map((category) => (
            <div key={category.title} className="stat-category">
              <h3 className="category-title">{category.title}</h3>
              
              <div className="comparison-table">
                <div className="table-row header-row">
                  <div className="stat-label-cell">Stat</div>
                  {[0, 1, 2, 3].map((index) => (
                    <div key={index} className="player-cell">
                      {players[index] ? players[index].alias : '-'}
                    </div>
                  ))}
                </div>

                {category.stats.map((stat) => (
                  <div key={stat.key} className="table-row">
                    <div className="stat-label-cell">{stat.label}</div>
                    {[0, 1, 2, 3].map((index) => {
                      const rank = getPlayerRank(index, stat.key);
                      return (
                        <div
                          key={index}
                          className={`player-cell ${
                            rank === 1 ? 'rank-1' : 
                            rank === 2 ? 'rank-2' : 
                            rank === 3 ? 'rank-3' : 
                            rank === 4 ? 'rank-4' : ''
                          }`}
                        >
                          {getStatValue(players[index], stat.key)}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!players.some(p => p !== null) && (
        <div className="empty-state">
          <FaSearch className="empty-icon" />
          <h3>No Players Added</h3>
          <p>Search for players to start comparing their stats</p>
        </div>
      )}
    </div>
  );
};

export default PlayerComparison;