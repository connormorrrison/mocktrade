import React from 'react';
import { Settings2 } from "lucide-react";
import { Button1 } from "@/components/button-1";
import { Button2 } from "@/components/button-2";
import { TextField } from "@/components/text-field";
import { Title2 } from "@/components/title-2";
import { ErrorTile } from "@/components/error-tile";
import { PopInOutEffect } from "@/components/pop-in-out-effect";
import { useProfileForm } from "@/lib/hooks/useProfileForm";

export const ProfileForm: React.FC = () => {
    // call the hook to get all state and logic
    const {
        firstName, setFirstName,
        lastName, setLastName,
        email, setEmail,
        username, setUsername,
        isEditing,
        isLoading,
        error,
        handleEdit,
        handleCancel,
        handleSave,
    } = useProfileForm();

    let saveButtonText: string;
    if (isLoading) {
        saveButtonText = "Saving...";
    } else {
        saveButtonText = "Save Changes";
    }

    return (
        <PopInOutEffect isVisible={true} delay={100}>
            <div>
                <Title2>Personal Information</Title2>

                {/* edit/save buttons */}
                <div className="flex sm:flex-row items-start sm:items-center justify-start sm:justify-between mb-4">
                    {isEditing === false ? (
                        <Button2 onClick={handleEdit}>
                            <Settings2 />
                            Edit Profile
                        </Button2>
                    ) : (
                        <div className="flex gap-2">
                            <Button1 onClick={handleSave} disabled={isLoading}>
                                {saveButtonText}
                            </Button1>
                            <Button2 onClick={handleCancel} disabled={isLoading}>
                                Cancel
                            </Button2>
                        </div>
                    )}
                </div>
                
                {/* form fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TextField
                        label="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        disabled={!isEditing}
                    />
                    <TextField
                        label="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        disabled={!isEditing}
                    />
                    <TextField
                        label="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={!isEditing}
                    />
                    <TextField
                        label="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={!isEditing}
                    />
                </div>
                
                {/* error tile for this section only */}
                <ErrorTile description={error} className="mt-4" />
            </div>
        </PopInOutEffect>
    );
};
