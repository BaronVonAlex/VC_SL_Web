import { useState, useEffect } from 'react';
import { generateChartUrl } from '../utils/chartUtil';

const Chart = ({ playerID, historicalStats }) => {
  const [chartUrl, setChartUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChart = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const url = await generateChartUrl(playerID, historicalStats || []);
        setChartUrl(url);
      } catch (err) {
        console.error('Error generating chart:', err);
        setError('Failed to generate chart');
      } finally {
        setLoading(false);
      }
    };

    fetchChart();
  }, [playerID, historicalStats]);

  if (loading) {
    return (
      <div className="chart">
        <div style={{
          backgroundColor: '#323336',
          padding: '2rem',
          borderRadius: '0.75rem',
          textAlign: 'center',
          color: '#a5a6ab'
        }}>
          Loading chart...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart">
        <div style={{
          backgroundColor: '#323336',
          padding: '2rem',
          borderRadius: '0.75rem',
          textAlign: 'center',
          color: '#ef4444'
        }}>
          {error}
        </div>
      </div>
    );
  }

  if (!historicalStats || historicalStats.length === 0) {
    return (
      <div className="chart">
        <div style={{
          backgroundColor: '#323336',
          padding: '2rem',
          borderRadius: '0.75rem',
          textAlign: 'center',
          color: '#a5a6ab'
        }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>📊</p>
          <p>No historical data available for this year</p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: '#71717a' }}>
            Data will appear after the first search of the current year
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart">
      <img 
        src={chartUrl} 
        alt="Winrate History Chart" 
        style={{ 
          width: '100%',
          height: 'auto',
          borderRadius: '0.5rem'
        }}
        onError={(e) => {
          console.error('Chart image failed to load');
          setError('Failed to load chart image');
        }}
      />
    </div>
  );
};

export default Chart;