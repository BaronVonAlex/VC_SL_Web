const PlayerDetails = ({ playerData }) => {
  return (
    <div className="player-details">
      <h3>Player Info</h3>
      <p><strong>Name:</strong> {playerData.alias}</p>
      <p><strong>ID:</strong> {playerData.playerId}</p>
      <p><strong>Planet:</strong> {playerData.planet}</p>
      <p><strong>Level:</strong> {playerData.level}</p>
      <p><strong>Medals:</strong> {playerData.medals}</p>
    </div>
  );
};

export default PlayerDetails;
