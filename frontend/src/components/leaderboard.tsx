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
            <div key={user.username} className="flex flex-wrap items-center justify-between hover:bg-zinc-700 p-2 rounded-xl cursor-pointer min-w-0">
              <div className="flex items-center gap-4">
                <ProfilePicture size="sm" className="flex-shrink-0" />
                <div>
                  <Text5>@{user.username}</Text5>
                </div>
              </div>
              <Text5 variant="green">
                {formatValue(type === "return" ? user.return : user.profit)}
              </Text5>
            </div>
          ))}
        </div>
      </div>
    </Tile>
  );
}