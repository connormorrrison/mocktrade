import React from 'react';
import { Trash2 } from "lucide-react";
import { Button1 } from "@/components/button-1";
import { Title2 } from "@/components/title-2";
import { ErrorTile } from "@/components/error-tile";
import { PopInOutEffect } from "@/components/pop-in-out-effect";
import { useDeleteAccount } from "@/lib/hooks/useDeleteAccount";

export const DeleteAccount: React.FC = () => {
    // call the hook to get all state and logic
    const { isLoading, error, handleDelete } = useDeleteAccount();

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
                {/* error tile for this section only */}
                <ErrorTile description={error} className="mt-4" />
            </div>
        </PopInOutEffect>
    );
};
