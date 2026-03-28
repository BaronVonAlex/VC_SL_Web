import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import type { WinrateEntry } from '../types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface ChartProps {
  playerID: number;
  historicalStats: WinrateEntry[];
}

const Chart = ({ historicalStats }: ChartProps) => {
  if (!historicalStats || historicalStats.length === 0) {
    return (
      <div className="chart">
        <div className="chart-placeholder">
          <p>No historical data available for this year</p>
          <p className="chart-empty-sub">Data will appear after the first search of the current year</p>
        </div>
      </div>
    );
  }

  const chartData = MONTHS.map((month, i) => {
    const entry = historicalStats.find(e => e.month === i + 1);
    return {
      month,
      'Fleet Attack': entry?.fleetWinrate ?? null,
      'Base Attack': entry?.baseAttackWinrate ?? null,
      'Base Defense': entry?.baseDefenceWinrate ?? null,
    };
  });

  const allValues = historicalStats.flatMap(e => [
    e.fleetWinrate ?? 0,
    e.baseAttackWinrate ?? 0,
    e.baseDefenceWinrate ?? 0,
  ]);
  const yMin = allValues.length > 0 ? Math.max(0, Math.floor(Math.min(...allValues) - 5)) : 0;
  const yMax = allValues.length > 0 ? Math.min(100, Math.ceil(Math.max(...allValues) + 5)) : 100;

  return (
    <div className="chart">
      <ResponsiveContainer width="100%" height={420}>
        <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#ccc' }} />
          <YAxis domain={[yMin, yMax]} tick={{ fontSize: 12, fill: '#ccc' }} tickFormatter={(v) => `${v}%`} />
          <Tooltip
            formatter={(value: number | null) => value !== null ? `${value.toFixed(2)}%` : 'N/A'}
            contentStyle={{ background: '#1a1b1e', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px' }}
            labelStyle={{ color: '#fff' }}
            itemStyle={{ color: '#ccc' }}
          />
          <Legend wrapperStyle={{ fontSize: 13 }} />
          <Line type="monotone" dataKey="Fleet Attack" stroke="rgba(239,68,68,1)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />
          <Line type="monotone" dataKey="Base Attack" stroke="rgba(234,179,8,1)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />
          <Line type="monotone" dataKey="Base Defense" stroke="rgba(34,197,94,1)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
