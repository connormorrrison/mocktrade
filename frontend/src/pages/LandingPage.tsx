import { Link } from "react-router-dom";
import { PublicLayout } from "@/components/PublicLayout";
import { Button1 } from "@/components/Button1";
import { StockChartAnimation } from "@/components/StockChartAnimation";
import { Text1 } from "@/components/Text1";
import { Text6 } from "@/components/Text6";

export default function LandingPage() {
  return (
    <PublicLayout showAuthButtons={true}>
      <div className="relative flex items-center justify-center lg:min-h-screen pb-8 lg:pb-0 px-8">
        <div className="w-full max-w-7xl mx-auto overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
            <div className="relative z-10 text-left lg:text-left space-y-6 max-w-2xl mx-auto">
              <div className="flex justify-center lg:justify-start">
              </div>
              <div className="space-y-4">
                <Text1 className="!leading-tight">
                  Trade risk-free in real-time.<br />
                  <span>
                    Only on MockTrade.
                  </span>
                </Text1>
                
                <Text6>
                  Practice trading stocks, ETFs, crypto, and more with $100,000 in virtual cash. Learn from real market data and build your investing skills risk-free.
                </Text6>
              </div>
              
              <div className="flex justify-center lg:justify-start">
                <Link to="/signup">
                  <Button1>
                    Start Trading
                  </Button1>
                </Link>
              </div>
            </div>
            
            <div className="flex justify-center lg:justify-end -mt-20 lg:mt-0">
              <div className="w-full max-w-md lg:max-w-none">
                <StockChartAnimation />
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}