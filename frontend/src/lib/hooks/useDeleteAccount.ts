import { useState } from "react";

/**
 * this hook manages the state and api logic
 * for the "delete account" button.
 */
export const useDeleteAccount = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        // 1. confirm with user
        if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            setIsLoading(true);
            setError(null);

            // 2. api call
            try {
                const token = localStorage.getItem('access_token');
                if (!token) {
                    throw new Error('no authentication token found');
                }

                const response = await fetch(import.meta.env.VITE_API_URL + "/auth/me", {
                    method: 'DELETE',
                    headers: { 'Authorization': "Bearer " + token },
                });

                if (response.ok) {
                    // 3. success: clear token and redirect to home
                    localStorage.removeItem('access_token');
                    window.location.href = '/';
                } else {
                    const errorData = await response.json();
                    let errorMessage: string;
                    if (errorData.detail) {
                        errorMessage = errorData.detail;
                    } else {
                        errorMessage = 'failed to delete account';
                    }
                    throw new Error(errorMessage);
                }
            } catch (err) {
                let errorMessage: string;
                if (err instanceof Error) {
                    errorMessage = err.message;
                } else {
                    errorMessage = 'failed to delete account';
                }
                setError(errorMessage);
                setIsLoading(false); // stop loading on error
            }
            // no finally block, because on success we redirect
        }
    };

    return { isLoading, error, clearError: () => setError(null), handleDelete };
};
