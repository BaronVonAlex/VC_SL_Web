import Chart from './Chart';

const HistoricalData = ({ historicalStats, playerID }) => {
  const stats = Array.isArray(historicalStats) ? historicalStats : [];

  return (
    <div className="historical-data">
      <Chart playerID={playerID} historicalStats={stats} />
      
      {stats.length > 0 && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: '#2a2b2e',
          borderRadius: '0.75rem',
          color: '#a5a6ab',
          fontSize: '0.875rem'
        }}>
          <p><strong>Data Points:</strong> {stats.length} month(s) recorded</p>
        </div>
      )}
    </div>
  );
};

export default HistoricalData;