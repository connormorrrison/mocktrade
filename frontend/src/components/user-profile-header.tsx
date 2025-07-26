import { Text2 } from "@/components/text-2";
import { Text4 } from "@/components/text-4";
import { ProfilePicture } from "@/components/profile-picture";

interface UserProfileHeaderProps {
  firstName?: string;
  lastName?: string;
  username: string;
  joinedDate: string;
}

export function UserProfileHeader({ firstName, lastName, username, joinedDate }: UserProfileHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <ProfilePicture size="lg" className="!w-16 !h-16" />
      <div className="flex flex-col">
        {firstName && lastName ? (
          <>
            <Text2>{firstName} {lastName}</Text2>
            <Text4>@{username}</Text4>
          </>
        ) : (
          <>
            <Text2>@{username}</Text2>
            <Text4>
              Joined {new Date(joinedDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric', 
                year: 'numeric'
              })}
            </Text4>
          </>
        )}
      </div>
    </div>
  );
}