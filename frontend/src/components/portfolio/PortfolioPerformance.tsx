import React, { useState } from 'react';
import { PortfolioChart } from "@/components/portfolio-chart";
import { Tile } from "@/components/tile";
import { Title2 } from "@/components/title-2";
import { CustomDropdown } from "@/components/custom-dropdown";
import { PopInOutEffect } from "@/components/pop-in-out-effect";

type ChartFilter = "1mo" | "3mo" | "6mo" | "1y" | "max";

// helper to get the display label for a chart filter
const getFilterLabel = (filter: ChartFilter) => {
  switch (filter) {
    case "1mo":
      return "1 Month";
    case "3mo":
      return "3 Months";
    case "6mo":
      return "6 Months";
    case "1y":
      return "1 Year";
    case "max":
      return "Max";
    default:
      return "1 Month";
  }
};

interface PortfolioPerformanceProps {
  isVisible: boolean;
}

export const PortfolioPerformance: React.FC<PortfolioPerformanceProps> = ({
  isVisible,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<ChartFilter>("1mo");

  return (
    <PopInOutEffect isVisible={isVisible} delay={100}>
      <div>
        <Title2>Performance</Title2>
        <div className="flex flex-col mb-4 w-full sm:w-fit">
          <CustomDropdown
            label="Filter"
            value={getFilterLabel(selectedFilter)}
            options={[
              { value: "1mo", label: "1 Month" },
              { value: "3mo", label: "3 Months" },
              { value: "6mo", label: "6 Months" },
              { value: "1y", label: "1 Year" },
              { value: "max", label: "Max" },
            ]}
            onValueChange={(value) => setSelectedFilter(value as ChartFilter)}
          />
        </div>
        <Tile>
          <PortfolioChart timeframe={selectedFilter} />
        </Tile>
      </div>
    </PopInOutEffect>
  );
};
