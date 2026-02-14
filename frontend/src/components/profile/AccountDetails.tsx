import React from 'react';
import { Text5 } from "@/components/Text5";
import { Title2 } from "@/components/Title2";
import { Title3 } from "@/components/Title3";
import { PopInOutEffect } from "@/components/PopInOutEffect";

interface AccountDetailsProps {
    joinedDate: string;
}

export const AccountDetails: React.FC<AccountDetailsProps> = ({ joinedDate }) => {
    let displayDate: string;
    
    if (joinedDate) {
        displayDate = new Date(joinedDate).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric', 
            year: 'numeric'
        });
    } else {
        displayDate = 'Unknown';
    }

    return (
        <PopInOutEffect isVisible={true} delay={200}>
            <div>
                <Title2>Account Details</Title2>
                <div>
                    <Title3>Joined</Title3>
                    <Text5>
                        {displayDate}
                    </Text5>
                </div>
            </div>
        </PopInOutEffect>
    );
};
