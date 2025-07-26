import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Text4 } from "@/components/text-4";
import { formatMoney } from "@/lib/format-money";

interface PortfolioChartProps {
  data?: Array<{ date: string; value: number }>;
}

export function PortfolioChart({ data }: PortfolioChartProps) {
  // Use provided data or fall back to mock data
  const chartData = data || [];
  
  // If no data, show empty state
  if (!data || data.length === 0) {
    return (
      <div className="py-2 w-full flex items-center justify-center">
        <Text4>Nothing here yet.</Text4>
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