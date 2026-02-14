import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Text4 } from "@/components/Text4";
import { formatMoney } from "@/lib/formatMoney";

interface PortfolioHistory {
  date: string;
  portfolio_value: number;
  positions_value: number;
  cash_balance: number;
}

interface PortfolioChartProps {
  timeframe?: string;
}

export function PortfolioChart({ timeframe = "1mo" }: PortfolioChartProps) {
  const [data, setData] = useState<PortfolioHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolioHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('access_token');
        if (!token) {
          setData([]);
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/portfolio/history?period=${timeframe}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const historyData = await response.json();
          setData(historyData.history || []);
        } else {
          throw new Error('Failed to fetch portfolio history');
        }
      } catch (err: any) {
        console.error('Error fetching portfolio history:', err);
        setError(err.message || 'Failed to load portfolio history');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioHistory();
  }, [timeframe]);

  if (loading) {
    return (
      <div className="h-64 w-full">
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-2 w-full flex items-center justify-center">
        <Text4>Unable to load chart data</Text4>
      </div>
    );
  }

  // Transform data for the chart
  const chartData = data.map(item => ({
    date: item.date,
    value: item.portfolio_value
  }));

  // If no data, show empty state
  if (chartData.length === 0) {
    return (
      <div className="py-2 w-full flex items-center justify-center">
        <Text4>
          
        </Text4>
      </div>
    );
  }

  // Calculate dynamic width based on max value
  const maxValue = Math.max(...chartData.map(item => item.value));
  const maxValueLength = formatMoney(Math.round(maxValue)).length;
  
  // Calculate width: roughly 8px per character + some padding
  const yAxisWidth = Math.max(40, maxValueLength * 8 + 10);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => {
              const date = new Date(value)
              return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            }}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            tickMargin={8}
            minTickGap={32}
            interval="preserveStartEnd"
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            tickMargin={8}
            width={yAxisWidth}
            tickFormatter={(value) => formatMoney(Math.round(value))}
          />
          <Tooltip
            labelFormatter={(value) => {
              const date = new Date(value)
              return date.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })
            }}
            formatter={(value) => [formatMoney(Number(value)), "Portfolio Value"]}
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#f9fafb'
            }}
            labelStyle={{ color: '#f9fafb' }}
            itemStyle={{ color: '#f9fafb' }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#1D4FBC"
            fill="#163B8D"
            fillOpacity={0.6}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}