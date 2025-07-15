import { Tile } from "@/components/tile";
import { SecondaryButton } from "@/components/secondary-button";
import { TextField } from "@/components/text-field";
import { SecondaryTitle } from "@/components/secondary-title";
import { PrimaryTitle } from "@/components/primary-title";
import { Lock, Settings2 } from "lucide-react";

export default function ProfilePage() {
  // Mock data
  const profile = {
    first_name: "Connor",
    last_name: "Morrison",
    email: "connor.morrison@example.com",
    username: "connormorrison",
    created_at: "2024-01-15T00:00:00Z"
  };

  return (
    <div className="w-full" style={{ marginTop: '0px' }}>
      <Tile className="w-full shadow-lg hover:shadow-xl transition-shadow">
        <div className="p-6">
          <PrimaryTitle>Profile</PrimaryTitle>
          
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="flex items-center justify-between mb-6">
              <SecondaryButton>
                <Settings2 size={20} className="flex-shrink-0" />
                Edit Profile
              </SecondaryButton>
            </div>

            {/* Personal Information */}
            <div>
              <SecondaryTitle>Personal Information</SecondaryTitle>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-base text-zinc-400 mb-2">First Name</label>
                  <TextField
                    value={profile.first_name}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-base text-zinc-400 mb-2">Last Name</label>
                  <TextField
                    value={profile.last_name}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-base text-zinc-400 mb-2">Email</label>
                  <TextField
                    value={profile.email}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-base text-zinc-400 mb-2">Username</label>
                  <TextField
                    value={profile.username}
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div>
              <SecondaryTitle>Account Details</SecondaryTitle>
              <div>
                <label className="block text-base text-zinc-400 mb-2">Joined</label>
                <p className="text-lg">
                  {new Date(profile.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric', 
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Security */}
            <div>
              <SecondaryTitle className="!text-xl">Security</SecondaryTitle>
              <SecondaryButton>
                <Lock size={20} className="flex-shrink-0" />
                Change Password
              </SecondaryButton>
            </div>
          </div>
        </div>
      </Tile>
    </div>
  );
}