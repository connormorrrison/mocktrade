import { Text2 } from "@/components/Text2";
import { Text4 } from "@/components/Text4";
import { Tile } from "@/components/Tile";
import { formatMoney } from "@/lib/formatMoney";

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
      {/* performance tiles - row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* profit/loss */}
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

        {/* return */}
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

      {/* portfolio tiles - row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* portfolio value */}
        <Tile>
          <div className="p-2">
            <Text4>Portfolio Value</Text4>
            <Text2>{formatMoney(totalValue)}</Text2>
          </div>
        </Tile>

        {/* positions value */}
        <Tile>
          <div className="p-2">
            <Text4>Positions Value</Text4>
            <Text2>{formatMoney(positionsValue)}</Text2>
          </div>
        </Tile>

        {/* cash balance */}
        <Tile>
          <div className="p-2">
            <Text4>Cash Balance</Text4>
            <Text2>{formatMoney(cashBalance)}</Text2>
          </div>
        </Tile>

        {/* total trades */}
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