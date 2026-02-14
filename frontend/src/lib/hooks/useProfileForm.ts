import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";

/**
 * this hook manages the state and api logic for editing
 * the user's personal information.
 */
export const useProfileForm = () => {
    // get user context
    const { userData, refreshUserData } = useUser();
    
    // state for form fields
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");

    // state for ui logic
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // sync form state when user data loads
    useEffect(() => {
        if (userData) {
            setFirstName(userData.first_name);
            setLastName(userData.last_name);
            setEmail(userData.email);
            setUsername(userData.username);
        }
    }, [userData]);

    // resets form fields to their original state
    const resetForm = () => {
        if (userData) {
            setFirstName(userData.first_name);
            setLastName(userData.last_name);
            setEmail(userData.email);
            setUsername(userData.username);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
        setError(null);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setError(null);
        resetForm();
    };

    const handleSave = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('no authentication token found');
            }

            const response = await fetch(import.meta.env.VITE_API_URL + "/auth/profile", {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': "Bearer " + token,
                },
                body: JSON.stringify({
                    email: email,
                    username: username,
                    first_name: firstName,
                    last_name: lastName,
                }),
            });

            if (response.ok) {
                setIsEditing(false);
                refreshUserData(); // refresh global user state
            } else {
                const errorData = await response.json();
                let errorMessage: string;
                if (errorData.detail) {
                    errorMessage = errorData.detail;
                } else {
                    errorMessage = 'failed to update profile';
                }
                throw new Error(errorMessage);
            }
        } catch (err) {
            let errorMessage: string;
            if (err instanceof Error) {
                errorMessage = err.message;
            } else {
                errorMessage = 'failed to update profile';
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        firstName, setFirstName,
        lastName, setLastName,
        email, setEmail,
        username, setUsername,
        isEditing,
        isLoading,
        error,
        clearError: () => setError(null),
        handleEdit,
        handleCancel,
        handleSave,
    };
};
