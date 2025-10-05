import PlayerDetails from './PlayerDetails';
import AdditionalInfo from './AdditionalInfo';
import CombatStats from './CombatStats';
import HistoricalData from './HistoricalData';

const PlayerCard = ({ playerData, historicalStats, usernameHistory, onYearChange, currentYear }) => {
  if (!playerData) return null;

  return (
    <div className="player-card">
      <div className="player-card-content">
        <div className="sidebar">
          <h2>{playerData.alias}</h2>
          <img src={playerData.avatarUrl} alt={`${playerData.alias}'s Avatar`} className="player-avatar" />
          <PlayerDetails playerData={playerData} />
          <AdditionalInfo playerData={playerData} usernameHistory={usernameHistory} />
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