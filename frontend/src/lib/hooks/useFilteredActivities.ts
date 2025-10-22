import { useState, useMemo } from "react";
import type { Activity, ActivityFilterType } from "@/lib/types/activity";

// helper to get start of day
const getStartOfDay = (date: Date): Date => {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
};
  
// helper to get end of day
const getEndOfDay = (date: Date): Date => {
    const newDate = new Date(date);
    newDate.setHours(23, 59, 59, 999);
    return newDate;
};
  
/**
 * this hook manages the filter states (type, date range) and
 * performs the client-side filtering of activities.
 */
export const useFilteredActivities = (activities: Activity[]) => {
    const [selectedFilter, setSelectedFilter] = useState<ActivityFilterType>("All");
    const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
    const [toDate, setToDate] = useState<Date | undefined>(undefined);

    const filteredActivities = useMemo(() => {
        return activities.filter(tx => {
            const txDate = new Date(tx.created_at);
            
            // prepare date boundaries safely
            let from: Date | null = null;
            if (fromDate) {
                from = getStartOfDay(fromDate);
            }
            
            let to: Date | null = null;
            if (toDate) {
                to = getEndOfDay(toDate);
            }

            // apply date filters
            if (from !== null && txDate < from) {
                return false;
            }
            if (to !== null && txDate > to) {
                return false;
            }
            // handle invalid date range (from > to)
            if (from !== null && to !== null && from > to) {
                return false;
            }

            // apply type filter
            let filterValue: 'BUY' | 'SELL' | 'All';
            if (selectedFilter === 'Buy') {
                filterValue = 'BUY';
            } else if (selectedFilter === 'Sell') {
                filterValue = 'SELL';
            } else {
                filterValue = 'All';
            }
            
            if (filterValue !== 'All' && tx.action !== filterValue) {
                return false;
            }

            // if all checks pass, include the activity
            return true;
        });
    }, [activities, selectedFilter, fromDate, toDate]);

    return {
        selectedFilter,
        setSelectedFilter,
        fromDate,
        setFromDate,
        toDate,
        setToDate,
        filteredActivities,
    };
};
