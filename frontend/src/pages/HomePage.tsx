import { Tile } from "@/components/tile"

export default function HomePage() {
  return (
    <div className="p-8">
      <Tile>
        <h2 className="text-xl font-semibold mb-2">Welcome to MockTrade</h2>
        <p className="text-muted-foreground">Your trading dashboard</p>
      </Tile>
    </div>
  )
}