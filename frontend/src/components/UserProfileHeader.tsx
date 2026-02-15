import { Text2 } from "@/components/Text2";
import { Text4 } from "@/components/Text4";
import { ProfilePicture } from "@/components/ProfilePicture";

interface UserProfileHeaderProps {
  firstName?: string;
  lastName?: string;
  username: string;
  joinedDate?: string;
  variant?: "profile" | "public"; // profile = own profile, public = viewing another user
}

export function UserProfileHeader({ firstName, lastName, username, joinedDate, variant = "profile" }: UserProfileHeaderProps) {
  const formatJoinDate = (dateString?: string) => {
    if (!dateString) return "Joined recently";

    const date = new Date(dateString);
    return `Joined ${date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    })}`;
  };

  return (
    <div className="flex items-center gap-4">
      <ProfilePicture size="lg" className="!w-16 !h-16" />
      <div className="flex flex-col">
        {variant === "profile" ? (
          // own profile: show name + username
          <>
            {firstName && lastName ? (
              <>
                <Text2>{firstName} {lastName}</Text2>
                <Text4 className="text-muted-foreground">@{username}</Text4>
              </>
            ) : (
              <Text2>@{username}</Text2>
            )}
          </>
        ) : (
          // public profile: show username + join date
          <>
            <Text2>@{username}</Text2>
            <Text4 className="text-muted-foreground">{formatJoinDate(joinedDate)}</Text4>
          </>
        )}
      </div>
    </div>
  );
}