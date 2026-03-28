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
        <div className="chart-placeholder">Loading chart...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart">
        <div className="chart-error">{error}</div>
      </div>
    );
  }

  if (!historicalStats || historicalStats.length === 0) {
    return (
      <div className="chart">
        <div className="chart-placeholder">
          <p>📊</p>
          <p>No historical data available for this year</p>
          <p className="chart-empty-sub">Data will appear after the first search of the current year</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart">
      <img
        src={chartUrl}
        alt="Winrate History Chart"
        className="chart-img"
        onError={() => {
          console.error('Chart image failed to load');
          setError('Failed to load chart image');
        }}
      />
    </div>
  );
};

export default Chart;