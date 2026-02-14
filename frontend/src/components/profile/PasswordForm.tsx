import React from 'react';
import { Lock } from "lucide-react";
import { Button1 } from "@/components/Button1";
import { Button2 } from "@/components/Button2";
import { TextField } from "@/components/TextField";
import { Title2 } from "@/components/Title2";
import { CustomError } from "@/components/CustomError";
import { PopInOutEffect } from "@/components/PopInOutEffect";
import { usePasswordForm } from "@/lib/hooks/usePasswordForm";

export const PasswordForm: React.FC = () => {
    // call the hook to get all state and logic
    const {
        currentPassword, setCurrentPassword,
        newPassword, setNewPassword,
        confirmPassword, setConfirmPassword,
        isChanging,
        isLoading,
        error,
        clearError,
        handleStartChange,
        handleCancel,
        handleSave,
    } = usePasswordForm();
    
    let saveButtonText: string;
    if (isLoading) {
        saveButtonText = "Changing...";
    } else {
        saveButtonText = "Change Password";
    }

    return (
        <PopInOutEffect isVisible={true} delay={150}>
            <div>
                <Title2>Security</Title2>
                <div className="space-y-4">
                    {isChanging === false ? (
                        // button to show the form
                        <Button2 onClick={handleStartChange}>
                            <Lock />
                            Change Password
                        </Button2>
                    ) : (
                        // the change password form
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 max-w-md">
                                <TextField
                                    label="Current Password"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Enter current password"
                                />
                                <TextField
                                    label="New Password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password (min 8 characters)"
                                />
                                <TextField
                                    label="Confirm New Password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button1 onClick={handleSave} disabled={isLoading}>
                                    {saveButtonText}
                                </Button1>
                                <Button2 onClick={handleCancel} disabled={isLoading}>
                                    Cancel
                                </Button2>
                            </div>
                        </div>
                    )}
                </div>
                {/* error dialog for this section only */}
                <CustomError error={error} onClose={clearError} />
            </div>
        </PopInOutEffect>
    );
};
