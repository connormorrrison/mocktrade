import { useState, useEffect, useCallback } from "react";
import type { Activity } from "@/lib/types/activity";

/**
 * this hook fetches the user's trading activities from the api
 * and manages the loading and error states.
 */
export const useActivities = () => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchActivities = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                // not logged in, show empty list
                setActivities([]);
                return; 
            }

            const response = await fetch(import.meta.env.VITE_API_URL + "/trading/activities", {
                headers: { Authorization: "Bearer " + token },
            });

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

            setActivities(validActivities);
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
        }
    }, []); // this function is stable

    // fetch on initial mount
    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

    return { activities, isLoading, error };
};
