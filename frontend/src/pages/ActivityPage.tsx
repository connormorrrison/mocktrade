import { PageLayout } from "@/components/page-layout";
import { CustomSkeleton } from "@/components/custom-skeleton";

// import the new hooks
import { useActivities } from "@/lib/hooks/useActivities";
import { useFilteredActivities } from "@/lib/hooks/useFilteredActivities";

// import the new utility
import { exportActivitiesToCsv } from "@/lib/utils/exportCsv";

// import the new presentational components
import { ActivityFilters } from "@/components/activity/ActivityFilters";
import { ActivityDisplay } from "@/components/activity/ActivityDisplay";

export default function ActivityPage() {
    // data fetching hook
    const { activities, isLoading, error } = useActivities();

    // filtering hook
    const {
        selectedFilter,
        setSelectedFilter,
        fromDate,
        setFromDate,
        toDate,
        setToDate,
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
                isLoading={isLoading} // pass down if needed by table
                error={error}
            />
            
        </PageLayout>
    );
}