import { useState } from "react";

/**
 * this hook manages the state and api logic for
 * the "change password" form.
 */
export const usePasswordForm = () => {
    // state for form fields
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    // state for ui logic
    const [isChanging, setIsChanging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const clearForm = () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
    };

    const handleStartChange = () => {
        setIsChanging(true);
        setError(null);
    };

    const handleCancel = () => {
        setIsChanging(false);
        setError(null);
        clearForm();
    };

    const handleSave = async () => {
        // 1. validation
        if (newPassword !== confirmPassword) {
            setError('new passwords do not match');
            return;
        }
        if (newPassword.length < 8) {
            setError('new password must be at least 8 characters long');
            return;
        }

        setIsLoading(true);
        setError(null);

        // 2. api call
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('no authentication token found');
            }

            const response = await fetch(import.meta.env.VITE_API_URL + "/auth/change-password", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': "Bearer " + token,
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword,
                }),
            });

            if (response.ok) {
                setIsChanging(false);
                clearForm();
            } else {
                const errorData = await response.json();
                let errorMessage: string;
                if (errorData.detail) {
                    errorMessage = errorData.detail;
                } else {
                    errorMessage = 'failed to change password';
                }
                throw new Error(errorMessage);
            }
        } catch (err) {
            let errorMessage: string;
            if (err instanceof Error) {
                errorMessage = err.message;
            } else {
                errorMessage = 'failed to change password';
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    
    return {
        currentPassword, setCurrentPassword,
        newPassword, setNewPassword,
        confirmPassword, setConfirmPassword,
        isChanging,
        isLoading,
        error,
        clearError: () => setError(null),
        handleStartChange,
        handleCancel,
        handleSave,
    };
};
