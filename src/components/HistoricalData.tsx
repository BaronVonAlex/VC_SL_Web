import { useState, useEffect } from 'react';
import Chart from './Chart';

const HistoricalData = ({ historicalStats, playerID, onYearChange, currentYear }) => {
  const defaultYear = currentYear || new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(defaultYear);

  useEffect(() => {
    setSelectedYear(defaultYear);
  }, [defaultYear]);
  
  const latestYear = new Date().getFullYear();
  const years = [];
  for (let year = latestYear; year >= 2013; year--) {
    years.push(year);
  }

  const handleYearChange = (e) => {
    const year = parseInt(e.target.value);
    setSelectedYear(year);
    if (onYearChange) {
      onYearChange(year);
    }
  };

  const stats = Array.isArray(historicalStats) ? historicalStats : [];

  return (
    <div className="historical-data">
      <div className="historical-header">
        <h3>Winrate History</h3>
        <div className="year-selector">
          <label className="year-label">Year:</label>
          <select
            value={selectedYear}
            onChange={handleYearChange}
            className="year-select"
          >
            {years.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Chart playerID={playerID} historicalStats={stats} />
      
      {/* {stats.length > 0 && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: '#323336',
          borderRadius: '0.75rem',
          color: '#a5a6ab',
          fontSize: '0.875rem',
          width: '100%'
        }}>
          <p style={{ margin: 0 }}><strong>Data Points:</strong> {stats.length} month(s) recorded for {selectedYear}</p>
        </div>
      )} */}
    </div>
  );
};

export default HistoricalData;