import React from 'react';
import { ActivityTable } from "@/components/activity-table";
import { ErrorTile } from "@/components/error-tile";
import type { Activity } from "@/lib/types/activity";

interface ActivityDisplayProps {
    activities: Activity[];
    isLoading: boolean; // keep this prop if ActivityTable needs it
    error: string | null;
}

export const ActivityDisplay: React.FC<ActivityDisplayProps> = ({
    activities,
    isLoading,
    error,
}) => {
    return (
        <div className="overflow-hidden"> 
            {/* display error if present */}
            {error && (
              <ErrorTile description={error} className="mb-4" />
            )}

            {/* activity table */}
            <ActivityTable 
              activities={activities} 
              isLoading={isLoading} // pass loading state down
            />
        </div>
    );
};
