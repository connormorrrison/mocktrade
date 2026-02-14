import React from 'react';
import { Plus } from "lucide-react";
import { Button2 } from "@/components/Button2";
import { TextField } from "@/components/TextField";
import { Title2 } from "@/components/Title2";
import { PopInOutEffect } from "@/components/PopInOutEffect";
import { CustomError } from "@/components/CustomError";

interface AddStockFormProps {
    newSymbol: string;
    onSymbolChange: (value: string) => void;
    onAdd: () => void;
    isAdding: boolean;
    error: string | null;
    onClearError: () => void;
}

export const AddStockForm: React.FC<AddStockFormProps> = ({
    newSymbol,
    onSymbolChange,
    onAdd,
    isAdding,
    error,
    onClearError,
}) => {

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            if (!isAdding) {
                onAdd();
            }
        }
    };
    
    let isButtonDisabled: boolean;
    if (isAdding) {
        isButtonDisabled = true;
    } else if (!newSymbol.trim()) {
        isButtonDisabled = true;
    } else {
        isButtonDisabled = false;
    }
    
    let buttonText: string;
    if (isAdding) {
        buttonText = "Adding...";
    } else {
        buttonText = "Add";
    }

    return (
        <PopInOutEffect isVisible={true} delay={50}>
            <div>
                <Title2>Add Stock</Title2>
                <div className="flex gap-4">
                    <TextField
                        placeholder="Enter symbol (e.g., AAPL)"
                        value={newSymbol}
                        uppercase
                        onChange={(e) => onSymbolChange(e.target.value)}
                        className="flex-1"
                        onKeyDown={handleKeyDown}
                        disabled={isAdding}
                    />
                    <Button2 onClick={onAdd} disabled={isButtonDisabled}>
                        <Plus />
                        {buttonText}
                    </Button2>
                </div>
                <CustomError error={error} onClose={onClearError} />
            </div>
        </PopInOutEffect>
    );
};
