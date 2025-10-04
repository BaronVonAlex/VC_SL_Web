function getMonthName(monthNumber) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[monthNumber - 1] || '';
}

export async function generateChartUrl(playerID, historicalData) {
  const data = Array.isArray(historicalData) ? historicalData : [];
  
  const labels = Array.from({ length: 12 }, (_, i) => getMonthName(i + 1));
  const fleetAtkData = Array.from({ length: 12 }, () => null);
  const baseAtkData = Array.from({ length: 12 }, () => null);
  const baseDefData = Array.from({ length: 12 }, () => null);

  for (const entry of data) {
    if (!entry || typeof entry.month !== 'number') continue;
    
    const monthIndex = entry.month - 1;
    
    if (monthIndex < 0 || monthIndex > 11) continue;
    
    fleetAtkData[monthIndex] = entry.fleetWinrate !== null && entry.fleetWinrate !== undefined 
      ? entry.fleetWinrate 
      : 0;
    baseAtkData[monthIndex] = entry.baseAttackWinrate !== null && entry.baseAttackWinrate !== undefined 
      ? entry.baseAttackWinrate 
      : 0;
    baseDefData[monthIndex] = entry.baseDefenceWinrate !== null && entry.baseDefenceWinrate !== undefined 
      ? entry.baseDefenceWinrate 
      : 0;
  }

  const allData = [...fleetAtkData, ...baseAtkData, ...baseDefData].filter(value => value !== null);
  
  if (allData.length === 0) {
    const chartData = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Fleet Attack',
            data: [],
            borderColor: 'rgba(239, 68, 68, 1)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: false,
            tension: 0.4,
          },
          {
            label: 'Base Attack',
            data: [],
            borderColor: 'rgba(234, 179, 8, 1)',
            backgroundColor: 'rgba(234, 179, 8, 0.1)',
            fill: false,
            tension: 0.4,
          },
          {
            label: 'Base Defense',
            data: [],
            borderColor: 'rgba(34, 197, 94, 1)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            fill: false,
            tension: 0.4,
          },
        ],
      },
      options: {
        scales: {
          y: {
            min: 0,
            max: 100,
            title: {
              display: true,
              text: 'Winrate (%)'
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'No Historical Data Available'
          }
        }
      },
    };

    const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartData))}`;
    return chartUrl;
  }

  const minValue = Math.min(...allData);
  const maxValue = Math.max(...allData);

  const yMin = Math.max(0, Math.floor(minValue - 5)); 
  const yMax = Math.min(100, Math.ceil(maxValue + 5));

  const chartData = {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Fleet Attack',
          data: fleetAtkData,
          borderColor: 'rgba(239, 68, 68, 1)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: false,
          tension: 0.4,
          spanGaps: true, // Connect lines even if there are null values
        },
        {
          label: 'Base Attack',
          data: baseAtkData,
          borderColor: 'rgba(234, 179, 8, 1)',
          backgroundColor: 'rgba(234, 179, 8, 0.1)',
          fill: false,
          tension: 0.4,
          spanGaps: true,
        },
        {
          label: 'Base Defense',
          data: baseDefData,
          borderColor: 'rgba(34, 197, 94, 1)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          fill: false,
          tension: 0.4,
          spanGaps: true,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          min: yMin,
          max: yMax,
          title: {
            display: true,
            text: 'Winrate (%)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Month'
          }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
        title: {
          display: true,
          text: 'Monthly Winrate History'
        }
      }
    },
  };

  const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartData))}`;
  return chartUrl;
}