import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Helper function to format money values.
const formatMoney = (value: number | null | undefined) => {
  if (typeof value !== 'number' || isNaN(value)) {
    return '$0.00';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

// Aggregates raw portfolio history data into a combined timeline.
function aggregatePortfolioHistory(rawData: any): Array<{ date: string; totalValue: number }> {
  const allDates = new Set<string>();
  for (const symbol in rawData) {
    rawData[symbol].forEach((entry: any) => {
      allDates.add(entry.date);
    });
  }

  const dateValueMap: Record<string, number> = {};
  allDates.forEach((date) => {
    let totalOnThisDate = 0;
    for (const symbol in rawData) {
      const entry = rawData[symbol].find((e: any) => e.date === date);
      if (entry) {
        totalOnThisDate += entry.value;
      }
    }
    dateValueMap[date] = totalOnThisDate;
  });

  const combinedHistory = Object.keys(dateValueMap)
    .map((date) => ({
      date,
      totalValue: dateValueMap[date],
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  console.log("Aggregated portfolio history:", combinedHistory);
  return combinedHistory;
}

interface PortfolioHistoryChartProps {
  portfolioData: any;
  currentPortfolioValue: number;
}

const PortfolioHistoryChart: React.FC<PortfolioHistoryChartProps> = ({ portfolioData, currentPortfolioValue }) => {
  let combinedHistory = aggregatePortfolioHistory(portfolioData);

  // Append or update today's value as the most recent data point.
  const todayUTC = dayjs().utc().startOf('day');
  const lastPoint = combinedHistory[combinedHistory.length - 1];
  if (lastPoint) {
    const lastDateUTC = dayjs(lastPoint.date).utc().startOf('day');
    if (lastDateUTC.isSame(todayUTC)) {
      // Update the last point's value with the current portfolio value.
      lastPoint.totalValue = currentPortfolioValue;
    } else {
      combinedHistory.push({
        date: todayUTC.toISOString(),
        totalValue: currentPortfolioValue,
      });
    }
  } else {
    combinedHistory.push({
      date: todayUTC.toISOString(),
      totalValue: currentPortfolioValue,
    });
  }

  const chartData = {
    labels: combinedHistory.map((item) =>
      dayjs(item.date).utc().format('M/D/YYYY')
    ),
    datasets: [
      {
        label: 'Portfolio Value',
        data: combinedHistory.map((item) => item.totalValue),
        // Solid line color kept the same
        borderColor: 'rgb(20, 50, 245)',
        pointRadius: 3,
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: (tickValue: string | number) => {
            const numericValue = Number(tickValue);
            return formatMoney(numericValue);
          },
        },
      },
    },
    animation: {
      duration: 0,
    },
  };

  return (
    <div className="h-96 bg-white p-4 rounded-lg">
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default PortfolioHistoryChart;
