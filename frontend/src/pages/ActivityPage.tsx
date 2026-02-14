import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { CustomSkeleton } from "@/components/CustomSkeleton";

// import the new hooks
import { useActivities } from "@/lib/hooks/useActivities";
import { useFilteredActivities } from "@/lib/hooks/useFilteredActivities";

// import the new utility
import { exportActivitiesToCsv } from "@/lib/utils/exportCsv";

// import the new presentational components
import { ActivityFilters } from "@/components/activity/ActivityFilters";
import { ActivityDisplay } from "@/components/activity/ActivityDisplay";

export default function ActivityPage() {
    // date state lives here so it can feed both the API hook and the filters UI
    const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
    const [toDate, setToDate] = useState<Date | undefined>(undefined);

    // data fetching hook (dates are sent to the server for filtering)
    const { activities, isLoading, isLoadingMore, error, setError, hasMore, loadMore } = useActivities(fromDate, toDate);

    // client-side type filtering (Buy/Sell/All)
    const {
        selectedFilter,
        setSelectedFilter,
        filteredActivities,
    } = useFilteredActivities(activities);

    // --- event handlers ---
    const handleExport = () => {
        exportActivitiesToCsv(filteredActivities);
    };

    // --- render loading state ---
    if (isLoading) {
        return (
            <PageLayout title="Activity">
                <CustomSkeleton />
            </PageLayout>
        );
    }

    // --- render success state ---
    return (
        <PageLayout title="Activity">

            {/* section 1: filters and export button */}
            <ActivityFilters
                selectedFilter={selectedFilter}
                onFilterChange={setSelectedFilter}
                fromDate={fromDate}
                onFromDateChange={setFromDate}
                toDate={toDate}
                onToDateChange={setToDate}
                onExport={handleExport}
            />

            {/* section 2: activity table display */}
            <ActivityDisplay
                activities={filteredActivities}
                isLoading={isLoading}
                isLoadingMore={isLoadingMore}
                error={error}
                onClearError={() => setError(null)}
                hasMore={hasMore}
                onLoadMore={loadMore}
            />

        </PageLayout>
    );
}
