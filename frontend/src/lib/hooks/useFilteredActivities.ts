import { useState, useMemo } from "react";
import type { Activity, ActivityFilterType } from "@/lib/types/activity";

/**
 * this hook manages the type filter state (Buy/Sell/All) and
 * performs client-side type filtering of activities.
 * date filtering is handled server-side via useActivities.
 */
export const useFilteredActivities = (activities: Activity[]) => {
    const [selectedFilter, setSelectedFilter] = useState<ActivityFilterType>("All");

    const filteredActivities = useMemo(() => {
        if (selectedFilter === "All") return activities;

        const filterValue = selectedFilter === "Buy" ? "BUY" : "SELL";
        return activities.filter(tx => tx.action === filterValue);
    }, [activities, selectedFilter]);

    return {
        selectedFilter,
        setSelectedFilter,
        filteredActivities,
    };
};
