import React from 'react';
import { Title2 } from "@/components/title-2";
import { UserProfileTiles } from "@/components/user-profile-tiles";
import { PopInOutEffect } from "@/components/pop-in-out-effect";

interface PortfolioOverviewProps {
  totalValue: number;
  positionsValue: number;
  cashBalance: number;
  activityCount: number;
  isVisible: boolean;
}

export const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({
  totalValue,
  positionsValue,
  cashBalance,
  activityCount,
  isVisible,
}) => {
  return (
    <PopInOutEffect isVisible={isVisible} delay={50}>
      <div className="space-y-2">
        <Title2>Overview</Title2>
        <UserProfileTiles
          totalValue={totalValue}
          positionsValue={positionsValue}
          cashBalance={cashBalance}
          activityCount={activityCount}
        />
      </div>
    </PopInOutEffect>
  );
};
