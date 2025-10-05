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
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h3 style={{ color: '#ffffffff', fontSize: '1.4rem' }}>Year:</h3>
          <select 
            value={selectedYear}
            onChange={handleYearChange}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid #3a3b3e',
              backgroundColor: '#323336',
              color: '#e1e2e6',
              fontSize: '1rem',
              cursor: 'pointer',
              outline: 'none'
            }}
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
      
      {stats.length > 0 && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: '#2a2b2e',
          borderRadius: '0.75rem',
          color: '#a5a6ab',
          fontSize: '0.875rem'
        }}>
          <p><strong>Data Points:</strong> {stats.length} month(s) recorded for {selectedYear}</p>
        </div>
      )}
    </div>
  );
};

export default HistoricalData;