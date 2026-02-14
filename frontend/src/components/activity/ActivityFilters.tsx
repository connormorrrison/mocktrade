import React from 'react';
import { Download } from "lucide-react";
import { Button2 } from "@/components/Button2";
import { CustomDropdown } from "@/components/CustomDropdown";
import { CustomDatePicker } from "@/components/CustomDatePicker";
import type { ActivityFilterType } from "@/lib/types/activity";

interface ActivityFiltersProps {
    selectedFilter: ActivityFilterType;
    onFilterChange: (value: ActivityFilterType) => void;
    fromDate: Date | undefined;
    onFromDateChange: (date: Date | undefined) => void;
    toDate: Date | undefined;
    onToDateChange: (date: Date | undefined) => void;
    onExport: () => void;
}

export const ActivityFilters: React.FC<ActivityFiltersProps> = ({
    selectedFilter,
    onFilterChange,
    fromDate,
    onFromDateChange,
    toDate,
    onToDateChange,
    onExport,
}) => {
    return (
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 mb-4">
            {/* from date */}
            <CustomDatePicker
              label="From"
              placeholder="Select from date"
              value={fromDate}
              onValueChange={onFromDateChange}
            />
  
            {/* to date */}
            <CustomDatePicker
              label="To"
              placeholder="Select to date"
              value={toDate}
              onValueChange={onToDateChange}
            />
  
            {/* activity type filter */}
            <CustomDropdown
              label="Filter"
              value={selectedFilter}
              options={[
                { value: "All", label: "All" },
                { value: "Buy", label: "Buy" },
                { value: "Sell", label: "Sell" },
              ]}
              // explicitly cast the value back to the expected type
              onValueChange={(value) => onFilterChange(value as ActivityFilterType)}
              className="min-w-[120px] w-full sm:w-auto"
            />
  
            {/* export button */}
            <Button2 label="Export" onClick={onExport}>
              <Download />
              Export
            </Button2>
        </div>
    );
};
