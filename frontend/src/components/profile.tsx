import { Tile } from "@/components/tile";

export default function Profile() {
  return (
    <div className="fixed top-8 right-8 w-52 h-16">
      <Tile className="w-full h-full flex items-center gap-2">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white text-base font-semibold">CM</span>
        </div>
        <div className="flex flex-col">
          <span className="text-base font-medium">Connor Morrison</span>
          <span className="text-sm text-gray-500">@connormorrison</span>
        </div>
      </Tile>
    </div>
  );
}