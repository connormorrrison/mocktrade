import { Text2 } from "@/components/text-2";
import { Text4 } from "@/components/text-4";
import { Tile } from "@/components/tile";
import { formatMoney } from "@/lib/format-money";

interface UserProfileTilesProps {
  totalValue: number;
  positionsValue: number;
  cashBalance: number;
  activityCount: number;
}

export function UserProfileTiles({ 
  totalValue, 
  positionsValue,
  cashBalance, 
  activityCount 
}: UserProfileTilesProps) {
  const startingValue = 100000;
  const profitLoss = totalValue - startingValue;
  const cumulativeReturn = ((totalValue - startingValue) / startingValue) * 100;

  return (
    <div className="flex flex-col gap-4">
      {/* Performance Tiles - Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Profit/Loss */}
        <Tile>
          <div className="p-2">
            <Text4>Profit/Loss</Text4>
            <Text2 variant={profitLoss >= 0 ? "green" : "red"}>
              {profitLoss >= 0
                ? `+${formatMoney(profitLoss)}`
                : formatMoney(profitLoss)}
            </Text2>
          </div>
        </Tile>

        {/* Return */}
        <Tile>
          <div className="p-2">
            <Text4>Return</Text4>
            <Text2 variant={cumulativeReturn >= 0 ? "green" : "red"}>
              {cumulativeReturn >= 0
                ? `+${cumulativeReturn.toFixed(2)}%`
                : `${cumulativeReturn.toFixed(2)}%`}
            </Text2>
          </div>
        </Tile>
      </div>

      {/* Portfolio Tiles - Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Portfolio Value */}
        <Tile>
          <div className="p-2">
            <Text4>Portfolio Value</Text4>
            <Text2>{formatMoney(totalValue)}</Text2>
          </div>
        </Tile>

        {/* Positions Value */}
        <Tile>
          <div className="p-2">
            <Text4>Positions Value</Text4>
            <Text2>{formatMoney(positionsValue)}</Text2>
          </div>
        </Tile>

        {/* Cash Balance */}
        <Tile>
          <div className="p-2">
            <Text4>Cash Balance</Text4>
            <Text2>{formatMoney(cashBalance)}</Text2>
          </div>
        </Tile>

        {/* Total Trades */}
        <Tile>
          <div className="p-2">
            <Text4>Total Trades</Text4>
            <Text2>{activityCount}</Text2>
          </div>
        </Tile>
      </div>
    </div>
  );
}