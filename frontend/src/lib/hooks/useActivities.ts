import { useState, useEffect, useCallback } from "react";
import type { Activity } from "@/lib/types/activity";

/**
 * this hook fetches the user's trading activities from the api
 * with pagination support, optional date filtering, and manages
 * the loading and error states.
 */
export const useActivities = (fromDate?: Date, toDate?: Date) => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(0);

    const LIMIT = 10; // Load 10 activities at a time

    const fetchActivities = useCallback(async (reset: boolean = false) => {
        if (reset) {
            setIsLoading(true);
            setOffset(0);
        } else {
            setIsLoadingMore(true);
        }
        setError(null);

        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                // not logged in, show empty list
                setActivities([]);
                setHasMore(false);
                return;
            }

            const currentOffset = reset ? 0 : offset;
            const params = new URLSearchParams({
                limit: String(LIMIT),
                offset: String(currentOffset),
            });

            if (fromDate) {
                params.set("from_date", fromDate.toISOString().split("T")[0]);
            }
            if (toDate) {
                params.set("to_date", toDate.toISOString().split("T")[0]);
            }

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/trading/activities?${params}`,
                {
                    headers: { Authorization: "Bearer " + token },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch activities');
            }

            const data = await response.json();

            // basic validation and mapping
            const validActivities = data.map((tx: any): Activity => ({
                id: tx.id,
                symbol: tx.symbol,
                action: tx.action?.toUpperCase(), // ensure uppercase
                quantity: tx.quantity,
                price: tx.price,
                total_amount: tx.total_amount,
                created_at: tx.created_at,
            }));

            if (reset) {
                setActivities(validActivities);
                setOffset(LIMIT);
            } else {
                setActivities(prev => [...prev, ...validActivities]);
                setOffset(prev => prev + LIMIT);
            }

            // If we got fewer items than the limit, there's no more data
            setHasMore(validActivities.length === LIMIT);
        } catch (err) {
            console.error('Error fetching activities:', err);
            let errorMessage: string;
            if (err instanceof Error) {
                errorMessage = err.message;
            } else {
                errorMessage = 'Unable to load activities';
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, [offset, fromDate, toDate]);

    const loadMore = useCallback(() => {
        if (!isLoadingMore && hasMore) {
            fetchActivities(false);
        }
    }, [fetchActivities, isLoadingMore, hasMore]);

    // re-fetch from scratch when dates change or on initial mount
    useEffect(() => {
        fetchActivities(true);
    }, [fromDate, toDate]); // eslint-disable-line react-hooks/exhaustive-deps

    return { activities, isLoading, isLoadingMore, error, setError, hasMore, loadMore };
};
