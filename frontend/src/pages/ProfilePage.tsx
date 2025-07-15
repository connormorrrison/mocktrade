import { Tile } from "@/components/tile";
import { SecondaryButton } from "@/components/secondary-button";
import { TextField } from "@/components/text-field";
import { SecondaryTitle } from "@/components/secondary-title";
import { PrimaryTitle } from "@/components/primary-title";
import { TertiaryTitle } from "@/components/tertiary-title";
import SlideUpAnimation from "@/components/slide-up-animation";
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
      <SlideUpAnimation>
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
                  <TertiaryTitle className="mb-2">First Name</TertiaryTitle>
                  <TextField
                    value={profile.first_name}
                    disabled
                  />
                </div>
                <div>
                  <TertiaryTitle className="mb-2">Last Name</TertiaryTitle>
                  <TextField
                    value={profile.last_name}
                    disabled
                  />
                </div>
                <div>
                  <TertiaryTitle className="mb-2">Email</TertiaryTitle>
                  <TextField
                    value={profile.email}
                    disabled
                  />
                </div>
                <div>
                  <TertiaryTitle className="mb-2">Username</TertiaryTitle>
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
                <TertiaryTitle className="mb-2">Joined</TertiaryTitle>
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
      </SlideUpAnimation>
    </div>
  );
}