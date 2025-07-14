import { Tile } from "@/components/tile";

export default function HomePage() {
  return (
    <div className="flex flex-col justify-center items-center h-full">
      {/* Welcome Message Block */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
        <Tile className="col-span-1 sm:col-span-2 lg:col-span-3 hover:scale-[1.02]">
          <div className="text-center">
            <h1 className="text-4xl font-medium text-blue-700 -mb-2 mt-2">
              Good morning, John
            </h1>
            <p className="text-lg font-normal mb-2 mt-4">
              Today is January 15, 2025
            </p>
          </div>
        </Tile>
      </div>
  
      {/* Market Indices Header Block */}
      <div className="w-full max-w-4xl mt-8 flex justify-start">
        <Tile className="hover:scale-[1.02]">
          <div className="py-2">
            <h2 className="text-lg font-medium flex items-center gap-2">
              <span className="mr-3">Market Indices</span>
              <span className="h-3 w-3 rounded-full bg-red-500" />
              <span className="text-red-600 text-base font-normal">Market Closed</span>
            </h2>
          </div>
        </Tile>
      </div>
  
      {/* Indices Grid Block */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
        <Tile className="hover:scale-[1.02]">
          <div>
            <h3 className="text-lg font-medium mb-4">DJIA (^DJI)</h3>
            <p className="text-green-600 text-base font-normal mr-2">Latest price</p>
            <p className="text-3xl font-normal">$34,256.78</p>
          </div>
        </Tile>
  
        <Tile className="hover:scale-[1.02]">
          <div>
            <h3 className="text-lg font-medium mb-4">S&P 500 (^GSPC)</h3>
            <p className="text-green-600 text-base font-normal mr-2">Latest price</p>
            <p className="text-3xl font-normal">$4,456.24</p>
          </div>
        </Tile>
  
        <Tile className="hover:scale-[1.02]">
          <div>
            <h3 className="text-lg font-medium mb-4">Nasdaq Composite (^IXIC)</h3>
            <p className="text-green-600 text-base font-normal mr-2">Latest price</p>
            <p className="text-3xl font-normal">$13,567.89</p>
          </div>
        </Tile>
      </div>
    </div>
  );
}