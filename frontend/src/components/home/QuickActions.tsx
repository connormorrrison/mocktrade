import React from 'react';
import { TrendingUp, Wallet, FileText, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button1 } from "@/components/Button1";
import { Title2 } from "@/components/Title2";

/**
 * displays the "quick actions" navigation buttons on the home page.
 */
export const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Title2>Quick Actions</Title2>
      <div className="flex flex-wrap gap-4">
        <Button1 onClick={() => navigate('/trade')}>
          <TrendingUp />
          New Trade
        </Button1>
        <Button1 onClick={() => navigate('/portfolio')}>
          <Wallet />
          View Portfolio
        </Button1>
        <Button1 onClick={() => navigate('/watchlist')}>
          <Eye />
          View Watchlist
        </Button1>
        <Button1 onClick={() => navigate('/activity')}>
          <FileText />
          View Activity
        </Button1>
      </div>
    </div>
  );
};
