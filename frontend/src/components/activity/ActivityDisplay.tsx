import React from 'react';
import { ActivityTable } from "@/components/ActivityTable";
import { CustomError } from "@/components/CustomError";
import { Button2 } from "@/components/Button2";
import type { Activity } from "@/lib/types/activity";

interface ActivityDisplayProps {
    activities: Activity[];
    isLoading: boolean;
    isLoadingMore?: boolean;
    error: string | null;
    onClearError: () => void;
    hasMore?: boolean;
    onLoadMore?: () => void;
}

export const ActivityDisplay: React.FC<ActivityDisplayProps> = ({
    activities,
    isLoading,
    isLoadingMore = false,
    error,
    onClearError,
    hasMore = false,
    onLoadMore,
}) => {
    return (
        <div className="overflow-hidden">
            {/* display error if present */}
            <CustomError error={error} onClose={onClearError} />

            {/* activity table */}
            <ActivityTable
              activities={activities}
              isLoading={isLoading}
            />

            {/* load more button */}
            {!isLoading && hasMore && onLoadMore && (
              <div className="flex justify-center mt-4">
                <Button2
                  onClick={onLoadMore}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? "Loading..." : "Load More"}
                </Button2>
              </div>
            )}
        </div>
    );
};
