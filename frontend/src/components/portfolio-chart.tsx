"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { Tile } from "@/components/tile"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/chart"
import type { ChartConfig } from "@/components/chart"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

// Mock portfolio data - replace with real data later
const chartData = [
  { date: "2024-10-01", value: 100000 },
  { date: "2024-10-02", value: 101200 },
  { date: "2024-10-03", value: 99800 },
  { date: "2024-10-04", value: 102500 },
  { date: "2024-10-05", value: 104200 },
  { date: "2024-10-06", value: 103800 },
  { date: "2024-10-07", value: 105600 },
  { date: "2024-10-08", value: 107200 },
  { date: "2024-10-09", value: 106800 },
  { date: "2024-10-10", value: 108500 },
  { date: "2024-10-11", value: 110200 },
  { date: "2024-10-12", value: 109800 },
  { date: "2024-10-13", value: 111500 },
  { date: "2024-10-14", value: 113200 },
  { date: "2024-10-15", value: 112800 },
  { date: "2024-10-16", value: 114500 },
  { date: "2024-10-17", value: 116200 },
  { date: "2024-10-18", value: 115800 },
  { date: "2024-10-19", value: 117500 },
  { date: "2024-10-20", value: 119200 },
  { date: "2024-10-21", value: 118800 },
  { date: "2024-10-22", value: 120500 },
  { date: "2024-10-23", value: 122200 },
  { date: "2024-10-24", value: 121800 },
  { date: "2024-10-25", value: 123500 },
  { date: "2024-10-26", value: 125200 },
  { date: "2024-10-27", value: 124800 },
  { date: "2024-10-28", value: 126500 },
  { date: "2024-10-29", value: 128200 },
  { date: "2024-10-30", value: 127800 },
  { date: "2024-10-31", value: 127450 },
  { date: "2024-11-01", value: 126200 },
  { date: "2024-11-02", value: 124800 },
  { date: "2024-11-03", value: 123500 },
  { date: "2024-11-04", value: 125200 },
  { date: "2024-11-05", value: 126800 },
  { date: "2024-11-06", value: 128500 },
  { date: "2024-11-07", value: 127200 },
  { date: "2024-11-08", value: 125800 },
  { date: "2024-11-09", value: 124500 },
  { date: "2024-11-10", value: 126200 },
  { date: "2024-11-11", value: 127800 },
  { date: "2024-11-12", value: 129500 },
  { date: "2024-11-13", value: 128200 },
  { date: "2024-11-14", value: 126800 },
  { date: "2024-11-15", value: 125500 },
  { date: "2024-11-16", value: 127200 },
  { date: "2024-11-17", value: 128800 },
  { date: "2024-11-18", value: 130500 },
  { date: "2024-11-19", value: 129200 },
  { date: "2024-11-20", value: 127800 },
  { date: "2024-11-21", value: 126500 },
  { date: "2024-11-22", value: 128200 },
  { date: "2024-11-23", value: 129800 },
  { date: "2024-11-24", value: 131500 },
  { date: "2024-11-25", value: 130200 },
  { date: "2024-11-26", value: 128800 },
  { date: "2024-11-27", value: 127500 },
  { date: "2024-11-28", value: 129200 },
  { date: "2024-11-29", value: 130800 },
  { date: "2024-11-30", value: 132500 },
  { date: "2024-12-01", value: 131200 },
  { date: "2024-12-02", value: 129800 },
  { date: "2024-12-03", value: 128500 },
  { date: "2024-12-04", value: 130200 },
  { date: "2024-12-05", value: 131800 },
  { date: "2024-12-06", value: 133500 },
  { date: "2024-12-07", value: 132200 },
  { date: "2024-12-08", value: 130800 },
  { date: "2024-12-09", value: 129500 },
  { date: "2024-12-10", value: 131200 },
  { date: "2024-12-11", value: 132800 },
  { date: "2024-12-12", value: 134500 },
  { date: "2024-12-13", value: 133200 },
  { date: "2024-12-14", value: 131800 },
  { date: "2024-12-15", value: 130500 },
  { date: "2024-12-16", value: 132200 },
  { date: "2024-12-17", value: 133800 },
  { date: "2024-12-18", value: 135500 },
  { date: "2024-12-19", value: 134200 },
  { date: "2024-12-20", value: 132800 },
  { date: "2024-12-21", value: 131500 },
  { date: "2024-12-22", value: 133200 },
  { date: "2024-12-23", value: 134800 },
  { date: "2024-12-24", value: 136500 },
  { date: "2024-12-25", value: 135200 },
  { date: "2024-12-26", value: 133800 },
  { date: "2024-12-27", value: 132500 },
  { date: "2024-12-28", value: 134200 },
  { date: "2024-12-29", value: 135800 },
  { date: "2024-12-30", value: 137500 },
  { date: "2024-12-31", value: 136200 },
  { date: "2025-01-01", value: 134800 },
  { date: "2025-01-02", value: 133500 },
  { date: "2025-01-03", value: 135200 },
  { date: "2025-01-04", value: 136800 },
  { date: "2025-01-05", value: 138500 },
  { date: "2025-01-06", value: 137200 },
  { date: "2025-01-07", value: 135800 },
  { date: "2025-01-08", value: 134500 },
  { date: "2025-01-09", value: 136200 },
  { date: "2025-01-10", value: 137800 },
  { date: "2025-01-11", value: 139500 },
  { date: "2025-01-12", value: 138200 },
  { date: "2025-01-13", value: 136800 },
  { date: "2025-01-14", value: 135500 },
  { date: "2025-01-15", value: 137200 },
]

const chartConfig = {
  value: {
    label: "Portfolio Value",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

interface PortfolioChartProps {
  selectedRange: string
  onRangeChange: (range: string) => void
}

export function PortfolioChart({ selectedRange, onRangeChange }: PortfolioChartProps) {
  const filteredData = React.useMemo(() => {
    const referenceDate = new Date("2025-01-15")
    let daysToSubtract = 30
    
    if (selectedRange === "1mo") {
      daysToSubtract = 30
    } else if (selectedRange === "3mo") {
      daysToSubtract = 90
    } else if (selectedRange === "6mo") {
      daysToSubtract = 180
    } else if (selectedRange === "1y") {
      daysToSubtract = 365
    } else if (selectedRange === "max") {
      return chartData
    }
    
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    
    return chartData.filter((item) => {
      const date = new Date(item.date)
      return date >= startDate
    })
  }, [selectedRange])

  function formatMoney(value: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Portfolio Performance</h3>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center justify-between min-w-[120px] px-4 py-2 !text-lg !text-white !bg-zinc-800/55 !border !border-zinc-700 !rounded-xl hover:!bg-zinc-700 h-10 focus:!outline-none focus:!ring-0">
            {selectedRange === "1mo" && "1 Month"}
            {selectedRange === "3mo" && "3 Months"}
            {selectedRange === "6mo" && "6 Months"}
            {selectedRange === "1y" && "1 Year"}
            {selectedRange === "max" && "Max"}
            <ChevronDown className="h-4 w-4 ml-2" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onRangeChange("1mo")} className="text-base">
              1 Month
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRangeChange("3mo")} className="text-base">
              3 Months
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRangeChange("6mo")} className="text-base">
              6 Months
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRangeChange("1y")} className="text-base">
              1 Year
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRangeChange("max")} className="text-base">
              Max
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tile className="p-4">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--chart-1))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--chart-1))"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                  formatter={(value) => [formatMoney(value as number), "Portfolio Value"]}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="value"
              type="natural"
              fill="url(#fillValue)"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </Tile>
    </div>
  )
}