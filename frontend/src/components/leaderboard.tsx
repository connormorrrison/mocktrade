import { Link } from "react-router-dom";
import { Title2 } from "@/components/title-2";
import { Text5 } from "@/components/text-5";
import { Tile } from "@/components/tile";
import { ProfilePicture } from "@/components/profile-picture";

interface LeaderboardUser {
  username: string;
  return: number;
  profit: number;
}

interface LeaderboardProps {
  title: string;
  users: LeaderboardUser[];
  type: "return" | "profit";
  formatValue: (value: number) => string;
}

export function Leaderboard({ title, users, type, formatValue }: LeaderboardProps) {
  return (
    <Tile className="w-full max-w-md">
      <div className="py-2 px-2">
        <Title2>{title}</Title2>
        <div className="space-y-2">
          {users.map((user) => (
            <Link key={user.username} to={`/leaderboard/${user.username}`} className="flex items-center justify-between hover:bg-zinc-700 p-2 rounded-xl cursor-pointer min-w-0 gap-2">
              <div className="flex items-center gap-4 min-w-0 flex-1 overflow-hidden">
                <ProfilePicture size="sm" className="flex-shrink-0" />
                <div className="min-w-0 overflow-hidden">
                  <Text5 className="truncate">@{user.username}</Text5>
                </div>
              </div>
              <Text5 variant="green" className="whitespace-nowrap flex-shrink-0">
                {formatValue(type === "return" ? user.return : user.profit)}
              </Text5>
            </Link>
          ))}
        </div>
      </div>
    </Tile>
  );
}