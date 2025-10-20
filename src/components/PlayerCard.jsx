import { FaStar, FaRegStar } from 'react-icons/fa';
import { useFavorites } from '../../src/components/FavoriteContext.jsx';
import CombatStats from './CombatStats';
import HistoricalData from './HistoricalData';

const PlayerCard = ({ playerData, historicalStats, usernameHistory, onYearChange, currentYear }) => {
  const { isFavorite, toggleFavorite } = useFavorites();

  if (!playerData) return null;

  const formatTimeSince = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  let history = [];
  try {
    history = Array.isArray(usernameHistory) 
      ? usernameHistory 
      : JSON.parse(usernameHistory || '[]');
  } catch (error) {
    console.error('Error parsing usernameHistory:', error);
  }

  const isFav = isFavorite(playerData.playerId);

  return (
    <div className="player-card">
      <div className="player-card-content">
        <div className="sidebar">
          <div className="sidebar-section">
            <div className="player-header-with-star">
              <h2 className="player-name">{playerData.alias}</h2>
              <button
                onClick={() => toggleFavorite(playerData.playerId, playerData.alias)}
                className="favorite-star-btn"
                aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
              >
                {isFav ? <FaStar className="star-filled" /> : <FaRegStar className="star-empty" />}
              </button>
            </div>
            <h3 className="sidebar-title">Player Details</h3>
            <img src={playerData.avatarUrl} alt={`${playerData.alias}'s Avatar`} className="player-avatar" />
            
            <div className="info-row">
              <span className="info-label">Alias</span>
              <span className="info-value">{playerData.alias}</span>
            </div>
            <div className="info-row">
              <span className="info-label">ID</span>
              <span className="info-value">{playerData.playerId}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Planet</span>
              <span className="info-value">{playerData.planet}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Level</span>
              <span className="info-value">{playerData.level}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Medals</span>
              <span className="info-value">{playerData.medals}</span>
            </div>
          </div>
          
          <div className="sidebar-section">
            <h3 className="sidebar-title">Additional Info</h3>
            <div className="info-row">
              <span className="info-label">Joined</span>
              <span className="info-value">{new Date(playerData.since).toLocaleDateString()}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Last Seen</span>
              <span className="info-value">{formatTimeSince(playerData.seen)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Previous Names</span>
              <span className="info-value">{history.length > 0 ? history.join(', ') : "No History"}</span>
            </div>
          </div>
        </div>

        <div className="main-content">
          <CombatStats playerData={playerData} />
          <HistoricalData 
            historicalStats={historicalStats} 
            playerID={playerData.playerId}
            onYearChange={onYearChange}
            currentYear={currentYear}
          />
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;