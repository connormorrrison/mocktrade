import { Tile } from "@/components/tile";

export default function BlackBox() {
  return (
    <div className="fixed top-4 right-4 w-52 h-16 bg-black rounded-xl">
      <Tile className="h-full w-full">
        <div></div>
      </Tile>
    </div>
  );
}