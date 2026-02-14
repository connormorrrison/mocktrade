import React from 'react';
import { Trash2 } from "lucide-react";
import { Button1 } from "@/components/Button1";
import { Title2 } from "@/components/Title2";
import { CustomError } from "@/components/CustomError";
import { PopInOutEffect } from "@/components/PopInOutEffect";
import { useDeleteAccount } from "@/lib/hooks/useDeleteAccount";

export const DeleteAccount: React.FC = () => {
    // call the hook to get all state and logic
    const { isLoading, error, clearError, handleDelete } = useDeleteAccount();

    return (
        <PopInOutEffect isVisible={true} delay={250}>
            <div>
                <Title2>Delete Account</Title2>
                <Button1 
                    onClick={handleDelete} 
                    className="!bg-red-600 hover:!bg-red-700"
                    disabled={isLoading}
                >
                    <Trash2 />
                    {isLoading ? "Deleting..." : "Delete Account"}
                </Button1>
                {/* error dialog for this section only */}
                <CustomError error={error} onClose={clearError} />
            </div>
        </PopInOutEffect>
    );
};
